/**
 * Load .env before any other module that reads process.env.
 * Must be the first import in server.js so ImageKit, DB, etc. see env vars.
 */
import dotenv from "dotenv";
dotenv.config();
