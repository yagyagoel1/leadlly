import mongoose from "mongoose"
import { DB_Name } from "../constraints"

 const connectDB =async ()=>{
   try {
    const connectionString = await mongoose.connect(`${process.env.DB_URL}/${DB_Name}`)
    console.log(`Database is connected to:${connectionString.connection.host}`)

   } catch (error) {
    console.log("There was some error while connecting to mongodb database",error)
    process.exit(1)   
} 
}
export default connectDB