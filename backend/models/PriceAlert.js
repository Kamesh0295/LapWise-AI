const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for price alert']
    },
    laptop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laptop',
      required: [true, 'Laptop is required for price alert']
    },
    targetPrice: {
      type: Number,
      required: [true, 'Target price is required'],
      min: [1, 'Target price must be greater than 0']
    },
    currentPrice: {
      type: Number,
      required: true
    },
    store: {
      type: String,
      default: 'Any Store'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

priceAlertSchema.index({ user: 1, laptop: 1, isActive: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
