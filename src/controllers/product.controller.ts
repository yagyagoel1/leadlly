import { Request, Response } from "express";
import { Product } from "../models/Product.model";
import { ApiError } from "../util/ApiError";
import { asyncHandler } from "../util/asyncHandler";
import { uploadOnCloudinary } from "../util/cloudinary";
import { ApiResponse } from "../util/ApiResponse";
import { descriptionSchema, nameSchema } from "../util/zodSchema";

// Create a new product
const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body; // Extract name and description from request body
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required"); // Error if name or description is missing
    }
    const validName = nameSchema.safeParse(name); // Validate name using schema
    const validDescription = descriptionSchema.safeParse(description); // Validate description using schema
    if (!(validName && validDescription)) {
        throw new ApiError(400, "Please enter a valid name and/or description (max:500)"); // Error if validation fails
    }
    const productExists = await Product.findOne({ name }); // Check if product with the same name exists
    if (productExists) {
        throw new ApiError(400, "Product already exists"); // Error if product with the same name is found
    }

    const photoLocalPath = req.file?.path || ""; // Get the local path of the uploaded photo
    if (!photoLocalPath) {
        throw new ApiError(400, "Photo of the product file is required"); // Error if photo path is missing
    }
    const photo = await uploadOnCloudinary(photoLocalPath); // Upload photo to Cloudinary
    if (!photo) {
        throw new ApiError(500, "There was some issue while uploading the picture"); // Error if photo upload fails
    }
    const product = await Product.create({
        owner: req.user?._id, // Set product owner ID
        name: name, // Set product name
        description: description, // Set product description
        photo: photo.url // Set product photo URL
    });
    
    const createdProduct = await Product.findById(product._id); // Find the created product by ID
    if (!createdProduct) {
        throw new ApiError(500, "Something went wrong while creating the product"); // Error if product creation fails
    }
    return res
        .status(201)
        .json(new ApiResponse(200, createdProduct, "Product has been created successfully")); // Respond with success message
});

// Get all products
const getProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await Product.find(); // Find all products
    if (!products) {
        throw new ApiError(500, "There was some error while fetching the products"); // Error if products fetching fails
    }

    return res
        .status(200)
        .json(new ApiResponse(200, products, "Sent products successfully")); // Respond with fetched products
});

export { createProduct, getProducts }; // Export createProduct and getProducts functions
