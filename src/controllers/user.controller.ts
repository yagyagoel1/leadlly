import mongoose from "mongoose";
import { User } from "../models/User.model";
import { ApiError } from "../util/ApiError";
import { asyncHandler } from "../util/asyncHandler";

const generateAccessAndRefreshToken = async (userId:mongoose.Types.ObjectId) => {
    try {
      const user = await User.findById(userId);
      if(!user)
      throw new ApiError(400,"some error occurred while fetching user")
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();
      
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

const register = asyncHandler(async(req,res)=>{
    const {email,username,password,fullName} = req.body();
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
    return res
    .status(201)
    .json(new ApiResponse(200,createdUser,"User registered successfully"))

})

const login = asyncHandler(async(req,res)=>{
    const {email,password,username}  =req.body();
    if(!(email||username))
    {
        throw new ApiError(400,"email or username is required")

    }
    const user = await User.findOne({
        $or : [{email},{username}]
    });
    if(!user)
    throw new ApiError(400,"user doesnt exist")

    const isValidPassword = await user.isPasswordCorrect(password)

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

const logout = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
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
const editUser = asyncHandler(async(req,res)=>{
    const {username,fullName} = req.body();
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
      ).select("-password");
      return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details are updated"));
    });
export {login,
register}