const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All wishlist actions require user authentication
router.use(protect);

router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/remove/:laptopId', wishlistController.removeFromWishlist);

module.exports = router;
