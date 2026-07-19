const express = require('express');
const catalogController = require('../controllers/catalogController');

const router = express.Router();

// Specific routes first to prevent routing overlap
router.get('/trending', catalogController.getTrending);
router.get('/latest', catalogController.getLatest);
router.get('/gaming', catalogController.getGaming);
router.get('/student', catalogController.getStudent);
router.get('/programming', catalogController.getProgramming);
router.get('/business', catalogController.getBusiness);
router.get('/random', catalogController.getRandom);
router.get('/search', catalogController.searchCatalog);
router.get('/filter', catalogController.filterCatalog);

// Manual sync trigger endpoint
router.post('/sync', catalogController.syncCatalogManual);

// Base catalog page routes
router.get('/', catalogController.getCatalog);

module.exports = router;
