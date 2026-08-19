const Laptop = require('../models/Laptop');
const PriceHistory = require('../models/PriceHistory');
const Store = require('../models/Store');
const serpApiService = require('./serpApiService');
const { extractLaptopPrice } = require('../utils/helpers');
const { VERIFIED_STORES, verifyStoreDomain } = require('../config/verifiedStores');

/**
 * Normalizes and validates store offer details
 */
const normalizeStoreOffer = (item, laptop) => {
  const rawUrl = item.product_link || item.link || item.buyUrl || 'https://google.com/shopping';
  const verification = verifyStoreDomain(rawUrl);
  const price = extractLaptopPrice(item);
  const oldPrice = item.extracted_old_price || item.old_price 
    ? parseFloat(String(item.extracted_old_price || item.old_price).replace(/[^0-9.]/g, '')) 
    : (price < (laptop.price || 0) ? laptop.price : 0);

  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const storeName = verification.verified ? verification.storeName : (item.source || 'Marketplace / Other Seller');

  return {
    storeName,
    storeKey: verification.storeKey,
    domain: verification.hostname,
    logoUrl: verification.logo || 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg',
    price,
    oldPrice: oldPrice > price ? oldPrice : price,
    discount,
    availability: item.availability || 'In Stock',
    delivery: item.delivery || 'Standard Delivery Available',
    buyUrl: verification.sanitizedUrl,
    verified: verification.verified
  };
};

/**
 * Checks if a SerpAPI shopping result matches the target laptop's hardware configuration
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

  // 3. Processor check (e.g. i5 vs i7)
  if (laptop.processor) {
    const isI7 = /i7/i.test(laptop.processor);
    const isI5 = /i5/i.test(laptop.processor);
    const isI9 = /i9/i.test(laptop.processor);

    if (isI7 && /i5|i9|ryzen/i.test(title) && !/i7/i.test(title)) return false;
    if (isI5 && /i7|i9|ryzen/i.test(title) && !/i5/i.test(title)) return false;
  }

  return true;
};

/**
 * Formats historical price data into timeframes (7d, 30d, 90d, 6m, 1y)
 */
const formatPriceTrendHistory = (historyRecords, currentPrice) => {
  const sorted = [...historyRecords].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const filterByDays = (days) => {
    const cutoff = now - (days * DAY_MS);
    const filtered = sorted.filter(r => new Date(r.recordedAt).getTime() >= cutoff);
    
    if (filtered.length === 0) {
      return [
        { date: `${days} Days Ago`, price: currentPrice + Math.round(currentPrice * 0.05) },
        { date: 'Today', price: currentPrice }
      ];
    }

    return filtered.map(r => ({
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
    lastChecked: sorted.length > 0 ? sorted[sorted.length - 1].recordedAt : new Date(),
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
 * Retrieves or refreshes multi-store price comparisons for a laptop
 * Implements 6-hour caching logic.
 */
const getComparisonForLaptop = async (laptopId) => {
  const laptop = await Laptop.findById(laptopId);
  if (!laptop) return null;

  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  const isStale = !laptop.lastUpdated || (Date.now() - new Date(laptop.lastUpdated).getTime()) > SIX_HOURS_MS;
  
  // If cache is fresh and we have storeLinks, use cached storeLinks
  if (!isStale && laptop.storeLinks && laptop.storeLinks.length > 0) {
    const historyRecords = await PriceHistory.find({ laptop: laptop._id }).sort({ recordedAt: -1 }).limit(50);
    const summary = computeStoreComparisonSummary(laptop.storeLinks, laptop, historyRecords);
    return { laptop, storeLinks: laptop.storeLinks, summary, isCached: true };
  }

  // Fetch live prices from SerpAPI Google Shopping
  const searchQuery = `${laptop.brand} ${laptop.model} ${laptop.ram}GB ${laptop.processor}`;
  let liveResults = await serpApiService.fetchShoppingResults(searchQuery);

  let updatedStores = [];
  if (liveResults && liveResults.length > 0) {
    // Filter results matching target laptop specs
    const matchingResults = liveResults.filter(p => isConfigurationMatch(p, laptop));
    const targetResults = matchingResults.length > 0 ? matchingResults : liveResults.slice(0, 5);

    const storeMap = new Map();
    for (const item of targetResults) {
      const offer = normalizeStoreOffer(item, laptop);
      if (!storeMap.has(offer.storeName) || offer.price < storeMap.get(offer.storeName).price) {
        storeMap.set(offer.storeName, offer);
      }
    }

    updatedStores = Array.from(storeMap.values()).sort((a, b) => a.price - b.price);
  }

  // Fallback to laptop's main price if no stores returned
  if (updatedStores.length === 0) {
    updatedStores = [{
      storeName: laptop.store || 'Online Marketplace',
      storeKey: 'marketplace',
      domain: 'google.com/shopping',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg',
      price: laptop.price,
      oldPrice: laptop.price + 3000,
      discount: 5,
      availability: 'In Stock',
      delivery: 'Fast Shipping Available',
      buyUrl: laptop.buyLink || 'https://google.com/shopping',
      verified: false
    }];
  }

  // Update laptop document in DB
  const lowestPrice = updatedStores[0].price;
  const oldPrice = laptop.price;
  laptop.storeLinks = updatedStores;
  laptop.price = lowestPrice;
  laptop.lastUpdated = new Date();
  await laptop.save();

  // Log price history if price changed or first record
  for (const storeOffer of updatedStores) {
    const recent = await PriceHistory.findOne({ 
      laptop: laptop._id, 
      store: storeOffer.storeName,
      price: storeOffer.price
    }).sort({ recordedAt: -1 });

    if (!recent) {
      await PriceHistory.create({
        laptop: laptop._id,
        store: storeOffer.storeName,
        price: storeOffer.price,
        oldPrice: storeOffer.oldPrice,
        currency: 'INR',
        productUrl: storeOffer.buyUrl,
        recordedAt: new Date(),
        checkedAt: new Date()
      });
    }
  }

  const historyRecords = await PriceHistory.find({ laptop: laptop._id }).sort({ recordedAt: -1 }).limit(50);
  const summary = computeStoreComparisonSummary(updatedStores, laptop, historyRecords);

  return { laptop, storeLinks: updatedStores, summary, isCached: false };
};

/**
 * Computes analytics and price drop summary statistics
 */
const computeStoreComparisonSummary = (storeLinks, laptop, historyRecords = []) => {
  if (!storeLinks || storeLinks.length === 0) {
    return {
      lowestPrice: laptop.price,
      highestPrice: laptop.price,
      priceDifference: 0,
      bestStore: { storeName: laptop.store || 'Online Store', price: laptop.price },
      trend: formatPriceTrendHistory(historyRecords, laptop.price)
    };
  }

  const prices = storeLinks.map(s => s.price);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const priceDifference = highestPrice - lowestPrice;
  const bestStore = storeLinks.find(s => s.price === lowestPrice) || storeLinks[0];

  const trend = formatPriceTrendHistory(historyRecords, lowestPrice);

  return {
    lowestPrice,
    highestPrice,
    priceDifference,
    bestStore,
    totalStores: storeLinks.length,
    verifiedStoresCount: storeLinks.filter(s => s.verified).length,
    trend
  };
};

module.exports = {
  verifyStoreDomain,
  normalizeStoreOffer,
  isConfigurationMatch,
  formatPriceTrendHistory,
  getComparisonForLaptop,
  computeStoreComparisonSummary
};
