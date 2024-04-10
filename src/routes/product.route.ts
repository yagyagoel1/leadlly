import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { createProduct, getProducts } from "../controllers/product.controller";
import { upload } from "../middlewares/multer.middleware";

// Initialize express router
const router = Router();

// Route to create a new product
router.route("/create").post(auth, upload.single("photo"), createProduct);

// Route to get all products
router.route("/get-all").get(auth, getProducts);

export default router;
