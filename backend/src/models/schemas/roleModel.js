// src/models/schemas/roleModel.js
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a role name"],
      unique: true,
      enum: ["customer", "shop-owner", "admin"],
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    description: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model("Role", roleSchema);

export default Role;
