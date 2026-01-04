import User from "./models/User.js";
import connectDatabase from "./db/db.js";
import dotenv from "dotenv";

dotenv.config();

const userRegister = async () => {
  await connectDatabase(); // ✅ now safe

  try {
    const adminExists = await User.findOne({ email: "admin@example.com" });

    if (adminExists) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const newUser = new User({
      firstName: "Admin",
      lastName: "User",
      username: "admin@id.gov",
      employeeId: "EMP001",
      email: "admin@example.com",
      password: "admin123",
      phone: "1234567890",
      dateOfBirth: new Date("1980-01-01"),
      maritalStatus: "single",
      startDate: new Date(),
      role: "admin",
      profileImage: null,
      isActive: true,
    });

    await newUser.save();
    console.log("✅ Admin user seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding user:", error);
    process.exit(1);
  }
};

userRegister();
