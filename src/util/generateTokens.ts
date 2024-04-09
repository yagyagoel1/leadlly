import  jwt  from "jsonwebtoken";
import mongoose from "mongoose";

export const generateAccessToken = async function (userId:mongoose.Types.ObjectId,email:string,username:string,fullName:string) {
    return await jwt.sign(
      {
        _id: userId,
        email: email,
        username: username,
        fullName: fullName,
      },
      process.env.ACCESS_TOKEN_SECRET||"",
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  };
  export const generateRefreshToken = async function (userId:mongoose.Types.ObjectId) {
    return await jwt.sign(
      {
        _id: userId,
      },
      process.env.REFRESH_TOKEN_SECRET||"",
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  };