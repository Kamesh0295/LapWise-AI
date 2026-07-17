const Laptop = require('../models/Laptop');
const SearchHistory = require('../models/SearchHistory');
const { formatResponse } = require('../utils/helpers');

/**
 * Autocomplete suggestions as user type query parameters 'q'
 */
const autocomplete = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(200).json(formatResponse('Autocomplete queries', []));
    }

    // Match brand or model starting with or containing query text
    const laptops = await Laptop.find({
      $or: [
        { brand: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } }
      ]
    })
      .select('brand model -_id')
      .limit(10);

    // Format unique terms
    const suggestionsSet = new Set();
    laptops.forEach(laptop => {
      suggestionsSet.add(`${laptop.brand} ${laptop.model}`);
      suggestionsSet.add(laptop.brand);
    });

    const suggestions = Array.from(suggestionsSet).slice(0, 10);

    // Save search query to history database (track what users are typing)
    if (q.trim().length > 2) {
      await SearchHistory.create({
        user: req.user ? req.user.id : undefined,
        query: q.trim().toLowerCase()
      });
    }

    res.status(200).json(formatResponse('Autocomplete suggestions retrieved', suggestions));
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch top 5 popular/trending queries
 */
const getPopularSearches = async (req, res, next) => {
  try {
    const popular = await SearchHistory.aggregate([
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const results = popular.map(item => item._id);

    res.status(200).json(formatResponse('Popular searches retrieved successfully', results));
  } catch (error) {
    next(error);
  }
};

/**
 * Get personal search history for the logged-in user
 */
const getSearchHistory = async (req, res, next) => {
  try {
    const history = await SearchHistory.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(20);

    res.status(200).json(formatResponse('User search history retrieved successfully', history));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  autocomplete,
  getPopularSearches,
  getSearchHistory
};
