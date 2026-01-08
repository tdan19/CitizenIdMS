import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Helper for role-based redirects
const getDashboardPath = (role) => {
  const normalizedRole = role.toLowerCase();
  const paths = {
    admin: "/admin",
    Registrar: "/registrar",
    Supervisor: "/supervisor",
    Officer: "/officer",
    Citizen: "/citizen",
  };
  return paths[normalizedRole] || "/";
};

// Login Controller
const login = async (req, res) => {
  console.log("Login request received");
  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide both username/email and password",
    });
  }

  try {
    await mongoose.connection.db.admin().ping();
    console.log("Database connection verified");

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    }).select("+password +failedLoginAttempts +isActive");

    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is deactivated
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact support.",
      });
    }

    // Account lockout check
    if (user.failedLoginAttempts >= 5) {
      const lockoutDuration = 30 * 60 * 1000; // 30 minutes
      const timeSinceLastAttempt = Date.now() - (user.lastFailedAttempt || 0);

      if (timeSinceLastAttempt < lockoutDuration) {
        return res.status(403).json({
          success: false,
          message: "Account temporarily locked. Try again later.",
        });
      } else {
        // Reset attempts if lockout expired
        await User.findByIdAndUpdate(user._id, {
          failedLoginAttempts: 0,
          lastFailedAttempt: null,
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { failedLoginAttempts: 1 },
        lastFailedAttempt: Date.now(),
      });
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Successful login: reset counters
    await User.findByIdAndUpdate(user._id, {
      failedLoginAttempts: 0,
      lastFailedAttempt: null,
      lastLogin: Date.now(),
    });

    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET in environment variables");
      throw new Error("Server configuration error");
    }

    const tokenPayload = {
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });

    const expiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    };

    console.log("Successful login for user:", user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      expiresAt,
      user: userData,
      redirectTo: getDashboardPath(user.role),
    });
  } catch (error) {
    console.error("Login error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? `Login failed: ${error.message}`
          : "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
};

// Verify Token Controller
const verify = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account deactivated",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({
      success: false,
      message: "Token verification failed",
    });
  }
};

export { login, verify };
