import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
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
userSchema.methods.isPasswordCorrect = async function (password:string) {
    return await bcrypt.compare(password, this.password);
  };
  userSchema.methods.generateAccessToken = async function () {
    return await jwt.sign(
      {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName||"",
      },
      process.env.ACCESS_TOKEN_SECRET||"",
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  };
  userSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET||"",
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  };
export const User  = mongoose.model("User",userSchema)