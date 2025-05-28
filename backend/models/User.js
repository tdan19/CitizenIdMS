import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String, required: [true, "Last name is required"] },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      validate: {
        validator: (v) => v != null && v.trim() !== "",
        message: "Username cannot be null or empty",
      },
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: { type: String, required: [true, "Phone number is required"] },
    dateOfBirth: { type: Date, required: [true, "Date of birth is required"] },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
      required: [true, "Marital status is required"],
    },
    startDate: { type: Date, required: [true, "Start date is required"] },
    role: {
      type: String,
      enum: ["admin", "registrar", "supervisor", "officer", "citizen"],
      required: [true, "Role is required"],
      default: "registrar",
    },
    profileImage: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lastFailedAttempt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
