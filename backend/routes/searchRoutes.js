const express = require('express');
const searchController = require('../controllers/searchController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Autocomplete is public but can log user searches if authenticated
router.get('/autocomplete', optionalProtect, searchController.autocomplete);

// Popular searches is open to everyone
router.get('/popular', searchController.getPopularSearches);

// Personal search history is restricted to authenticated users
router.get('/history', protect, searchController.getSearchHistory);

module.exports = router;
