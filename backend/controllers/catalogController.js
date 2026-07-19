const catalogService = require('../services/catalogService');
const catalogSyncService = require('../services/catalogSyncService');
const { formatResponse } = require('../utils/helpers');
const { BadRequestError } = require('../utils/AppError');

/**
 * Utility: Performs memory-based sorting on an array of laptops
 */
const sortLaptopsInMemory = (laptops, sortParam) => {
  const sorted = [...laptops];
  switch (sortParam) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating_desc':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'popular_desc':
      return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    case 'latest_added':
      return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    case 'newest':
    default:
      return sorted.sort((a, b) => {
        // Sort by launchYear first, then createdAt
        const yearDiff = (b.launchYear || 2024) - (a.launchYear || 2024);
        if (yearDiff !== 0) return yearDiff;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }
};

/**
 * Utility: Extracts paginated records from a memory array
 */
const paginateArray = (array, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = array.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    pagination: {
      totalItems: array.length,
      currentPage: page,
      totalPages: Math.ceil(array.length / limit) || 1,
      itemsPerPage: limit
    }
  };
};

/**
 * 1. GET /api/catalog
 * Retrieves default catalog. Fallback pipeline provides candidate laptops.
 */
const getCatalog = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;

    // Level 4 fallback fetches all general laptops
    let candidates = await catalogService.runFallbackFetch(null, null, null);
    
    // Memory sorting and padding to 20
    let processed = sortLaptopsInMemory(candidates, req.query.sort);
    processed = await catalogService.padLaptopsToAtLeast20(processed);

    const { items, pagination } = paginateArray(processed, page, limit);

    res.status(200).json(formatResponse('Catalog retrieved successfully', {
      laptops: items,
      pagination
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 2. GET /api/catalog/search
 * Search logic: fetches candidates, filters using text keywords matching in-memory.
 */
const searchCatalog = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;

    if (!q || q.trim() === '') {
      return next(new BadRequestError('Search query parameter "q" is required'));
    }

    const searchQuery = q.trim().toLowerCase();
    
    // Fetch general candidates
    let candidates = await catalogService.runFallbackFetch(null, null, null);

    // Apply keyword filter in-memory
    let searched = candidates.filter(l => 
      l.title.toLowerCase().includes(searchQuery) ||
      l.brand.toLowerCase().includes(searchQuery) ||
      l.model.toLowerCase().includes(searchQuery) ||
      l.processor.toLowerCase().includes(searchQuery) ||
      l.gpu.toLowerCase().includes(searchQuery) ||
      l.display.toLowerCase().includes(searchQuery) ||
      l.description.toLowerCase().includes(searchQuery)
    );

    // If search results are empty, immediately retry with purpose synonym or general search
    if (searched.length === 0) {
      console.log(`[catalogController] Search query "${q}" returned 0 matches in-memory. Returning padded recommendations.`);
      searched = candidates; // fall back to all candidates
    }

    // Sort and pad to 20
    let processed = sortLaptopsInMemory(searched, req.query.sort);
    processed = await catalogService.padLaptopsToAtLeast20(processed);

    const { items, pagination } = paginateArray(processed, page, limit);

    res.status(200).json(formatResponse('Search results retrieved successfully', {
      laptops: items,
      pagination
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 3. GET /api/catalog/filter
 * Filters candidates in-memory. Guarantees 0-matching is relaxed to show relevant matches.
 */
const filterCatalog = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;

    // Execute multi-tier fallback pipeline fetch
    const candidates = await catalogService.runFallbackFetch(
      req.query.brand, 
      req.query.purpose, 
      req.query.maxPrice
    );

    // Apply memory filters in backend
    let filtered = catalogService.filterLaptopsInMemory(candidates, req.query);

    // Verify list is not empty, pad to 20
    filtered = await catalogService.padLaptopsToAtLeast20(filtered);

    // Sort and Paginate
    let processed = sortLaptopsInMemory(filtered, req.query.sort);
    const { items, pagination } = paginateArray(processed, page, limit);

    res.status(200).json(formatResponse('Filtered catalog retrieved successfully', {
      laptops: items,
      pagination
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 4. GET /api/catalog/trending
 * Trending category laptops
 */
const getTrending = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    let candidates = await catalogService.runFallbackFetch(null, 'gaming', null);
    let trending = candidates.filter(l => l.rating >= 4.3);
    
    trending = await catalogService.padLaptopsToAtLeast20(trending);
    trending = sortLaptopsInMemory(trending, 'rating_desc').slice(0, limit);

    res.status(200).json(formatResponse('Trending laptops retrieved', { laptops: trending }));
  } catch (error) {
    next(error);
  }
};

/**
 * 5. GET /api/catalog/latest
 * Latest released laptops
 */
const getLatest = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    let candidates = await catalogService.runFallbackFetch(null, null, null);
    let latest = sortLaptopsInMemory(candidates, 'latest_added');
    
    latest = await catalogService.padLaptopsToAtLeast20(latest);
    latest = latest.slice(0, limit);

    res.status(200).json(formatResponse('Latest laptops retrieved', { laptops: latest }));
  } catch (error) {
    next(error);
  }
};

/**
 * 6. GET /api/catalog/gaming
 * Gaming category picks
 */
const getGaming = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    let candidates = await catalogService.runFallbackFetch(null, 'gaming', null);
    let gaming = candidates.filter(l => l.purpose.includes('Gaming'));
    
    gaming = await catalogService.padLaptopsToAtLeast20(gaming);
    gaming = sortLaptopsInMemory(gaming, 'rating_desc').slice(0, limit);

    res.status(200).json(formatResponse('Gaming picks retrieved', { laptops: gaming }));
  } catch (error) {
    next(error);
  }
};

/**
 * 7. GET /api/catalog/student
 * Student category picks
 */
const getStudent = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    let candidates = await catalogService.runFallbackFetch(null, 'student', null);
    let student = candidates.filter(l => l.purpose.includes('Student'));
    
    student = await catalogService.padLaptopsToAtLeast20(student);
    student = sortLaptopsInMemory(student, 'price_asc').slice(0, limit);

    res.status(200).json(formatResponse('Student picks retrieved', { laptops: student }));
  } catch (error) {
    next(error);
  }
};

/**
 * 8. GET /api/catalog/programming
 * Programming category picks
 */
const getProgramming = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    let candidates = await catalogService.runFallbackFetch(null, 'programming', null);
    let programming = candidates.filter(l => l.purpose.includes('Programming'));
    
    programming = await catalogService.padLaptopsToAtLeast20(programming);
    programming = sortLaptopsInMemory(programming, 'rating_desc').slice(0, limit);

    res.status(200).json(formatResponse('Programming picks retrieved', { laptops: programming }));
  } catch (error) {
    next(error);
  }
};

/**
 * 9. GET /api/catalog/business
 * Business and Office category picks
 */
const getBusiness = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    let candidates = await catalogService.runFallbackFetch(null, 'business', null);
    let business = candidates.filter(l => l.purpose.includes('Office') || l.purpose.includes('General'));
    
    business = await catalogService.padLaptopsToAtLeast20(business);
    business = sortLaptopsInMemory(business, 'rating_desc').slice(0, limit);

    res.status(200).json(formatResponse('Business picks retrieved', { laptops: business }));
  } catch (error) {
    next(error);
  }
};

/**
 * 10. POST /api/catalog/sync
 * Manually trigger SerpAPI synchronizer task
 */
const syncCatalogManual = async (req, res, next) => {
  try {
    const stats = await catalogSyncService.syncCatalog();
    res.status(200).json(formatResponse('Catalog Sync Completed successfully', stats));
  } catch (error) {
    next(error);
  }
};

/**
 * 11. GET /api/catalog/random
 * Fetch random laptop items
 */
const getRandom = async (req, res, next) => {
  try {
    const size = parseInt(req.query.size, 10) || 6;
    let candidates = await catalogService.runFallbackFetch(null, null, null);
    
    // Shuffle candidates array
    const shuffled = candidates.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, size);
    
    // Guarantee 20 list padding if requested size is larger, or just pad selection
    const padded = await catalogService.padLaptopsToAtLeast20(selected);
    const finalResult = padded.slice(0, Math.max(size, 20));

    res.status(200).json(formatResponse('Random laptops fetched successfully', { laptops: finalResult }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCatalog,
  searchCatalog,
  filterCatalog,
  getTrending,
  getLatest,
  getGaming,
  getStudent,
  getProgramming,
  getBusiness,
  syncCatalogManual,
  getRandom
};
