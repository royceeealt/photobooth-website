const mongoose = require('mongoose');

const stripDesignSchema = new mongoose.Schema({
  stripId: { type: Number, required: true },
  name: { type: String, required: true },
  assetUrl: { type: String, required: true },
  layoutType: { type: String, default: 'standard' } // e.g., 3-photo, 4-photo
});

// Unique index so we can upsert safely
stripDesignSchema.index({ stripId: 1 }, { unique: true });

module.exports = mongoose.model('StripDesign', stripDesignSchema);