const crypto = require('crypto');
const Laptop = require('../models/Laptop');
const PriceHistory = require('../models/PriceHistory');
const Store = require('../models/Store');
const serpApiService = require('./serpApiService');
const { extractLaptopPrice } = require('../utils/helpers');
const { VERIFIED_STORES, isVerifiedStore } = require('../config/verifiedStores');

/**
 * Generates an MD5 configuration hash for exact spec matching
 */
const generateConfigHash = (laptop) => {
  const specString = `${laptop.brand || ''}-${laptop.model || ''}-${laptop.ram || 16}-${laptop.storage || ''}-${laptop.processor || ''}-${laptop.gpu || ''}`.toLowerCase().replace(/\s+/g, '');
  return crypto.createHash('md5').update(specString).digest('hex');
};

/**
 * Normalizes and validates store offer details using strict URL domain verification
 */
const normalizeStoreOffer = (item, laptop) => {
  const rawUrl = item.product_link || item.link || item.buyUrl || item.serpapi_product_api || 'https://google.com/shopping';
  const verification = isVerifiedStore(rawUrl, item.source || item.seller);
  
  const price = extractLaptopPrice(item);
  const rawOldPrice = item.extracted_old_price || item.old_price;
  const oldPrice = rawOldPrice 
    ? parseFloat(String(rawOldPrice).replace(/[^0-9.]/g, '')) 
    : 0;

  const discount = (oldPrice > price && oldPrice < price * 2.5) ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  // Price anomaly check: if price is > 40% lower than laptop's benchmark price
  const isAnomaly = laptop.price && price < (laptop.price * 0.55);

  return {
    storeName: verification.isVerified ? verification.storeName : (verification.storeName || item.source || 'Marketplace / Other Seller'),
    storeKey: verification.storeKey,
    storeCategory: verification.storeCategory, // 'retailer' | 'manufacturer' | 'marketplace'
    domain: verification.domain,
    logoUrl: verification.logo || '',
    price,
    oldPrice: oldPrice > price ? oldPrice : 0,
    discount,
    availability: item.availability || 'In Stock',
    delivery: item.delivery || 'Standard Delivery Available',
    buyUrl: verification.sanitizedUrl,
    verified: verification.isVerified,
    configurationMismatch: isAnomaly,
    configNote: isAnomaly ? 'Configuration may differ' : ''
  };
};

/**
 * Checks if a SerpAPI shopping result strictly matches the target laptop's specs
 */
const isConfigurationMatch = (product, laptop) => {
  const title = (product.title || '').toLowerCase();
  
  // 1. RAM check
  if (laptop.ram) {
    const ramMatch = title.match(/\b(\d+)\s*gb\b/i);
    if (ramMatch) {
      const productRam = parseInt(ramMatch[1], 10);
      if (productRam !== laptop.ram) return false;
    }
  }

  // 2. Storage check (e.g. 512GB vs 1TB vs 256GB)
  if (laptop.storage) {
    const is512GB = /512\s*gb/i.test(laptop.storage);
    const is1TB = /1\s*tb|1024\s*gb/i.test(laptop.storage);
    const is256GB = /256\s*gb/i.test(laptop.storage);

    if (is512GB && (/1\s*tb|256\s*gb/i.test(title))) return false;
    if (is1TB && (/512\s*gb|256\s*gb/i.test(title))) return false;
    if (is256GB && (/512\s*gb|1\s*tb/i.test(title))) return false;
  }

  // 3. Processor check (e.g. i5 vs i7 vs i9)
  if (laptop.processor) {
    const isI7 = /i7/i.test(laptop.processor);
    const isI5 = /i5/i.test(laptop.processor);
    const isI9 = /i9/i.test(laptop.processor);

    if (isI7 && /i5|i9/i.test(title) && !/i7/i.test(title)) return false;
    if (isI5 && /i7|i9/i.test(title) && !/i5/i.test(title)) return false;
  }

  return true;
};

/**
 * Formats historical price data into timeframes.
 * Does NOT generate fake data. Returns empty state if fewer than 2 real points exist.
 */
const formatPriceTrendHistory = (historyRecords, currentPrice) => {
  if (!historyRecords || historyRecords.length === 0) {
    return {
      currentPrice,
      previousPrice: currentPrice,
      lowestRecordedPrice: currentPrice,
      highestRecordedPrice: currentPrice,
      averagePrice: currentPrice,
      priceChange: 0,
      priceChangePercent: 0,
      lastChecked: new Date(),
      hasEnoughData: false,
      timeframes: { '7d': [], '30d': [], '90d': [], '6m': [], '1y': [] }
    };
  }

  const sorted = [...historyRecords].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const filterByDays = (days) => {
    const cutoff = now - (days * DAY_MS);
    return sorted
      .filter(r => new Date(r.recordedAt).getTime() >= cutoff)
      .map(r => ({
        date: new Date(r.recordedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: r.price,
        store: r.store || 'Online Store'
      }));
  };

  const pricesList = sorted.map(r => r.price).concat([currentPrice]);
  const lowest = Math.min(...pricesList);
  const highest = Math.max(...pricesList);
  const avg = Math.round(pricesList.reduce((a, b) => a + b, 0) / pricesList.length);

  const previousPrice = sorted.length > 1 ? sorted[sorted.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? parseFloat(((priceChange / previousPrice) * 100).toFixed(1)) : 0;

  return {
    currentPrice,
    previousPrice,
    lowestRecordedPrice: lowest,
    highestRecordedPrice: highest,
    averagePrice: avg,
    priceChange,
    priceChangePercent,
    lastChecked: sorted[sorted.length - 1].recordedAt || new Date(),
    hasEnoughData: sorted.length >= 2,
    timeframes: {
      '7d': filterByDays(7),
      '30d': filterByDays(30),
      '90d': filterByDays(90),
      '6m': filterByDays(180),
      '1y': filterByDays(365)
    }
  };
};

/**
 * Controlled multi-store fetcher: performs generic search and targeted queries for top retailers if verified stores are missing.
 */
const fetchMultiStoreOffers = async (laptop) => {
  const genericQuery = `${laptop.brand} ${laptop.model} ${laptop.ram}GB ${laptop.processor}`;
  let liveResults = await serpApiService.fetchShoppingResults(genericQuery);

  let offersMap = new Map();

  const processResults = (items) => {
    for (const item of items) {
      if (!isConfigurationMatch(item, laptop)) continue;
      const offer = normalizeStoreOffer(item, laptop);
      if (!offersMap.has(offer.storeName) || offer.price < offersMap.get(offer.storeName).price) {
        offersMap.set(offer.storeName, offer);
      }
    }
  };

  if (liveResults && liveResults.length > 0) {
    processResults(liveResults);
  }

  // Controlled fallback query for major retailers if no verified retailer was found
  const hasVerified = Array.from(offersMap.values()).some(o => o.verified);
  if (!hasVerified) {
    const targetQuery = `${laptop.brand} ${laptop.model} Amazon India Flipkart Croma`;
    const targetedResults = await serpApiService.fetchShoppingResults(targetQuery);
    if (targetedResults && targetedResults.length > 0) {
      processResults(targetedResults);
    }
  }

  return Array.from(offersMap.values()).sort((a, b) => a.price - b.price);
};

/**
 * Retrieves cached price comparisons or triggers controlled fetch if stale
 */
const getComparisonForLaptop = async (laptopId, forceRefresh = false) => {
  const laptop = await Laptop.findById(laptopId);
  if (!laptop) return null;

  const configHash = generateConfigHash(laptop);
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  const isStale = !laptop.lastUpdated || (Date.now() - new Date(laptop.lastUpdated).getTime()) > SIX_HOURS_MS;

  // Use cache if fresh and not force refreshing
  if (!isStale && !forceRefresh && laptop.storeLinks && laptop.storeLinks.length > 0) {
    const historyRecords = await PriceHistory.find({ laptop: laptop._id, configurationHash: configHash })
      .sort({ recordedAt: -1 })
      .limit(50);
    const summary = computeStoreComparisonSummary(laptop.storeLinks, laptop, historyRecords);
    return { laptop, storeLinks: laptop.storeLinks, summary, isCached: true };
  }

  // Fetch live store offers
  let updatedStores = await fetchMultiStoreOffers(laptop);

  // Fallback if no stores were returned
  if (updatedStores.length === 0) {
    const defaultVerification = isVerifiedStore(laptop.buyLink || '', laptop.store || 'Online Retailer');
    updatedStores = [{
      storeName: defaultVerification.storeName || laptop.store || 'Online Retailer',
      storeKey: defaultVerification.storeKey,
      storeCategory: defaultVerification.storeCategory,
      domain: defaultVerification.domain || '',
      logoUrl: defaultVerification.logo || '',
      price: laptop.price,
      oldPrice: 0,
      discount: 0,
      availability: 'In Stock',
      delivery: 'Standard Delivery Available',
      buyUrl: defaultVerification.sanitizedUrl,
      verified: defaultVerification.isVerified,
      configurationMismatch: false,
      configNote: ''
    }];
  }

  // Update laptop document in DB
  const verifiedOffers = updatedStores.filter(s => s.verified && !s.configurationMismatch);
  const bestVerifiedPrice = verifiedOffers.length > 0 ? verifiedOffers[0].price : updatedStores[0].price;

  laptop.storeLinks = updatedStores;
  if (bestVerifiedPrice > 0) {
    laptop.price = bestVerifiedPrice;
  }
  laptop.lastUpdated = new Date();
  await laptop.save();

  // Record price history only for configuration matches
  for (const storeOffer of updatedStores) {
    if (storeOffer.configurationMismatch) continue;
    
    const recent = await PriceHistory.findOne({
      laptop: laptop._id,
      configurationHash: configHash,
      store: storeOffer.storeName,
      price: storeOffer.price
    }).sort({ recordedAt: -1 });

    if (!recent) {
      await PriceHistory.create({
        laptop: laptop._id,
        store: storeOffer.storeName,
        storeDomain: storeOffer.domain,
        configurationHash: configHash,
        price: storeOffer.price,
        oldPrice: storeOffer.oldPrice,
        currency: 'INR',
        productUrl: storeOffer.buyUrl,
        recordedAt: new Date(),
        checkedAt: new Date()
      });
    }
  }

  const historyRecords = await PriceHistory.find({ laptop: laptop._id, configurationHash: configHash })
    .sort({ recordedAt: -1 })
    .limit(50);
  
  const summary = computeStoreComparisonSummary(updatedStores, laptop, historyRecords);

  return { laptop, storeLinks: updatedStores, summary, isCached: false };
};

/**
 * Computes analytics and categorizes stores into 3 sections:
 * 1. Verified Retailers
 * 2. Official Manufacturer Stores
 * 3. Marketplace / Other Sellers
 */
const computeStoreComparisonSummary = (storeLinks = [], laptop, historyRecords = []) => {
  const verifiedRetailers = storeLinks.filter(s => s.verified && s.storeCategory === 'retailer' && !s.configurationMismatch);
  const officialManufacturers = storeLinks.filter(s => s.verified && s.storeCategory === 'manufacturer' && !s.configurationMismatch);
  const marketplaceSellers = storeLinks.filter(s => !s.verified || s.storeCategory === 'marketplace' || s.configurationMismatch);

  // Best Deal logic: prioritize verified store with lowest price that matches configuration
  const validOffers = storeLinks.filter(s => s.verified && !s.configurationMismatch);
  const candidateOffers = validOffers.length > 0 ? validOffers : storeLinks;

  const prices = candidateOffers.map(s => s.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : laptop.price;
  const highestPrice = prices.length > 0 ? Math.max(...prices) : laptop.price;
  const priceDifference = highestPrice - lowestPrice;
  const bestStore = candidateOffers.find(s => s.price === lowestPrice) || candidateOffers[0] || storeLinks[0];

  const trend = formatPriceTrendHistory(historyRecords, lowestPrice);

  return {
    lowestPrice,
    highestPrice,
    priceDifference,
    bestStore,
    totalStores: storeLinks.length,
    verifiedStoresCount: storeLinks.filter(s => s.verified).length,
    categorizedStores: {
      verifiedRetailers,
      officialManufacturers,
      marketplaceSellers
    },
    trend
  };
};

module.exports = {
  generateConfigHash,
  normalizeStoreOffer,
  isConfigurationMatch,
  formatPriceTrendHistory,
  getComparisonForLaptop,
  computeStoreComparisonSummary
};
