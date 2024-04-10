import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Remove the locally saved file after uploading
    fs.unlinkSync(localFilePath);

    return response; // Return the Cloudinary response
  } catch (error) {
    // Remove the locally saved file if the upload operation fails
    fs.unlinkSync(localFilePath);

    return null; // Return null if upload fails
  }
};

// Export the uploadOnCloudinary function
export { uploadOnCloudinary };
