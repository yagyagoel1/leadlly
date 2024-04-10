import dotenv from "dotenv"
import connectDB from "./db"
import { app } from "./app"
import { ApiError } from "./util/ApiError"
dotenv.config({
    path: "../.env"
})

connectDB().then(()=>
    {try {
        app.on("error",()=>{
            throw new ApiError(500,"there was some error using app");
        })
        app.listen(process.env.PORT||8000)
        console.log(`server is running at port:${process.env.PORT}`)
    } catch (error) {
        throw new ApiError(500,"there was some error while starting up");
    }
}
)