import express from "express";
import { login, verify } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Changed import name

const router = express.Router();

// Login route (no auth required)
router.post("/login", login);

// Verification route (requires valid token)
router.get("/verify", verifyToken, verify); // Fixed middleware reference

export default router;
