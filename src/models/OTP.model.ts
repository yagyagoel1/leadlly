import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
const OTPSchema  = new Schema({
    otp:{
        type:String,
        required:true,
    },
        owner : {
            type: mongoose.Types.ObjectId,
            ref:"User"
        },
        email: {
            type: String,
            required : true,
            trim : true
        },
        createdAt:Number,
        expiresAt:Number

})
OTPSchema.pre("save" , async function(next){
    this.otp = await bcrypt.hash(this.otp,process.env.SALT_ROUNDS ||10)
    next()
})
export const OTP = mongoose.model("OTP",OTPSchema)

