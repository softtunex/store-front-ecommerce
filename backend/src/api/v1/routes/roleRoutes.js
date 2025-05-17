// src/api/v1/routes/roleRoutes.js
import express from "express";
import * as userController from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Role management routes - accessible by admin only
router
  .route("/")
  .get(authorize("admin"), userController.getRoles)
  .post(authorize("admin"), userController.createRole);

router
  .route("/:name")
  .put(authorize("admin"), userController.updateRole)
  .delete(authorize("admin"), userController.deleteRole);

export default router;
