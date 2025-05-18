// src/models/schemas/storeModel.js
import mongoose from "mongoose";

import Counter from "./counterModel.js";

const storeSchema = new mongoose.Schema(
  {
    // Sequential ID for the store
    storeId: {
      type: Number,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Please provide a store name"],
      trim: true,
      maxlength: [50, "Store name cannot be more than 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a store description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    logo: {
      type: String,
      default: "default-store.png",
    },
    coverImage: {
      type: String,
      default: "default-cover.png",
    },
    // Store both ObjectId and sequential userId
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: Number,
      required: true,
    },
    contactEmail: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    contactPhone: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    theme: {
      primaryColor: {
        type: String,
        default: "#3498db",
      },
      secondaryColor: {
        type: String,
        default: "#2ecc71",
      },
      fontFamily: {
        type: String,
        default: "Roboto",
      },
    },
    settings: {
      allowReviews: {
        type: Boolean,
        default: true,
      },
      showInventory: {
        type: Boolean,
        default: false,
      },
      enableChatSupport: {
        type: Boolean,
        default: false,
      },
    },
    analytics: {
      visitCount: {
        type: Number,
        default: 0,
      },
      salesCount: {
        type: Number,
        default: 0,
      },
      revenue: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-increment storeId
storeSchema.pre("save", async function (next) {
  // Only increment if this is a new document
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "storeId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.storeId = counter.seq;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Store = mongoose.model("Store", storeSchema);

export default Store;
