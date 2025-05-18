// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Import routes
import authRoutes from "./api/v1/routes/authRoutes.js";
import userRoutes from "./api/v1/routes/userRoutes.js";
import roleRoutes from "./api/v1/routes/roleRoutes.js";
import storeRoutes from "./api/v1/routes/storeRoutes.js";

// Initialize express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // Or your frontend URL
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the E-commerce API" });
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/stores", storeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
