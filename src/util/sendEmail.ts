import dotenv from "dotenv";
import { ApiError } from "./ApiError";
import nodemailer from "nodemailer"
let trans = nodemailer.createTransport(
    {
        service: 'gmail',
        host : "smtp.gmail.com",
        auth: {
            user: 'yagyamail1@gmail.com',
            pass: process.env.AUTH_PASS
        }
    }
);
trans.verify((error,success)=>{
    if(error)
    {
        throw new ApiError(500,"there was some issue while sending mail ")
    }
    else{
        console.log("ready for messages");
        console.log("success: ",success);
    }

})
export const sendEmail = async(mailOptions: {
    to: string;
    subject: string;
    html: string;
})=>{
    
  try {
    return await trans.sendMail({...mailOptions});
  } catch (error) {
    throw new ApiError(500,"there was some issue while sending mail ")
  }

}