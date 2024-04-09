import jwt from "jsonwebtoken"
import { asyncHandler } from "../util/asyncHandler"
import { ApiError } from "../util/ApiError";
import { User } from "../models/User.model";

const auth  = asyncHandler(async(req,res,next)=>{
    function authHelper(token)
    {
        
    }
    try {
        let token =req.cookies?.accessToken|| req.header("Authorization").replace("Bearer ","")
        if(!token)
        {
            token  = req.cookies?.refreshToken||"";
            if(token)
            token = refreshAccessToken(token)
            else
            throw new ApiError(400, "user not authorized to access the content")
        }
        const decodedToken =await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET||"")
        const user = await User.findById(decodedToken?._id).select("-password -accessToken")
        if(user?.accessToken!=token)
        {
            throw new ApiError(400, "user not authorized")
        }
        else
        next()
    } catch (error) {
        throw new ApiError(400, "user not authorized")
    }

})