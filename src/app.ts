import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";


const app=express();


app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended : false,limit :"16kb"}))
app.use(cookieParser())
app.use(express.static("public"))


import userRouter from "./routes/user.route"
import productRouter from "./routes/product.route"


app.use("/api/v1/user",userRouter)
app.use("/api/v1/product",productRouter)

export {app}

