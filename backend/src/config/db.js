import mongoose from "mongoose";

/**
 * Connect to MongoDB using MONGO_URI from env.
 * Exits process on failure so the app does not run without a DB.
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
