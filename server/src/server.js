import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";

import connectDB from "./config/db.js";
import initializeSocket from "./socket.js";

import authRoutes from "./routes/authRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import adminVerificationRoutes from "./routes/adminVerificationRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

// ==========================================
// INITIALIZE EXPRESS AND HTTP SERVER
// ==========================================

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO.
const io = initializeSocket(httpServer);

// Make Socket.IO accessible inside controllers.
app.set("io", io);

// ==========================================
// SECURITY AND MIDDLEWARE
// ==========================================

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillConnect API is running successfully.",
  });
});

// ==========================================
// PREVENT AUTH CACHE
// ==========================================

app.use("/api/auth/me", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/admin/verification", adminVerificationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/profile", profileRoutes);

// ==========================================
// NOT FOUND HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected server error occurred."
        : error.message,
  });
});

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from the environment.");
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the environment.");
    }

    if (!process.env.CLIENT_URL) {
      throw new Error("CLIENT_URL is missing from the environment.");
    }

    await connectDB();

    const PORT = process.env.PORT || 5000;

    httpServer.listen(PORT, () => {
      console.log("-------------------------------------");
      console.log("SkillConnect API is running.");
      console.log("Socket.IO is ready.");
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`Client: ${process.env.CLIENT_URL}`);
      console.log("-------------------------------------");
    });
  } catch (error) {
    console.error("Unable to start SkillConnect:", error.message);
    process.exit(1);
  }
};

startServer();
