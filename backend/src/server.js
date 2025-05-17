// src/server.js
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/database/mongodb.js";
import { initializeRoles } from "./utils/initRoles.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize default roles
initializeRoles();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
