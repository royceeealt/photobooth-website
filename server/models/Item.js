import mongoose from "mongoose";

// Only needed if items are DB-backed instead of the static itemManifest.json.
const itemSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ["hair", "skinTone", "accessory"], required: true },
    name: { type: String, required: true },
    assetPath: { type: String, required: true }, // e.g. /assets/items/hair/hair_01.png
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
