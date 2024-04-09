import nodemailer from "nodemailer"
import { ApiError } from "./ApiError";
//creating transporter
let transporter = nodemailer.createTransport({
    host : "smtp-mail.outlook.com",
    auth : {
        user : process.env.AUTH_EMAIL,
        pass : process.env.AUTH_PASS,
    },
});


//verifiying transporter
transporter.verify((error,success)=>{
   
    if(error)
    {
        throw new ApiError(500,"there was some problem with the trasnsporter mail")
    }
    else{
        console.log("ready for messages");
        console.log(success);
    }

})
export const sendEmail = async (mailOptions: {
    form: string | undefined;
    to: string;
    subject: string;
    html: string;
}) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new ApiError(500,"there was some issue while sending the mail")
    }
};