const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    laptop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laptop',
      required: [true, 'Review must relate to a laptop']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1-5)'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews: a user can only review a laptop once
reviewSchema.index({ laptop: 1, user: 1 }, { unique: true });

// Static method to calculate average rating of a laptop
reviewSchema.statics.calculateAverageRating = async function (laptopId) {
  const stats = await this.aggregate([
    {
      $match: { laptop: laptopId }
    },
    {
      $group: {
        _id: '$laptop',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Laptop').findByIdAndUpdate(laptopId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews
    });
  } else {
    await mongoose.model('Laptop').findByIdAndUpdate(laptopId, {
      rating: 0,
      numReviews: 0
    });
  }
};

// Call calculateAverageRating after saving review
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.laptop);
});

// Call calculateAverageRating before deleting review (triggered via findOneAndDelete/findOneAndRemove)
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.laptop);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
