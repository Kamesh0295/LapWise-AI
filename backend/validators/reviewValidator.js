const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation Error', errors.array()));
  }
  next();
};

const reviewRules = [
  body('laptop')
    .notEmpty()
    .withMessage('Laptop ID is required')
    .isMongoId()
    .withMessage('Laptop ID must be a valid Mongo ID'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ max: 1000 })
    .withMessage('Review comment cannot exceed 1000 characters'),
  validate
];

const updateReviewRules = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Review comment cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Review comment cannot exceed 1000 characters'),
  validate
];

module.exports = {
  reviewRules,
  updateReviewRules
};
