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

module.exports = {
  generateRandomToken,
  hashToken,
  formatResponse,
};
