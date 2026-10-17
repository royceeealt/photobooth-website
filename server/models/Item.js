const mongoose = require('mongoose');
const { ALL } = require('../config/categories');

const itemSchema = new mongoose.Schema({
  category: { type: String, enum: ALL, required: true },
  itemId: { type: Number, required: true },
  name: { type: String, required: true },
  assetUrl: { type: String, required: true },
  halfAssetUrl: { type: String },
  sortOrder: { type: Number, default: 0 },
});

itemSchema.index({ category: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Item', itemSchema);