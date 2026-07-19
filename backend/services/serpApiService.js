const dotenv = require('dotenv');
dotenv.config();

/**
 * Fetch results from SerpAPI Google Shopping Engine
 * Supports pagination via start offset to retrieve all available shopping results.
 * 
 * @param {string} query - The search query string
 * @returns {Promise<Array>} List of shopping products fetched from SerpAPI
 */
const fetchShoppingResults = async (query) => {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    console.error('SERPAPI_API_KEY is not defined in backend environment variables.');
    return [];
  }

  let allResults = [];
  let start = 0;
  let hasMore = true;
  let page = 1;
  const maxPages = 3; // Keep a safety limit of 3 pages (up to 180 results) per query to avoid draining query balance

  while (hasMore && page <= maxPages) {
    try {
      const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${apiKey}&gl=in&hl=en&start=${start}`;
      console.log(`[SerpAPI] Querying: "${query}" | Page ${page} | Start: ${start}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP status error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const shoppingResults = data.shopping_results || [];

      if (shoppingResults.length === 0) {
        hasMore = false;
        break;
      }

      allResults = allResults.concat(shoppingResults);
      console.log(`[SerpAPI] Received ${shoppingResults.length} items from page ${page}. Total items so far: ${allResults.length}`);

      // Google Shopping results return up to 60 items per page
      if (shoppingResults.length < 50) {
        hasMore = false;
      } else {
        start += 60;
        page++;
      }
      
      // Delay slightly between requests to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 800));

    } catch (error) {
      console.error(`[SerpAPI Error] Failed to fetch shopping results for query "${query}" on page ${page}:`, error.message);
      hasMore = false; // Stop paginating on error
    }
  }

  return allResults;
};

module.exports = {
  fetchShoppingResults
};
