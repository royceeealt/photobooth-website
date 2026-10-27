class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks "expected" errors (bad input, not found, etc.)
  }
}

module.exports = AppError;