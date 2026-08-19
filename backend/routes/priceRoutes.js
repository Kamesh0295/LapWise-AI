const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');
const { protect } = require('../middlewares/authMiddleware');

// Public price comparison endpoints
router.get('/prices/search', (req, res) => res.status(405).json({ message: 'Use POST for price search' }));
router.post('/prices/search', priceController.searchLaptopPrices);

router.get('/prices/:laptopId', priceController.getLaptopPrices);
router.get('/prices/:laptopId/history', priceController.getPriceHistory);
router.get('/prices/:laptopId/lowest', priceController.getLowestPrice);

// Protected price alert endpoints
router.post('/price-alerts', protect, priceController.createPriceAlert);
router.get('/price-alerts', protect, priceController.getUserPriceAlerts);
router.delete('/price-alerts/:id', protect, priceController.deletePriceAlert);

module.exports = router;
