import mongoose from "mongoose";

const photoStripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stripCount: { type: Number, required: true },
    imageUrl: { type: String, required: true }, // uploaded final strip image
    avatarConfig: {
      hair: String,
      skinTone: String,
      accessory: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PhotoStrip", photoStripSchema);
