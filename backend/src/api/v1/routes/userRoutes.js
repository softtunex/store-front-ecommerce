// src/api/v1/routes/userRoutes.js
import express from "express";
import * as userController from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Profile routes - accessible by all authenticated users
router
  .route("/profile")
  .get(userController.getProfile)
  .put(userController.updateProfile);

// User CRUD routes - accessible by admin only
router
  .route("/")
  .get(authorize("admin"), userController.getUsers)
  .post(authorize("admin"), userController.createUser);

router
  .route("/:id")
  .get(authorize("admin"), userController.getUserById)
  .put(authorize("admin"), userController.updateUser)
  .delete(authorize("admin"), userController.deleteUser);

export default router;
