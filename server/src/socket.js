
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Connection from "./models/Connection.js";
import mongoose from "mongoose";

// Extract a cookie from the browser's Cookie header.
const getCookie = (cookieHeader, name) => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");

  const targetCookie = cookies.find((cookie) => {
    return cookie.trim().startsWith(`${name}=`);
  });

  if (!targetCookie) return null;

  return decodeURIComponent(
    targetCookie.trim().substring(name.length + 1)
  );
};

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // ==========================================
  // SOCKET AUTHENTICATION
  // ==========================================

  io.use(async (socket, next) => {
    try {
      const token = getCookie(
        socket.handshake.headers.cookie,
        "skillconnect_token"
      );

      if (!token) {
        return next(new Error("Authentication required."));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.sub);

      if (!user || !user.isActive) {
        return next(new Error("Invalid or inactive account."));
      }

      // Invalidate tokens issued before password changes.
      if (user.passwordChangedAt && decoded.iat) {
        const passwordChangedAt = Math.floor(
          user.passwordChangedAt.getTime() / 1000
        );

        if (passwordChangedAt > decoded.iat) {
          return next(new Error("Your session has expired."));
        }
      }

      if (
        user.accountType !== "student" ||
        !user.emailVerified ||
        user.verificationStatus !== "verified"
      ) {
        return next(
          new Error("Verified student access is required.")
        );
      }

      socket.userId = user._id.toString();

      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);

      next(new Error("Authentication failed."));
    }
  });

  // ==========================================
  // SOCKET CONNECTION
  // ==========================================

  io.on("connection", (socket) => {
    console.log(`Student connected: ${socket.userId}`);

    // Join a conversation after verifying ownership.
    socket.on("join_connection", async (connectionId, callback) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(connectionId)) {
          return callback?.({
            success: false,
            message: "Invalid connection ID.",
          });
        }

        const connection = await Connection.findOne({
          _id: connectionId,
          status: "active",
          $or: [
            { requester: socket.userId },
            { provider: socket.userId },
          ],
        });

        if (!connection) {
          return callback?.({
            success: false,
            message: "You do not have access to this conversation.",
          });
        }

        const room = `connection:${connectionId}`;

        await socket.join(room);

        callback?.({
          success: true,
          message: "Joined conversation successfully.",
        });
      } catch (error) {
        console.error("Join connection error:", error);

        callback?.({
          success: false,
          message: "Unable to join conversation.",
        });
      }
    });

    // Leave a conversation.
    socket.on("leave_connection", (connectionId) => {
      if (!mongoose.Types.ObjectId.isValid(connectionId)) return;

      socket.leave(`connection:${connectionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Student disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export default initializeSocket;
