const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // One wishlist per user
    },
    laptops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Laptop'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);
