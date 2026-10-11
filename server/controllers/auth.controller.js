const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../services/auth.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

const signup = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already in use', 409);

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, passwordHash });
  const token = generateToken(user._id);
  res.status(201).json({ token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = generateToken(user._id);
  res.json({ token });
});

module.exports = { signup, login };