// src/api/v1/routes/authRoutes.js
import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.put("/reset-password/:resetToken", authController.resetPassword);
router.post("/logout", authController.logout);

export default router;
