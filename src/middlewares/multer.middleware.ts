import multer from "multer";

// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Save files to ./public/temp directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename for uploaded files
  },
});

// Create multer upload middleware with the defined storage configuration
export const upload = multer({
  storage,
});
