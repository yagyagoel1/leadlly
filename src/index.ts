import dotenv from "dotenv"
import connectDB from "./db"
import { app } from "./app"
dotenv.config({
    path : "../.env"
})

connectDB().then(()=>
    {try {
        app.on("error",()=>{
            throw Error("there was some error using app");
        })
        app.listen(process.env.PORT||8000)
        console.log(`server is running at port:${process.env.PORT}`)
    } catch (error) {
        
    }
}
)