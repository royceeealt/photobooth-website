const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['bodyType', 'eyes', 'lips', 'top', 'bottom', 'dresses', 'footwear', 'accessories'],
    required: true,
  },
  name: { type: String, required: true },
  assetUrl: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
});

module.exports = mongoose.model('Item', itemSchema);