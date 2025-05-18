// src/api/v1/controllers/storeController.js
import Store from "../../../models/schemas/storeModel.js";
import User from "../../../models/schemas/userModel.js";
import AppError from "../../../utils/errors/AppError.js";

// Create a new store
export const createStore = async (req, res, next) => {
  try {
    // Add the current user as the store owner (both ObjectId and sequential ID)
    req.body.owner = req.user.id;
    req.body.ownerId = req.user.userId || 0; // Fallback to 0 if userId doesn't exist

    // Create the store in database
    const store = await Store.create(req.body);

    // Return the new store
    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// Get all stores
export const getStores = async (req, res, next) => {
  try {
    // Filtering options
    let query = {};

    // If not admin, only show active stores
    if (req.user.role !== "admin") {
      query.isActive = true;
    }

    // If shop-owner, only show their stores (using both ObjectId and userId)
    if (req.user.role === "shop-owner") {
      query.$or = [{ owner: req.user.id }, { ownerId: req.user.userId }];
    }

    // Find stores with optional filters and populate owner details
    const stores = await Store.find(query).populate(
      "owner",
      "name email userId"
    );

    // Return stores list
    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single store by ID
export const getStore = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    let store;

    // Handle numeric IDs (storeId) and MongoDB IDs (_id)
    if (/^\d+$/.test(storeId)) {
      // For numeric IDs like /stores/1
      store = await Store.findOne({ storeId: parseInt(storeId) }).populate(
        "owner",
        "name email userId"
      );
    } else {
      // For MongoDB IDs
      try {
        store = await Store.findById(storeId).populate(
          "owner",
          "name email userId"
        );
      } catch (err) {
        return next(new AppError("Invalid store ID format", 400));
      }
    }

    // If store not found
    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    // Hide inactive stores from non-owners and non-admins
    if (
      !store.isActive &&
      req.user.role !== "admin" &&
      store.owner._id.toString() !== req.user.id &&
      store.ownerId !== req.user.userId
    ) {
      return next(new AppError("Store not found", 404));
    }

    // Return store data
    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// Update a store
export const updateStore = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    let store;

    // Handle numeric IDs (storeId) and MongoDB IDs (_id)
    if (/^\d+$/.test(storeId)) {
      // For numeric IDs like /stores/1
      store = await Store.findOne({ storeId: parseInt(storeId) });
    } else {
      // For MongoDB IDs
      try {
        store = await Store.findById(storeId);
      } catch (err) {
        return next(new AppError("Invalid store ID format", 400));
      }
    }

    // If store not found
    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    // Check if user is store owner or admin
    if (
      store.owner.toString() !== req.user.id &&
      store.ownerId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to update this store", 403));
    }

    // Remove fields that shouldn't be updated directly
    const { owner, ownerId, storeId: id, analytics, ...updateData } = req.body;

    // Update the store
    store.set(updateData);
    await store.save();

    // Return updated store
    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a store
export const deleteStore = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    let store;

    // Handle numeric IDs (storeId) and MongoDB IDs (_id)
    if (/^\d+$/.test(storeId)) {
      // For numeric IDs like /stores/1
      store = await Store.findOne({ storeId: parseInt(storeId) });
    } else {
      // For MongoDB IDs
      try {
        store = await Store.findById(storeId);
      } catch (err) {
        return next(new AppError("Invalid store ID format", 400));
      }
    }

    // If store not found
    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    // Check if user is store owner or admin
    if (
      store.owner.toString() !== req.user.id &&
      store.ownerId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to delete this store", 403));
    }

    // Delete the store
    await store.deleteOne();

    // Return success message
    res.status(200).json({
      success: true,
      data: null,
      message: "Store deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update store theme
export const updateStoreTheme = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    let store;

    // Handle numeric IDs (storeId) and MongoDB IDs (_id)
    if (/^\d+$/.test(storeId)) {
      // For numeric IDs like /stores/1
      store = await Store.findOne({ storeId: parseInt(storeId) });
    } else {
      // For MongoDB IDs
      try {
        store = await Store.findById(storeId);
      } catch (err) {
        return next(new AppError("Invalid store ID format", 400));
      }
    }

    // If store not found
    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    // Check if user is store owner or admin
    if (
      store.owner.toString() !== req.user.id &&
      store.ownerId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to update this store", 403));
    }

    // Validate theme data
    if (!req.body.theme) {
      return next(new AppError("Theme data is required", 400));
    }

    // Update only the theme
    store.theme = {
      ...store.theme.toObject(),
      ...req.body.theme,
    };

    await store.save();

    // Return updated store
    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// Update store settings
export const updateStoreSettings = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    let store;

    // Handle numeric IDs (storeId) and MongoDB IDs (_id)
    if (/^\d+$/.test(storeId)) {
      // For numeric IDs like /stores/1
      store = await Store.findOne({ storeId: parseInt(storeId) });
    } else {
      // For MongoDB IDs
      try {
        store = await Store.findById(storeId);
      } catch (err) {
        return next(new AppError("Invalid store ID format", 400));
      }
    }

    // If store not found
    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    // Check if user is store owner or admin
    if (
      store.owner.toString() !== req.user.id &&
      store.ownerId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to update this store", 403));
    }

    // Validate settings data
    if (!req.body.settings) {
      return next(new AppError("Settings data is required", 400));
    }

    // Update only the settings
    store.settings = {
      ...store.settings.toObject(),
      ...req.body.settings,
    };

    await store.save();

    // Return updated store
    res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// Get store analytics
export const getStoreAnalytics = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    let store;

    // Handle numeric IDs (storeId) and MongoDB IDs (_id)
    if (/^\d+$/.test(storeId)) {
      // For numeric IDs like /stores/1
      store = await Store.findOne({ storeId: parseInt(storeId) });
    } else {
      // For MongoDB IDs
      try {
        store = await Store.findById(storeId);
      } catch (err) {
        return next(new AppError("Invalid store ID format", 400));
      }
    }

    // If store not found
    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    // Check if user is store owner or admin
    if (
      store.owner.toString() !== req.user.id &&
      store.ownerId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to view store analytics", 403));
    }

    // Return analytics data
    res.status(200).json({
      success: true,
      data: store.analytics,
    });
  } catch (error) {
    next(error);
  }
};

// Update store analytics
export const updateStoreAnalytics = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    let store;

    // Handle numeric IDs (storeId) and MongoDB IDs (_id)
    if (/^\d+$/.test(storeId)) {
      // For numeric IDs like /stores/1
      store = await Store.findOne({ storeId: parseInt(storeId) });
    } else {
      // For MongoDB IDs
      try {
        store = await Store.findById(storeId);
      } catch (err) {
        return next(new AppError("Invalid store ID format", 400));
      }
    }

    // If store not found
    if (!store) {
      return next(new AppError("Store not found", 404));
    }

    // Check if user is store owner or admin
    if (
      store.owner.toString() !== req.user.id &&
      store.ownerId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return next(
        new AppError("Not authorized to update store analytics", 403)
      );
    }

    // Validate analytics data
    if (!req.body.analytics) {
      return next(new AppError("Analytics data is required", 400));
    }

    // Update the analytics
    store.analytics = {
      ...store.analytics.toObject(),
      ...req.body.analytics,
      lastUpdated: Date.now(),
    };

    await store.save();

    // Return updated analytics
    res.status(200).json({
      success: true,
      data: store.analytics,
    });
  } catch (error) {
    next(error);
  }
};
