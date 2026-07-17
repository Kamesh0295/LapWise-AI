const mongoose = require('mongoose');

const specScoresSchema = new mongoose.Schema({
  cpu: { type: Number, required: true, min: 1, max: 100 },
  gpu: { type: Number, required: true, min: 1, max: 100 },
  cooling: { type: Number, required: true, min: 1, max: 100 },
  ram: { type: Number, required: true, min: 1, max: 100 },
  display: { type: Number, required: true, min: 1, max: 100 },
  battery: { type: Number, required: true, min: 1, max: 100 },
  keyboard: { type: Number, required: true, min: 1, max: 100 },
  weight: { type: Number, required: true, min: 1, max: 100 }, // lower weight = higher score
  speakers: { type: Number, required: true, min: 1, max: 100 },
  storage: { type: Number, required: true, min: 1, max: 100 }
}, { _id: false });

const laptopSchema = new mongoose.Schema(
  {
    series: {
      type: String,
      trim: true
    },
    launchYear: {
      type: Number,
      required: [true, 'Launch Year is required']
    },
    brightness: {
      type: Number, // In nits
      default: 300
    },
    warranty: {
      type: String,
      default: '1 Year Manufacturer Warranty'
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    processor: {
      type: String,
      required: [true, 'Processor description is required']
    },
    gpu: {
      type: String,
      required: [true, 'GPU description is required']
    },
    ram: {
      type: Number, // In GB
      required: [true, 'RAM in GB is required'],
      min: [1, 'RAM must be at least 1GB']
    },
    storage: {
      type: String,
      required: [true, 'Storage description is required']
    },
    display: {
      type: String,
      required: [true, 'Display description is required']
    },
    battery: {
      type: String,
      required: [true, 'Battery description is required']
    },
    weight: {
      type: Number, // In kg
      required: [true, 'Weight in kg is required'],
      min: [0, 'Weight cannot be negative']
    },
    screenSize: {
      type: Number, // In inches
      required: [true, 'Screen size is required']
    },
    refreshRate: {
      type: Number, // In Hz
      required: [true, 'Refresh rate is required']
    },
    operatingSystem: {
      type: String,
      required: [true, 'Operating System is required']
    },
    ports: [
      {
        type: String
      }
    ],
    features: [
      {
        type: String
      }
    ],
    purpose: {
      type: [String],
      enum: ['Gaming', 'Programming', 'Entertainment', 'General', 'Student', 'Office', 'Video Editing', 'AI / ML'],
      required: [true, 'At least one target purpose is required']
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    images: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    specScores: {
      type: specScoresSchema,
      required: [true, 'Specification performance scores are required for the recommendation engine']
    },
    storeLinks: [
      {
        storeName: { type: String, required: true },
        logoUrl: { type: String },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 }, // percentage discount
        availability: { type: String, enum: ['In Stock', 'Out of Stock'], default: 'In Stock' },
        buyUrl: { type: String, required: true }
      }
    ],
    priceHistory: [
      {
        price: { type: Number, required: true },
        recordedAt: { type: Date, default: Date.now }
      }
    ],
    serpProductId: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for text search, filtering, and sorting
laptopSchema.index({ brand: 'text', model: 'text', description: 'text' });
laptopSchema.index({ price: 1 });
laptopSchema.index({ brand: 1 });
laptopSchema.index({ purpose: 1 });

module.exports = mongoose.model('Laptop', laptopSchema);
