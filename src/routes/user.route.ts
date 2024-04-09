import {  Router } from "express";
import { changeCurrentPassword, editUser, login, logout, refreshAccessToken, register } from "../controllers/user.controller";
import { verifyOTP } from "../controllers/user.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router()
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/edit-user").patch(auth, editUser)
router.route("/change-password").patch(auth, changeCurrentPassword)
router.route("/refresh-token").patch(auth,refreshAccessToken)
router.route("/verify").post(verifyOTP)

export default router