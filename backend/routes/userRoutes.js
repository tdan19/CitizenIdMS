// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, requireRole } = require("../middleware/authMiddleware");

// All user management routes are admin-only
router.use(protect);
router.use(requireRole("admin"));

router
  .route("/")
  .get(getUsers) // List all users
  .post(createUser); // Create user

router
  .route("/:id")
  .put(updateUser) // Update user
  .delete(deleteUser); // Delete user

module.exports = router;

// backend/controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ message: "User creation failed" });
  }
};

// Update user info
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "User updated", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
