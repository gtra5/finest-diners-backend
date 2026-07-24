const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    // Spoonacular recipe ID
    spoonacularId: {
      type: Number,
      required: true,
      unique: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      default: 'Main',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
    // ── Cached Spoonacular fields ──────────────────────────────────────────────
    // Stored so the menu works even when the daily API quota is exhausted
    imageUrl: {
      type: String,
      default: '',
    },
    readyInMinutes: {
      type: Number,
      default: null,
    },
    servings: {
      type: Number,
      default: null,
    },
    cachedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', foodSchema);
