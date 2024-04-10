import { ApiError } from "./ApiError";
import nodemailer from "nodemailer";

// Create nodemailer transport with Gmail service
let trans = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

// Verify the transport connection
trans.verify((error, success) => {
  if (error) {
    throw new ApiError(500, "There was some issue while sending mail");
  } else {
    console.log("Ready for messages");
    console.log("Success: ", success);
  }
});

// Function to send an email
export const sendEmail = async (mailOptions: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    return await trans.sendMail({ ...mailOptions });
  } catch (error) {
    throw new ApiError(500, "There was some issue while sending mail");
  }
};
