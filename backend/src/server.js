/**
 * Express app: CORS, JSON body, API routes (notes, products), centralized error handler.
 * Connects to MongoDB before listening.
 */
import "./load-env.js"; // Must run first so .env is loaded before any config (ImageKit, DB, etc.)

import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notesRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import userRoutes from "./routes/user.routes.js";
import imageRoutes from "./routes/image.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import orderRoutes from "./routes/order.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import shippingRoutes from "./routes/shipping.routes.js";
import faqRoutes from "./routes/faq.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log("Server listening on port:", PORT));
});
