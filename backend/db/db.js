import mongoose from "mongoose";

const connectDatabase = async (app = null) => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log("Connecting to MongoDB at:", mongoURI);

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined");
    }

    const dbConnection = await mongoose.connect(mongoURI);

    // Only attach to app if app exists
    if (app) {
      app.locals.dbConnection = dbConnection.connection;
    }

    console.log("Connected to MongoDB");
    return dbConnection.connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDatabase;
