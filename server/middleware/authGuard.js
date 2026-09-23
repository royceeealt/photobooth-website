import { verifyToken } from "../services/auth.service.js";

// Protects routes that require a logged-in user. Expects "Authorization: Bearer <token>".
export default function authGuard(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, email, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
