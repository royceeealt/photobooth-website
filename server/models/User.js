const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatarConfig: {
    hairId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    skinToneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    accessoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);