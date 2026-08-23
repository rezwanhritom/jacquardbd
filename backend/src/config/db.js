import mongoose from "mongoose";
import dns from "node:dns";

/**
 * Connect to MongoDB using MONGO_URI from env.
 * Exits process on failure so the app does not run without a DB.
 *
 * mongodb+srv:// needs a DNS SRV lookup. Windows often refuses that
 * (querySrv ECONNREFUSED). Use public DNS for this process only — env is unchanged.
 */
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    const dbName = mongoose.connection.db?.databaseName || "(check your connection string)";
    console.log("MongoDB connected successfully. Database:", dbName);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
