const Review = require('../models/Review');
const Laptop = require('../models/Laptop');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/AppError');
const { formatResponse } = require('../utils/helpers');

/**
 * Add a review for a laptop
 */
const addReview = async (req, res, next) => {
  try {
    const { laptop, rating, comment } = req.body;

    // Verify laptop exists
    const targetLaptop = await Laptop.findById(laptop);
    if (!targetLaptop) {
      return next(new NotFoundError('The laptop you are trying to review does not exist.'));
    }

    // Check if user already reviewed this laptop
    const existingReview = await Review.findOne({ laptop, user: req.user.id });
    if (existingReview) {
      return next(new BadRequestError('You have already submitted a review for this laptop. Edit your existing review instead.'));
    }

    const review = await Review.create({
      user: req.user.id,
      laptop,
      rating,
      comment
    });

    res.status(201).json(formatResponse('Review added successfully', review));
  } catch (error) {
    next(error);
  }
};

/**
 * Edit an existing review
 */
const editReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return next(new NotFoundError('Review not found.'));
    }

    // Authorization: User must be the owner of the review
    if (review.user.toString() !== req.user.id) {
      return next(new ForbiddenError('You can only edit your own reviews.'));
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save(); // save() triggers schema pre/post hooks to update laptop average ratings

    res.status(200).json(formatResponse('Review updated successfully', review));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return next(new NotFoundError('Review not found.'));
    }

    // Authorization: User must be the owner or an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ForbiddenError('You do not have permission to delete this review.'));
    }

    // Use findByIdAndDelete to trigger Mongoose regexp post hooks for average calculation
    await Review.findByIdAndDelete(id);

    res.status(200).json(formatResponse('Review deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Like or unlike a review (toggle action)
 */
const likeReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return next(new NotFoundError('Review not found.'));
    }

    const likeIndex = review.likes.indexOf(req.user.id);
    let message = '';

    if (likeIndex === -1) {
      // Like review
      review.likes.push(req.user.id);
      message = 'Review liked successfully';
    } else {
      // Unlike review
      review.likes.splice(likeIndex, 1);
      message = 'Review unliked successfully';
    }

    await review.save();

    res.status(200).json(formatResponse(message, { likesCount: review.likes.length, likes: review.likes }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  editReview,
  deleteReview,
  likeReview
};
