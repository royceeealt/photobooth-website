import { Router } from "express";
import { createStrip, getMyStrips, getStripById } from "../controllers/strips.controller.js";
import authGuard from "../middleware/authGuard.js";

// Optional — final-strip persistence.
const router = Router();

router.post("/", authGuard, createStrip);
router.get("/", authGuard, getMyStrips);
router.get("/:id", authGuard, getStripById);

export default router;
