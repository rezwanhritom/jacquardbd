/**
 * One-off script to set a user's role to "admin" by email.
 * Run from backend folder: node scripts/make-admin.js <email>
 * Example: node scripts/make-admin.js admin@example.com
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/make-admin.js <email>");
  process.exit(1);
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const dbName = mongoose.connection.db?.databaseName;
  console.log("Connected to database:", dbName);

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    console.error("No user found with email:", email);
    await mongoose.disconnect();
    process.exit(1);
  }

  if (user.role === "admin") {
    console.log("User", email, "is already an admin.");
    await mongoose.disconnect();
    process.exit(0);
  }

  user.role = "admin";
  await user.save();
  console.log("Success:", email, "is now an admin.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
