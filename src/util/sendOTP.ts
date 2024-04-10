import mongoose from "mongoose";
import { OTP } from "../models/OTP.model";
import { sendEmail } from "./sendEmail";
import { ApiError } from "./ApiError";

// Function to send OTP via email
export const sendOTP = async ({
  id,
  email,
  subject,
  message,
  duration = 1,
}: mailOptionsType) => {
  try {
    // Check if email, subject, and message are provided
    if (!(email && subject && message)) {
      throw Error("Provide a valid email, subject, and message");
    }

    // Clear old OTP if any
    await OTP.deleteOne({ owner: id });

    // Generate a random OTP
    const generatedOTP = `${Math.floor(1000 + Math.random() * 9000)}`;

    // Send email with OTP
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: subject,
      html: `<p>${message}</p><p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${generatedOTP}</b></p><p>This code expires in ${duration} hour(s)</b></p>`,
    };
    const info = await sendEmail(mailOptions);

    if (!info) {
      throw new ApiError(500, "There was some error while sending mail");
    }

    // Save OTP record
    const newOTP = await OTP.create({
      owner: id,
      email,
      otp: generatedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000 * duration,
    });

    if (newOTP) {
      // Return OTP record excluding sensitive data
      const OTPRecord = await OTP.findById(newOTP._id).select("-otp -owner -createdAt");
      return OTPRecord;
    } else {
      throw new ApiError(500, "There was some error while creating the OTP");
    }
  } catch (error: any) {
    throw new ApiError(500, error.message || "There was some error while creating the OTP");
  }
};

// Define the mailOptionsType interface
export interface mailOptionsType {
  id: mongoose.Types.ObjectId;
  email: string;
  subject: string;
  message: string;
  duration: number;
}
