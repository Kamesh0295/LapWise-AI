const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
  {
    laptop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laptop',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Indexing for retrieval of price history charts
priceHistorySchema.index({ laptop: 1, recordedAt: 1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
