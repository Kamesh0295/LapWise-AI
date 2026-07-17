const mongoose = require('mongoose');

const recommendedLaptopItemSchema = new mongoose.Schema({
  laptop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Laptop',
    required: true
  },
  matchPercentage: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    required: true
  }
}, { _id: false });

const recommendationHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optional, can be used for guest recommendations
    },
    purpose: {
      type: String,
      required: true,
      enum: ['Gaming', 'Programming', 'Entertainment', 'General']
    },
    answers: {
      type: mongoose.Schema.Types.Mixed, // Stores whatever key-value questions/answers were submitted
      required: true
    },
    recommendations: [recommendedLaptopItemSchema]
  },
  {
    timestamps: true
  }
);

// Indexing for user history retrieval
recommendationHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('RecommendationHistory', recommendationHistorySchema);
