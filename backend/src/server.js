import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import notesRoutes from "./routes/notesRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: "*", // http://localhost:5173
  })
);

app.use(express.json());

app.use("/api/notes", notesRoutes);
app.use("/api/products", productRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on port:", PORT);
  });
});
