const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optional, track guest searches too
    },
    query: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000 // 30 days in seconds (TTL index)
    }
  }
);

// Indexes for popular query aggregation
searchHistorySchema.index({ query: 1 });
searchHistorySchema.index({ user: 1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
