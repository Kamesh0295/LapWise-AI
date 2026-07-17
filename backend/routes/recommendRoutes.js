const express = require('express');
const recommendController = require('../controllers/recommendController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

// Apply general API rate limiter to recommendation endpoints
router.use(apiLimiter);

// Optional auth: Guests can get suggestions, but signed-in users get their runs saved to history
router.post('/wizard', optionalProtect, recommendController.getWizardRecommendations);
router.post('/ai', optionalProtect, recommendController.getAIRecommendations);

// Strictly protected history route
router.get('/history', protect, recommendController.getRecommendationHistory);

module.exports = router;
