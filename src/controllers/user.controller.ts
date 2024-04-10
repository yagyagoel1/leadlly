import mongoose from "mongoose";
import { User } from "../models/User.model";
import { ApiError } from "../util/ApiError";
import { asyncHandler } from "../util/asyncHandler";
import { generateAccessToken, generateRefreshToken } from "../util/generateTokens";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { mailOptionsType, sendOTP } from "../util/sendOTP";
import { OTP } from "../models/OTP.model";
import { ApiResponse } from "../util/ApiResponse";
import { emailSchema, nameSchema, otpSchema, passwordSchema, usernameSchema } from "../util/zodSchema";
import { sendEmail } from "../util/sendEmail";

// Function to generate access and refresh tokens
const generateAccessAndRefreshToken = async (userId: mongoose.Types.ObjectId) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new ApiError(400, "Some error occurred while fetching user");

    const accessToken = await generateAccessToken(user._id, user.email || "", user.username || "", user.fullName || "");
    const refreshToken = await generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token");
  }
};

// Register a new user
const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password, fullName } = req.body;

  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const validEmail = emailSchema.safeParse(email);
  const validUsername = usernameSchema.safeParse(username);
  const validPassword = passwordSchema.safeParse(password);

  if (!(validEmail && validPassword && validUsername)) throw new ApiError(400, "Enter valid inputs");

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) throw new ApiError(409, "User already exists");

  const user = await User.create({
    email,
    username,
    password,
    fullName,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const otpDetails: mailOptionsType = {
    id: createdUser._id,
    email: createdUser.email || "",
    subject: "Email verification",
    message: "Verify your email with code below",
    duration: 1,
  };

  const mail = await sendOTP(otpDetails);

  if (!mail) throw new ApiError(400, "Mail not sent");

  return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully, OTP sent successfully"));
});

// Log in a user
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!(email || username)) throw new ApiError(400, "Email or username is required");

  const validEmail = emailSchema.safeParse(email);
  const validPassword = passwordSchema.safeParse(password);
  const validUsername = usernameSchema.safeParse(username);

  if (!((validEmail || validUsername) && validPassword)) throw new ApiError(400, "Give proper inputs");

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) throw new ApiError(400, "User doesn't exist");

  if (!user.verified) throw new ApiError(400, "User is not verified");

  const isValidPassword = await bcrypt.compare(password, user?.password || "");

  if (!isValidPassword) throw new ApiError(400, "Invalid password");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: user.email || "",
    subject: "Login Detected",
    html: `<p>Hey, We detected a login from your account</p>`,
  };

  await sendEmail(mailOptions);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "User logged in successfully"));
});

// Log out a user
const logout = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
        accessToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json(new ApiResponse(200, {}, "User logged out"));
});

// Edit user details
const editUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, fullName } = req.body;

  if (!(username || fullName)) throw new ApiError(400, "Username or password is required");

  const validUsername = usernameSchema.safeParse(username);
  const validFullName = nameSchema.safeParse(fullName);

  if (!(validFullName || validUsername)) throw new ApiError(400, "Enter valid input");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        username,
      },
    },
    { new: true }
  ).select("-password -accessToken -refreshToken");

  return res.status(200).json(new ApiResponse(200, user || {}, "Account details are updated"));
});

// Change current password
const changeCurrentPassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) throw new ApiError(400, "Please give valid password");

  const validOldPassword = passwordSchema.safeParse(oldPassword);
  const validNewPassword = passwordSchema.safeParse(newPassword);

  if (!(validNewPassword && validOldPassword)) throw new ApiError(400, "Enter valid password (min length: 6)");

  const user = await User.findById(req.user?._id).select("-accessToken -refreshToken");

  if (!user) throw new ApiError(400, "User does not exist");

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user?.password || "");

  if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: user.email || "",
    subject: "Password Changed",
    html: `<p>Hey, Your password has been changed successfully</p>`,
  };

  await sendEmail(mailOptions);

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET || "");

    if (typeof decodedToken === "string") throw new ApiError(401, "Invalid token");

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken != user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
  } catch (error: any) {
    throw new ApiError(401, error.message || "Invalid token");
  }
});

// Verify OTP
const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!(email && otp)) {
      throw new ApiError(400, "Provide values for email and OTP");
    }

    const validEmail = emailSchema.safeParse(email);
    const validOtp = otpSchema.safeParse(otp);

    if (!(validEmail && validOtp)) throw new ApiError(400, "Please enter a valid email and OTP");

    const matchedOTPRecord = await OTP.findOne({ email });

    if (!matchedOTPRecord) {
      throw new ApiError(400, "Wrong email or OTP");
    }

    const expiresAt = matchedOTPRecord.expiresAt || 0;

    if (expiresAt < Date.now()) {
      await OTP.deleteOne({ email });
      throw new ApiError(400,"Code has expired, request a new one");
    }

    const hashedOTP = matchedOTPRecord.otp;
    const validOTP = await bcrypt.compare(otp, hashedOTP);

    if (!validOTP) throw new ApiError(400, "Incorrect code");

    await OTP.deleteOne({ email });
    await User.updateOne({ email }, { verified: true });

    return res.status(200).json(new ApiResponse(201, { email }, "User verified successfully"));
  } catch (error: any) {
    throw new ApiError(400, error.message || "Wrong email or OTP");
  }
});

export {
  login,
  register,
  logout,
  editUser,
  changeCurrentPassword,
  refreshAccessToken,
  verifyOTP,
};
