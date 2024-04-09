import jwt from "jsonwebtoken"
import { asyncHandler } from "../util/asyncHandler"
import { ApiError } from "../util/ApiError";
import { User } from "../models/User.model";
import { Request, Response, NextFunction } from 'express';

 declare global {
    namespace Express {
        export interface Request {
        user?: jwt.JwtPayload
      }
    }
  }
const auth  = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
   
    try {
        let token =req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ","")
        if(!token)
        {
            throw new ApiError(400, "user not authorized to access the content")
        }
        const decodedToken =await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET||"")
        if (typeof decodedToken === 'string') {

            throw new ApiError(401, "Invalid or missing refresh token"); 
        }
        const user = await User.findById(decodedToken?._id).select("-password -accessToken")
        if(user?.accessToken!=token)
        {
            throw new ApiError(400, "user not authorized")
        }
        
        req.user = decodedToken
        next()
    } catch (error) {
        throw new ApiError(400, "user not authorized")
    }

})