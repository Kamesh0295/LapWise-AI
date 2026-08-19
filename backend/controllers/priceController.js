const Laptop = require('../models/Laptop');
const PriceHistory = require('../models/PriceHistory');
const PriceAlert = require('../models/PriceAlert');
const priceService = require('../services/priceService');
const serpApiService = require('../services/serpApiService');
const { formatResponse } = require('../utils/helpers');
const { NotFoundError, BadRequestError } = require('../utils/AppError');

/**
 * GET /api/prices/:laptopId
 * Retrieves multi-store price comparison and analytics for a laptop
 */
const getLaptopPrices = async (req, res, next) => {
  try {
    const { laptopId } = req.params;
    const data = await priceService.getComparisonForLaptop(laptopId);

    if (!data) {
      return next(new NotFoundError('Laptop not found.'));
    }

    res.status(200).json(formatResponse('Price comparison data retrieved successfully', data));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/prices/search
 * Performs a live multi-store price search for a laptop query
 */
const searchLaptopPrices = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return next(new BadRequestError('Search query string is required'));
    }

    const results = await serpApiService.fetchShoppingResults(query.trim());
    const offers = results.map(item => priceService.normalizeStoreOffer(item, { price: 0 }));

    res.status(200).json(formatResponse('Live price search results retrieved', {
      query: query.trim(),
      totalResults: offers.length,
      offers
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/prices/:laptopId/history
 * Returns historical price points for 7d, 30d, 90d, 6m, 1y timeframes
 */
const getPriceHistory = async (req, res, next) => {
  try {
    const { laptopId } = req.params;
    const laptop = await Laptop.findById(laptopId);
    if (!laptop) {
      return next(new NotFoundError('Laptop not found.'));
    }

    const historyRecords = await PriceHistory.find({ laptop: laptop._id })
      .sort({ recordedAt: -1 })
      .limit(100);

    const trendData = priceService.formatPriceTrendHistory(historyRecords, laptop.price);

    res.status(200).json(formatResponse('Price history trend retrieved successfully', {
      laptopId: laptop._id,
      brand: laptop.brand,
      model: laptop.model,
      trend: trendData
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/prices/:laptopId/lowest
 * Returns lowest recorded price, best deal store, and savings
 */
const getLowestPrice = async (req, res, next) => {
  try {
    const { laptopId } = req.params;
    const laptop = await Laptop.findById(laptopId);
    if (!laptop) {
      return next(new NotFoundError('Laptop not found.'));
    }

    const historyRecords = await PriceHistory.find({ laptop: laptop._id }).sort({ price: 1 }).limit(1);
    const lowestRecord = historyRecords.length > 0 ? historyRecords[0] : null;

    const currentStoreLinks = laptop.storeLinks || [];
    const prices = currentStoreLinks.map(s => s.price);
    const currentLowest = prices.length > 0 ? Math.min(...prices) : laptop.price;
    const currentHighest = prices.length > 0 ? Math.max(...prices) : laptop.price;

    res.status(200).json(formatResponse('Lowest price information retrieved', {
      laptopId: laptop._id,
      brand: laptop.brand,
      model: laptop.model,
      currentLowestPrice: currentLowest,
      highestPrice: currentHighest,
      savings: currentHighest - currentLowest,
      lowestRecordedHistoricalPrice: lowestRecord ? lowestRecord.price : currentLowest,
      bestStore: currentStoreLinks.find(s => s.price === currentLowest) || { storeName: laptop.store, price: laptop.price }
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/price-alerts
 * Creates a target price drop alert for the logged-in user
 */
const createPriceAlert = async (req, res, next) => {
  try {
    const { laptopId, targetPrice, store } = req.body;
    if (!laptopId || !targetPrice) {
      return next(new BadRequestError('laptopId and targetPrice are required'));
    }

    const laptop = await Laptop.findById(laptopId);
    if (!laptop) {
      return next(new NotFoundError('Laptop not found'));
    }

    // Upsert active alert for user and laptop
    const alert = await PriceAlert.findOneAndUpdate(
      { user: req.user.id, laptop: laptop._id },
      {
        targetPrice: Number(targetPrice),
        currentPrice: laptop.price,
        store: store || 'Any Store',
        isActive: true
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(formatResponse('Price alert created successfully', alert));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/price-alerts
 * Retrieves active price alerts for the logged-in user
 */
const getUserPriceAlerts = async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find({ user: req.user.id, isActive: true })
      .populate('laptop', 'brand model title price thumbnail images')
      .sort('-createdAt');

    res.status(200).json(formatResponse('User price alerts retrieved successfully', alerts));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/price-alerts/:id
 * Deletes a price alert by ID
 */
const deletePriceAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await PriceAlert.findOneAndDelete({ _id: id, user: req.user.id });
    if (!alert) {
      return next(new NotFoundError('Price alert not found or unauthorized'));
    }

    res.status(200).json(formatResponse('Price alert deleted successfully', null));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/prices/:laptopId/refresh
 * Forces a live refresh of store offers via SerpAPI, validates domain/config, updates DB and returns fresh response
 */
const refreshLaptopPrices = async (req, res, next) => {
  try {
    const { laptopId } = req.params;
    const data = await priceService.getComparisonForLaptop(laptopId, true);

    if (!data) {
      return next(new NotFoundError('Laptop not found.'));
    }

    res.status(200).json(formatResponse('Price comparison data refreshed successfully', data));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLaptopPrices,
  searchLaptopPrices,
  getPriceHistory,
  getLowestPrice,
  createPriceAlert,
  getUserPriceAlerts,
  deletePriceAlert,
  refreshLaptopPrices
};
