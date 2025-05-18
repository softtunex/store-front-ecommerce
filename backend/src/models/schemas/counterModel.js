// src/models/schemas/counterModel.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

// Use mongoose.models to prevent the error when model is compiled multiple times
const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

export default Counter;
