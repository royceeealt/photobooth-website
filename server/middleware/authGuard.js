const jwt = require("jsonwebtoken");

function authGuard(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Please log in to continue",
    });
  }

  const token = authorization.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Your session has expired. Please log in again.",
    });
  }
}

module.exports = authGuard;