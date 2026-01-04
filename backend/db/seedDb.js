import mongoose from "mongoose";

const connectSeedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Seed DB connected");
  } catch (error) {
    console.error("Seed DB connection failed:", error);
    process.exit(1);
  }
};

export default connectSeedDB;
