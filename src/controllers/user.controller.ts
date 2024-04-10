import mongoose from "mongoose";
import { User } from "../models/User.model";
import { ApiError } from "../util/ApiError";
import { asyncHandler } from "../util/asyncHandler";
import { generateAccessToken, generateRefreshToken } from "../util/generateTokens";
import { Request,Response } from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { mailOptionsType, sendOTP } from "../util/sendOTP";
import { OTP } from "../models/OTP.model";
import { ApiResponse } from "../util/ApiResponse";


const generateAccessAndRefreshToken = async (userId:mongoose.Types.ObjectId) => {
    try {
      const user= await User.findById(userId).select("-password");
      if(!user)
      throw new ApiError(400,"some error occurred while fetching user")
      const accessToken = await generateAccessToken(user._id,user.email||"",user.username||"",user.fullName||"");
      const refreshToken = await generateRefreshToken(user._id);
      
      user.refreshToken = refreshToken;
      user.accessToken = accessToken;
      await user.save({ validateBeforeSave: false });
  
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new ApiError(
        500,
        "something went wrong while generating access and refresh token"
      );
    }
  };

const register = asyncHandler(async(req:Request,res:Response)=>{
    const {email,username,password,fullName} = req.body;
    if (
        [email, username, password].some((feild) => feild?.trim() === "")
      ) {
        throw new ApiError(400, "All feilds are required");
      }
    const existedUser = await User.findOne({ 
        $or :[{
            username,
            email
        }]})
    if(existedUser)
    throw new ApiError(409,"user already exist")

    const user = await User.create({
        email,
        username,
        password,
        fullName
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      );
    
      if (!createdUser) {
        throw new ApiError(500, "Soomething went wrong while registering the user");
    }
    const otpDetails:mailOptionsType = {
      id : createdUser._id,
      email : createdUser.email||"",
      subject : "Email verification ",
      message : "Verify your email with code Below",
      duration : 1,

  }
  const mail = await sendOTP(otpDetails);
  if(!mail)
  throw new ApiError(400,"mail not sent")
    return res
    .status(201)
    .json(new ApiResponse(200,createdUser,"User registered successfully otp send successfully"))

})

const login = asyncHandler(async(req:Request,res:Response)=>{
    const {email,password,username}  =req.body;
    if(!(email||username))
    {
        throw new ApiError(400,"email or username is required")

    }
    const user = await User.findOne({
        $or : [{email},{username}]
    });
    if(!user)
    throw new ApiError(400,"user doesnt exist")
    
    if(!user.verified)
    throw new ApiError(400,"user is not verified")
    const isValidPassword =await bcrypt.compare(password, user?.password||"");
    

    if(!isValidPassword)
    throw new ApiError(400,"not a valid password")
    
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const options ={
        httpOnly :true,
        secure :true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken)
    .cookie("refreshToken",refreshToken)
    .json(new ApiResponse(200,{accessToken,refreshToken},"user logged in successfully"))
})

const logout = asyncHandler(async(req:Request,res:Response)=>{
    await User.findByIdAndUpdate(
        req.user?._id ,
        {
          $unset: {
            refreshToken: 1,
            accessToken :1,
          },
        },
        {
          new: true,
        }
      );
      return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "user logged out"));
})
const editUser = asyncHandler(async(req:Request,res:Response)=>{
    const {username,fullName} = req.body;
    if(!(username||fullName))
    throw new ApiError(400,"username or password is required")

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
      return res
        .status(200)
        .json(new ApiResponse(200, user ||{}, "Account details are updated"));
    });
    const changeCurrentPassword = asyncHandler(async (req:Request, res:Response) => {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(req.user?._id).select("-accessToken -refreshToken");
      if(!user)
      throw new ApiError(400,"user does not exist")
      const isPasswordCorrect = await bcrypt.compare(oldPassword,user?.password||"")

      if (!isPasswordCorrect) 
      throw new ApiError(400, "Invalid old password");
      user.password = newPassword;
      await user.save({ validateBeforeSave: false });
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changed successfully"));
    });
    const refreshAccessToken= asyncHandler(async(req:Request,res:Response)=>{
      try {
        const incomingRefreshToken =
          req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
          throw new ApiError(401, "unauthorized request");
        }
    
        const decodedToken = await jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET||""
        );
        if(typeof decodedToken==="string")
        throw new ApiError(401,"invalid token")
        const user = await User.findById(decodedToken?._id);
        if (!user) {
          throw new ApiError(401, "Invalid refresh token ");
        }
        if (incomingRefreshToken != user.refreshToken) {
          throw new ApiError(401, "refresh token is expired or used");
        }
        const options = {
          httpOnly: true,
          secure: true,
        };
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
          user._id
        );
    
        return res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(
            new ApiResponse(
              200,
              { accessToken, refreshToken },
              "access token refreshed"
            )
          );
      } catch (error:any) {
        throw new ApiError(401, error.message || "invalid token ");
      }
    })
    const verifyOTP  = asyncHandler(async(req:Request,res:Response)=>{
      try {
          const {email,otp} =req.body;
          if(!(email&&otp))
          {
              throw new ApiError(400,"provide values for email otp");
          }
  
  
          //ennsume otp record exists
          const matchedOTPRecord = await OTP.findOne({email});
          if(!matchedOTPRecord)
          {
              throw new ApiError(400,"wrong email or otp");
          }
          
          const expiresAt = matchedOTPRecord.expiresAt||0
          //checking for expired code
          if(expiresAt<Date.now())
          {
              await OTP.deleteOne({email});
              throw Error("code  has expired request for a new one ");
          }
          //nott yet expired verify value
          const hashedOTP=matchedOTPRecord.otp;
          const validOTP= await bcrypt.compare(otp,hashedOTP);
          if(!validOTP)
          throw new ApiError(400,"code is incorrect")
        else
        {
          await OTP.deleteOne({email})
            await User.updateOne({email},
            {
              verified :true
            })
            return res
            .status(200)
            .json(new ApiResponse(201,{email},"user verified successfully"))
        }
      } catch (error:any) {
          throw new ApiError(400,error.message||"wrong email or otp");
      } 
  })
export {login,
register,
logout,
editUser,
changeCurrentPassword,
refreshAccessToken,
verifyOTP
}