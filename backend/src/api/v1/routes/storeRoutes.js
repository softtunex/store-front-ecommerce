// src/api/v1/routes/storeRoutes.js
import express from "express";
import * as storeController from "../controllers/storeController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All store routes require authentication
router.use(protect);

// Store CRUD operations
router
  .route("/")
  .get(storeController.getStores)
  .post(authorize("shop-owner", "admin"), storeController.createStore);

router
  .route("/:id")
  .get(storeController.getStore)
  .put(storeController.updateStore)
  .delete(storeController.deleteStore);

// Store theme customization
router.route("/:id/theme").put(storeController.updateStoreTheme);

// Store settings
router.route("/:id/settings").put(storeController.updateStoreSettings);

// Store analytics
router
  .route("/:id/analytics")
  .get(storeController.getStoreAnalytics)
  .put(storeController.updateStoreAnalytics);

export default router;
