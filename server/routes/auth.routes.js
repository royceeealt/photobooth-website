import { Router } from "express";
import { signup, login, me } from "../controllers/auth.controller.js";
import authGuard from "../middleware/authGuard.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authGuard, me);

export default router;
