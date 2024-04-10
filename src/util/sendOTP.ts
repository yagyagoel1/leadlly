import mongoose from "mongoose";
import { OTP } from "../models/OTP.model";
import { sendEmail } from "./sendEmail";
import { ApiError } from "./ApiError";

export const sendOTP =async ({id,
    email,subject,message,duration=1
}:mailOptionsType)=>{
    try {
        if(!(email&&subject&&message)){
            throw Error("provide a valid email or msg");
        }
        //clear old otp if any
        await OTP.deleteOne({owner:id});

        //generated pin
        const generatedOTP = (`${Math.floor(1000+Math.random()*9000)}`)

        //send email
        const mailOptions = {
            from : process.env.AUTH_EMAIL,
            to : email,
            subject : subject,
            html : `<p>${message}</p><p style = "color : tomato; font-size:25px;
            letter-spacing : 2px;"><b>${generatedOTP}</b></p><p>
            This code expires in ${duration} hour(s)</b></p>`,
        }
        const info =await sendEmail(mailOptions);

        if(!info)
        throw new ApiError(500,"there was some error while sending mail")
        //save otp record
        const newOTP =await OTP.create({
            owner:id,
            email,
            otp : generatedOTP,
            createdAt : Date.now(),
            expiresAt : Date.now()+3600000*duration,
        });
        if(newOTP)
        {
            const OTPRecord = await OTP.findById(newOTP._id).select("-otp -owner -createdAt");
            return OTPRecord
        }
        else
        throw new ApiError(500,"there was some error while creating the user")

    } catch (error:any) {
        throw new ApiError(500,error.message||"there was some error while creating the user")
    }
}
export interface mailOptionsType{
    id :mongoose.Types.ObjectId
    email: string,
    subject : string,
    message : string,
    duration :number
}