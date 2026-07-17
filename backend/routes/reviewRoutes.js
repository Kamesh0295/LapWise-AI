const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const { reviewRules, updateReviewRules } = require('../validators/reviewValidator');

const router = express.Router();

// All review operations require authenticated access
router.use(protect);

router.post('/', reviewRules, reviewController.addReview);
router.put('/:id', updateReviewRules, reviewController.editReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/like', reviewController.likeReview);

module.exports = router;
