const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

const saveAvatarConfig = asyncHandler(async (req, res) => {
  const { hairId, skinToneId, accessoryIds } = req.body;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { avatarConfig: { hairId, skinToneId, accessoryIds } },
    { new: true }
  ).populate('avatarConfig.hairId avatarConfig.skinToneId avatarConfig.accessoryIds');

  if (!user) throw new AppError('User not found', 404);
  res.json(user.avatarConfig);
});

const getAvatarConfig = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId)
    .populate('avatarConfig.hairId avatarConfig.skinToneId avatarConfig.accessoryIds');

  if (!user) throw new AppError('User not found', 404);
  res.json(user.avatarConfig);
});

module.exports = { saveAvatarConfig, getAvatarConfig };