const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      trim: true,
      lowercase: true,
      unique: true
    },
    logo: {
      type: String,
      default: ''
    },
    verified: {
      type: Boolean,
      default: false
    },
    country: {
      type: String,
      default: 'IN'
    },
    priority: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Store', storeSchema);
