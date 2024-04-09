import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Document } from 'mongoose';


const userSchema = new Schema({
    username: {
        type: String,
        requried: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
      },
    email : {
            type: String,
            requried: true,
            unique: true,
            lowercase: true,
            trim: true,
    },
    password :{
        type:String,
        required:[true,"password is required"],
        trim:true,
        
    },
    fullName:{
        type:String,
        trim : true
    },
    refreshToken : {
        type : String,
        trim :true
    },
    accessToken : {
        type : String,
        trim : true
    },
    verified : {
        type : Boolean,
        default:false
    }
},{timestamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password"))
    {
        next();
    }
    else
    {
        this.password  = await bcrypt.hash(this.password,10)
        next()
    }
})


export const User  = mongoose.model("User",userSchema)
