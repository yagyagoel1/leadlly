import mongoose, { Schema } from "mongoose";

const OTPSchema  = new Schema({
    otp:{
        type:String,
        createdAt:Date,
        expiresAt:Date,
        owner : {
            type: mongoose.Types.ObjectId,
            ref:"User"
        }
    }
})
export const OTP = mongoose.model("OTP",OTPSchema)

