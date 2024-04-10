import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { createProduct, getProducts } from "../controllers/product.controller";
import { upload } from "../middlewares/multer.middleware";




const router = Router()


router.route("/create").post(auth,upload.single("photo"),createProduct)
router.route("/get-all").get(auth,getProducts)

export default router