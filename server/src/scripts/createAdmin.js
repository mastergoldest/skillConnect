import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/User.js";

const createAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "Please configure ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.",
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password must contain at least 12 characters.");
    }

    await connectDB();

    const email = ADMIN_EMAIL.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.accountType === "admin") {
        console.log("An admin account with this email already exists.");
        return;
      }

      throw new Error(
        "This email already belongs to a non-admin account. Choose another email.",
      );
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      fullName: ADMIN_NAME.trim(),
      email,
      password: hashedPassword,
      accountType: "admin",
      emailVerified: true,
      isActive: true,
    });

    console.log("Admin account created successfully!");
    console.log(`Admin email: ${email}`);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
