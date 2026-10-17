const User = require("../models/User");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../services/auth.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middleware/asyncHandler");

function publicUser(user) {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
  };
}

const signup = asyncHandler(async (req, res) => {
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = req.body.password;

  const existingUser = await User.findOne({ email }).lean();

  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await hashPassword(password);

  let user;

  try {
    user = await User.create({
      username,
      email,
      passwordHash,
    });
  } catch (error) {
    // Handle duplicate email submissions that happen simultaneously.
    if (error.code === 11000) {
      throw new AppError("Email already in use", 409);
    }

    throw error;
  }

  const token = generateToken(user._id);

  res.status(201).json({
    user: publicUser(user),
    token,
  });
});

const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = req.body.password;

  // passwordHash is excluded by default in the User schema.
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await comparePassword(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user._id);

  res.json({
    user: publicUser(user),
    token,
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new AppError("User not found", 401);
  }

  res.json({
    user: publicUser(user),
  });
});

module.exports = {
  signup,
  login,
  me,
};