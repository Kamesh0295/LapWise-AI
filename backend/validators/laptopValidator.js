const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation Error', errors.array()));
  }
  next();
};

const laptopRules = [
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('processor')
    .trim()
    .notEmpty()
    .withMessage('Processor spec is required'),
  body('gpu')
    .trim()
    .notEmpty()
    .withMessage('GPU spec is required'),
  body('ram')
    .notEmpty()
    .withMessage('RAM is required')
    .isInt({ min: 1 })
    .withMessage('RAM must be a positive integer in GB'),
  body('storage')
    .trim()
    .notEmpty()
    .withMessage('Storage spec is required'),
  body('display')
    .trim()
    .notEmpty()
    .withMessage('Display spec is required'),
  body('battery')
    .trim()
    .notEmpty()
    .withMessage('Battery spec is required'),
  body('weight')
    .notEmpty()
    .withMessage('Weight is required')
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number in kg'),
  body('screenSize')
    .notEmpty()
    .withMessage('Screen size is required')
    .isFloat({ min: 0 })
    .withMessage('Screen size must be a positive number in inches'),
  body('refreshRate')
    .notEmpty()
    .withMessage('Refresh rate is required')
    .isInt({ min: 0 })
    .withMessage('Refresh rate must be a positive integer in Hz'),
  body('operatingSystem')
    .trim()
    .notEmpty()
    .withMessage('Operating system is required'),
  body('purpose')
    .isArray({ min: 1 })
    .withMessage('Purpose must be an array with at least one purpose'),
  body('purpose.*')
    .isIn(['Gaming', 'Programming', 'Entertainment', 'General'])
    .withMessage('Purpose values must be Gaming, Programming, Entertainment, or General'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  
  // Spec scores validation
  body('specScores')
    .notEmpty()
    .withMessage('Specification performance scores object is required'),
  body('specScores.cpu')
    .isInt({ min: 1, max: 100 })
    .withMessage('CPU spec score must be an integer between 1 and 100'),
  body('specScores.gpu')
    .isInt({ min: 1, max: 100 })
    .withMessage('GPU spec score must be an integer between 1 and 100'),
  body('specScores.cooling')
    .isInt({ min: 1, max: 100 })
    .withMessage('Cooling spec score must be an integer between 1 and 100'),
  body('specScores.ram')
    .isInt({ min: 1, max: 100 })
    .withMessage('RAM spec score must be an integer between 1 and 100'),
  body('specScores.display')
    .isInt({ min: 1, max: 100 })
    .withMessage('Display spec score must be an integer between 1 and 100'),
  body('specScores.battery')
    .isInt({ min: 1, max: 100 })
    .withMessage('Battery spec score must be an integer between 1 and 100'),
  body('specScores.keyboard')
    .isInt({ min: 1, max: 100 })
    .withMessage('Keyboard spec score must be an integer between 1 and 100'),
  body('specScores.weight')
    .isInt({ min: 1, max: 100 })
    .withMessage('Weight spec score must be an integer between 1 and 100'),
  body('specScores.speakers')
    .isInt({ min: 1, max: 100 })
    .withMessage('Speakers spec score must be an integer between 1 and 100'),
  body('specScores.storage')
    .isInt({ min: 1, max: 100 })
    .withMessage('Storage spec score must be an integer between 1 and 100'),
  validate
];

module.exports = {
  laptopRules
};
