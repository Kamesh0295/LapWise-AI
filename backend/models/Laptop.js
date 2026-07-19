const mongoose = require('mongoose');

const specScoresSchema = new mongoose.Schema({
  cpu: { type: Number, default: 50, min: 1, max: 100 },
  gpu: { type: Number, default: 50, min: 1, max: 100 },
  cooling: { type: Number, default: 50, min: 1, max: 100 },
  ram: { type: Number, default: 50, min: 1, max: 100 },
  display: { type: Number, default: 50, min: 1, max: 100 },
  battery: { type: Number, default: 50, min: 1, max: 100 },
  keyboard: { type: Number, default: 50, min: 1, max: 100 },
  weight: { type: Number, default: 50, min: 1, max: 100 },
  speakers: { type: Number, default: 50, min: 1, max: 100 },
  storage: { type: Number, default: 50, min: 1, max: 100 }
}, { _id: false });

const laptopSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true
    },
    series: {
      type: String,
      trim: true,
      default: ''
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    thumbnail: {
      type: String,
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    buyLink: {
      type: String,
      default: ''
    },
    store: {
      type: String,
      trim: true,
      default: ''
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    // Keep numReviews synced for backward compatibility
    numReviews: {
      type: Number,
      default: 0
    },
    processor: {
      type: String,
      default: ''
    },
    gpu: {
      type: String,
      default: ''
    },
    ram: {
      type: Number, // In GB
      default: 8
    },
    storage: {
      type: String,
      default: ''
    },
    display: {
      type: String,
      default: ''
    },
    displaySize: {
      type: Number, // In inches
      default: 15.6
    },
    // Keep screenSize synced for backward compatibility
    screenSize: {
      type: Number, // In inches
      default: 15.6
    },
    refreshRate: {
      type: Number, // In Hz
      default: 60
    },
    battery: {
      type: String,
      default: ''
    },
    weight: {
      type: Number, // In kg
      default: 1.8
    },
    operatingSystem: {
      type: String,
      default: ''
    },
    launchYear: {
      type: Number,
      default: () => new Date().getFullYear()
    },
    purpose: {
      type: [String],
      default: ['General']
    },
    category: {
      type: String,
      default: 'General'
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      default: 'SerpAPI'
    },
    // Keep optional config / specs parameters
    warranty: {
      type: String,
      default: '1 Year Manufacturer Warranty'
    },
    brightness: {
      type: Number,
      default: 300
    },
    ports: {
      type: [String],
      default: []
    },
    features: {
      type: [String],
      default: []
    },
    specScores: {
      type: specScoresSchema,
      default: () => ({})
    },
    storeLinks: [
      {
        storeName: { type: String, required: true },
        logoUrl: { type: String },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        availability: { type: String, default: 'In Stock' },
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
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for text search, filtering, and sorting
laptopSchema.index({ 
  brand: 'text', 
  model: 'text', 
  processor: 'text', 
  gpu: 'text', 
  display: 'text', 
  title: 'text', 
  description: 'text'
});

laptopSchema.index({ price: 1 });
laptopSchema.index({ brand: 1 });
laptopSchema.index({ purpose: 1 });
laptopSchema.index({ rating: 1 });
laptopSchema.index({ processor: 1 });
laptopSchema.index({ gpu: 1 });
laptopSchema.index({ ram: 1 });
laptopSchema.index({ storage: 1 });
laptopSchema.index({ display: 1 });
laptopSchema.index({ isTrending: 1 });
laptopSchema.index({ isFeatured: 1 });
laptopSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Laptop', laptopSchema);
