import { Router } from "express";
import { getItems } from "../controllers/items.controller.js";

// Only needed if items live in DB, not a static manifest.
const router = Router();

router.get("/", getItems);

export default router;
