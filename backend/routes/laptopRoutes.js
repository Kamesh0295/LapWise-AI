const express = require('express');
const laptopController = require('../controllers/laptopController');
const { protect, restrictTo, optionalProtect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { laptopRules } = require('../validators/laptopValidator');

const router = express.Router();

// Public routes
const getCatalogOrAllLaptops = (req, res, next) => {
  if (req.baseUrl.includes('catalog')) {
    return laptopController.getCatalog(req, res, next);
  }
  return laptopController.getAllLaptops(req, res, next);
};

router.get('/search', laptopController.searchCatalog);
router.get('/filter', laptopController.filterCatalog);
router.get('/', getCatalogOrAllLaptops);
router.get('/:id', optionalProtect, laptopController.getLaptop);
router.get('/:id/similar', laptopController.getSimilarLaptops);
router.get('/:id/alternatives', laptopController.getAlternativeLaptops);

// Admin-only protected routes
router.post(
  '/',
  protect,
  restrictTo('admin'),
  upload.array('images', 5), // Allow uploading up to 5 images
  laptopRules,
  laptopController.addLaptop
);

router.put(
  '/:id',
  protect,
  restrictTo('admin'),
  upload.array('images', 5),
  laptopController.updateLaptop
);

router.delete('/:id', protect, restrictTo('admin'), laptopController.deleteLaptop);

module.exports = router;
