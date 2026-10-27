const User = require('../models/User');
const Item = require('../models/Item');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { ITEM_KEYS, COLOR_KEYS } = require('../config/categories');

// keep only known keys; anything else (e.g. drawing) is dropped
function pickAvatar(raw) {
  const out = {};
  for (const key of Object.keys(ITEM_KEYS)) {
    if (raw[key] !== undefined) out[key] = raw[key] === null ? null : Number(raw[key]);
  }
  for (const key of COLOR_KEYS) {
    if (raw[key] !== undefined) out[key] = raw[key];
  }
  return out;
}

const saveAvatars = asyncHandler(async (req, res) => {
  const avatars = req.body.avatars.map(pickAvatar);

  // every non-null item id must exist in its own category
  const seen = new Set();
  const pairs = [];
  for (const avatar of avatars) {
    for (const [key, category] of Object.entries(ITEM_KEYS)) {
      const itemId = avatar[key];
      if (itemId === null || itemId === undefined) continue;
      const tag = `${category}:${itemId}`;
      if (!seen.has(tag)) {
        seen.add(tag);
        pairs.push({ category, itemId });
      }
    }
  }
  if (pairs.length) {
    const found = await Item.countDocuments({ $or: pairs });
    if (found !== pairs.length) throw new AppError('Unknown item in avatar', 400);
  }

  const user = await User.findByIdAndUpdate(req.userId, { avatars }, { new: true });
  if (!user) throw new AppError('User not found', 404);
  res.json({ avatars: user.avatars });
});

const getAvatars = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found', 404);
  res.json({ avatars: user.avatars });
});

module.exports = { saveAvatars, getAvatars };