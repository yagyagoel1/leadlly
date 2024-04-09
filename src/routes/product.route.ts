import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { createProduct, getProducts } from "../controllers/product.controller";




const router = Router()


router.route("/create").post(auth,createProduct)
router.route("/get-all").get(auth,getProducts)

export default router