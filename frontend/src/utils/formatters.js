/**
 * Format raw numbers as Indian Rupees (INR)
 * @param {number} amount 
 * @returns {string} Formatted currency text
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Scale spec metrics ratings to clean text levels
 * @param {number} rating - Scale 1 to 100
 */
export const formatSpecRating = (rating) => {
  if (rating >= 90) return 'Top Tier (Ultra)';
  if (rating >= 75) return 'Excellent (High)';
  if (rating >= 50) return 'Standard (Mid)';
  return 'Basic (Low)';
};
