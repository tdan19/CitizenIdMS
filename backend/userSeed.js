import User from "./models/User.js";
import bcrypt from "bcryptjs";
import connectDatabase from "./db/db.js";
import dotenv from "dotenv";
dotenv.config();

const userRegister = async () => {
  connectDatabase();
  try {
    const hashPassword = await bcrypt.hash("admin123", 10);
    const newUser = new User({
      name: "Admin",
      username: "admin@id.gov",
      password: hashPassword,
      role: "admin",
    });
    await newUser.save();
  } catch (error) {
    console.error("Error seeding user:", error);
  }
};
userRegister();
