// Centralized Express error handler — register last, after all routes.
export default function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ message });
}
