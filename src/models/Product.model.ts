import mongoose, { Schema } from "mongoose";


const productSchema= new Schema({
    name : {
        type : String,
        required: true,
        unique:true,
        trim : true
    },
    description: {
        type:  String,
        required : true,
        trim :true
    },
    photo:  {
        type: String,
        required :true,
        trim : true
    },
    owner: {
        type :mongoose.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Product = mongoose.model("Product",productSchema)