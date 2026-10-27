const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from the server environment");
  }

  return jwt.sign(
    { userId: String(userId) },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
};