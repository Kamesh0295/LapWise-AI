const crypto = require('crypto');

/**
 * Generate a random secure token
 * @returns {string} Hex token
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a plain text token with SHA256
 * @param {string} token 
 * @returns {string} Hex hash
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Format API response consistently
 * @param {string} message 
 * @param {any} data 
 * @param {boolean} success 
 */
const formatResponse = (message, data = null, success = true) => {
  return {
    success,
    message,
    data,
  };
};

/**
 * Estimates realistic laptop market price based on hardware specifications
 * @param {object} product 
 * @returns {number} Estimated price in INR
 */
const estimatePriceFromSpecs = (product = {}) => {
  const text = `${product.title || ''} ${product.processor || ''} ${product.gpu || ''} ${product.model || ''}`.toLowerCase();
  
  if (/rtx 4090|rtx 4080|core i9|ryzen 9/i.test(text)) return 185000;
  if (/rtx 4070|rtx 4060|core i7|ryzen 7|m3 pro|m3 max|m2 pro/i.test(text)) return 98000;
  if (/rtx 4050|rtx 3050|core i5|ryzen 5|m1|m2|m3/i.test(text)) return 58000;
  if (/core i3|ryzen 3|celeron/i.test(text)) return 36000;
  
  return 49990;
};

/**
 * Normalizes currency and bounds for extracted price numerical values
 * @param {number} val 
 * @param {object} product 
 * @param {string} contextStr 
 * @returns {number} Normalized price in INR
 */
const normalizePriceValue = (val, product, contextStr = '') => {
  const isUSD = (contextStr && (contextStr.includes('$') || /usd/i.test(contextStr))) || 
                (val > 0 && val < 2500 && !contextStr.includes('₹') && !/inr|rs/i.test(contextStr));

  let finalPrice = val;
  if (isUSD) {
    finalPrice = Math.round(val * 85); // Convert USD to INR
  }

  // Bounds checking: laptop prices in INR should realistically be between 10,000 and 1,000,000
  if (finalPrice < 10000 || finalPrice > 1000000) {
    return estimatePriceFromSpecs(product);
  }

  return Math.round(finalPrice);
};

/**
 * Utility function to robustly extract and normalize laptop prices from API item objects (SerpAPI / Google Shopping).
 * 
 * @param {object} product - Product object from SerpAPI or MongoDB document
 * @returns {number} Normalized price in INR (integer)
 */
const extractLaptopPrice = (product) => {
  if (!product) return 49990;

  // 1. Direct numeric properties in order of preference
  const numCandidates = [
    product.extracted_price,
    product.extracted_item_price,
    product.extracted_store_price,
    product.extracted_old_price
  ];

  for (const val of numCandidates) {
    if (typeof val === 'number' && !isNaN(val) && val > 0) {
      const normalized = normalizePriceValue(val, product);
      if (normalized > 0) return normalized;
    }
  }

  // 2. Check nested prices array
  if (Array.isArray(product.prices) && product.prices.length > 0) {
    for (const pObj of product.prices) {
      if (pObj && typeof pObj.extracted_price === 'number' && pObj.extracted_price > 0) {
        const normalized = normalizePriceValue(pObj.extracted_price, product);
        if (normalized > 0) return normalized;
      }
    }
  }

  // 3. String price extraction candidate fields
  const stringCandidates = [
    product.price,
    product.item_price,
    product.store_price,
    product.price_raw,
    product.extracted_price,
    ...(Array.isArray(product.extensions) ? product.extensions : [])
  ];

  for (const rawVal of stringCandidates) {
    if (!rawVal) continue;
    const str = String(rawVal).trim();
    if (!str) continue;

    // Match individual price patterns e.g. "54,990", "1,19,990.00", "699.99"
    const priceMatches = str.match(/(?:₹|\$|€|£|INR|USD)?\s*([\d]{1,3}(?:,[\d]{2,3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi);
    if (priceMatches && priceMatches.length > 0) {
      for (const matchStr of priceMatches) {
        // Strip everything except digits and single decimal dot
        const digitsOnly = matchStr.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(digitsOnly);

        if (!isNaN(parsed) && parsed > 0) {
          const normalized = normalizePriceValue(parsed, product, str);
          if (normalized > 0) return normalized;
        }
      }
    }
  }

  // 4. Fallback price estimation based on specs
  return estimatePriceFromSpecs(product);
};

module.exports = {
  generateRandomToken,
  hashToken,
  formatResponse,
  extractLaptopPrice,
  estimatePriceFromSpecs
};

