import User from "../models/User.js";
import bcrypt from "bcryptjs";

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      employeeId,
      email,
      password,
      phone,
      dateOfBirth,
      maritalStatus,
      startDate,
      role,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email, employee ID or username",
      });
    }

    const user = new User({
      firstName,
      lastName,
      username,
      employeeId,
      email,
      password,
      phone,
      dateOfBirth,
      maritalStatus,
      startDate,
      role,
      isActive: true,
    });

    await user.save();

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Make sure to export all functions
export default {
  createUser,
  getAllUsers,
};
