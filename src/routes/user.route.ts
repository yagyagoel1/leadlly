import {  Router } from "express";
import { changeCurrentPassword, editUser, login, logout, refreshAccessToken, register } from "../controllers/user.controller";
import { verifyOTP } from "../controllers/user.controller";
import { auth } from "../middlewares/auth.middleware";

// Initialize express router
const router = Router();

// Route to register a new user
router.route("/register").post(register);

// Route to log in a user
router.route("/login").post(login);

// Route to log out a user
router.route("/logout").post(logout);

// Route to edit user details
router.route("/edit-user").patch(auth, editUser);

// Route to change current password
router.route("/change-password").patch(auth, changeCurrentPassword);

// Route to refresh access token
router.route("/refresh-token").patch(auth, refreshAccessToken);

// Route to verify OTP
router.route("/verify").post(verifyOTP);

export default router;
