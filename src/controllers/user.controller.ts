import mongoose from "mongoose";
import { User } from "../models/User.model";
import { ApiError } from "../util/ApiError";
import { asyncHandler } from "../util/asyncHandler";

const generateAccessAndRefreshToken = async (userId:mongoose.Types.ObjectId) => {
    try {
      const user = await User.findById(userId);
  
      const accessToken = await user.generateAccessToken();
  
      const refreshToken = await user.generateRefreshToken();
  
      user.refreshToken = refreshToken;
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

})