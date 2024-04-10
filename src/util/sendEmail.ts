import nodemailer from "nodemailer"
import { ApiError } from "./ApiError";
//creating transporter
let transporter = nodemailer.createTransport({
    service: "gmail",
    host : "smtp.gmail.com",
    port : 587,
    secure:false,
    auth : {
        user : process.env.AUTH_EMAIL,
        pass : process.env.AUTH_PASS,
    },
});


//verifiying transporter
transporter.verify((error,success)=>{
   
    if(error)
    {
        console.log(error.message)
        throw new ApiError(500,"there was some problem with the trasnsporter mail")
    }
    else{
        console.log("ready for messages");
        console.log(success);
    }

})
export const sendEmail = async (mailOptions: {
    from: string | undefined;
    to: string;
    subject: string;
    html: string;
}) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail({...mailOptions}, (error, info) => {
            if (error) {
                reject(error);
            } else {
                console.log("resolved")
                resolve(info);
            }
        });
    });
};