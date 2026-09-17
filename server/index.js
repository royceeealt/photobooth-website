import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import itemsRoutes from "./routes/items.routes.js";
import stripsRoutes from "./routes/strips.routes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" })); // strip images as base64 can be large

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes); // only if items are DB-backed
app.use("/api/strips", stripsRoutes); // optional persistence

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
});
