const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
  {
    laptop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laptop',
      required: true
    },
    store: {
      type: String,
      default: 'Online Store',
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    oldPrice: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    productUrl: {
      type: String,
      default: ''
    },
    recordedAt: {
      type: Date,
      default: Date.now
    },
    checkedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexing for rapid retrieval of price history charts
priceHistorySchema.index({ laptop: 1, recordedAt: 1 });
priceHistorySchema.index({ laptop: 1, store: 1, recordedAt: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
