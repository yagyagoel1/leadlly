import {  Router } from "express";
import { changeCurrentPassword, editUser, login, logout, refreshAccessToken, register } from "../controllers/user.controller";

const router = Router()
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/edit-user").patch(editUser)
router.route("/change-password").patch(changeCurrentPassword)
router.route("/refresh-token").patch(refreshAccessToken)