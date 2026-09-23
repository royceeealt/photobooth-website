import PhotoStrip from "../models/PhotoStrip.js";
import { uploadFile } from "../services/storage.service.js";

// Optional — final-strip persistence.
export async function createStrip(req, res, next) {
  try {
    const { stripCount, avatarConfig, imageDataUrl } = req.body;

    // TODO: convert imageDataUrl (base64) to a buffer and upload via storage.service
    const imageUrl = await uploadFile(Buffer.from(""), `strip-${Date.now()}.png`);

    const strip = await PhotoStrip.create({
      userId: req.user.id,
      stripCount,
      avatarConfig,
      imageUrl,
    });

    res.status(201).json({ strip });
  } catch (err) {
    next(err);
  }
}

export async function getMyStrips(req, res, next) {
  try {
    const strips = await PhotoStrip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ strips });
  } catch (err) {
    next(err);
  }
}

export async function getStripById(req, res, next) {
  try {
    const strip = await PhotoStrip.findById(req.params.id);
    if (!strip) return res.status(404).json({ message: "Strip not found" });
    res.json({ strip });
  } catch (err) {
    next(err);
  }
}
