import { Request, Response } from "express";
import { Product } from "../models/Product.model";
import { ApiError } from "../util/ApiError";
import { asyncHandler } from "../util/asyncHandler";
import { uploadOnCloudinary } from "../util/cloudinary";
import { ApiResponse } from "../util/ApiResponse";


const createProduct = asyncHandler(async(req:Request,res:Response)=>{
    const {name ,description} = req.body();
    if(!name||!description)
    {
        throw new ApiError(400,"name and description are required")
    }
    const productExists =await Product.findOne({name})
    if(productExists)
    throw new ApiError(400,"Product already exists")

    const photoLocalPath = req.file?.path||"";
    if(!photoLocalPath)
    throw new ApiError(400, "photo of the product files is required");
    const photo = await uploadOnCloudinary(photoLocalPath)
    if(!photo)
    throw new ApiError(500, "there was some issue while uploading the picture")
    const product= await Product.create({
        owner :req.user?._id,
        name: name,
        description : description,
        photo : photo.url

    })
    
    const createdProduct = await Product.findById(product._id)
    if(!createdProduct)
    {
        throw new ApiError(500, "something went wrong while creating the product")

    }
    return res
    .status(201)
    .json(new ApiResponse(200,createdProduct,"Product has been created successfully"))


})

const getProducts = asyncHandler(async(req:Request,res:Response)=>{
    const products = await Product.find();
    if(!products)
    throw new ApiError(500,"there was some error while fetching the products")

    return res
    .status(200)
    .json(new ApiResponse(200,products,"sent product successfully"))
})

export {createProduct,
getProducts}