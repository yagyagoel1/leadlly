import jwt from "jsonwebtoken";
import { asyncHandler } from "../util/asyncHandler";
import { ApiError } from "../util/ApiError";
import { User } from "../models/User.model";
import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include user property of type jwt.JwtPayload
declare global {
  namespace Express {
    export interface Request {
      user?: jwt.JwtPayload;
    }
  }
}

// Middleware function for authentication
export const auth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // Throw error if token is missing
    if (!token) {
      throw new ApiError(400, "User not authorized to access the content");
    }

    // Verify the token
    const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "");

    // Throw error if token is invalid or missing
    if (typeof decodedToken === 'string') {
      throw new ApiError(401, "Invalid or missing access token");
    }

    // Find user by ID from the decoded token
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    // Throw error if user or access token does not match
    if (user?.accessToken != token) {
      throw new ApiError(400, "User not authorized");
    }

    // Set the user property in request object to the decoded token
    req.user = decodedToken;
    next();
  } catch (error) {
    throw new ApiError(400, "User not authorized");
  }
});
