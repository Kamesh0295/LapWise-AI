const Wishlist = require('../models/Wishlist');
const Laptop = require('../models/Laptop');
const { NotFoundError, BadRequestError } = require('../utils/AppError');
const { formatResponse } = require('../utils/helpers');

/**
 * Get current user's wishlist
 */
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('laptops');

    // Create a wishlist if for some reason the user doesn't have one
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, laptops: [] });
    }

    res.status(200).json(formatResponse('Wishlist retrieved successfully', wishlist.laptops));
  } catch (error) {
    next(error);
  }
};

/**
 * Add a laptop to user's wishlist
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { laptopId } = req.body;

    if (!laptopId) {
      return next(new BadRequestError('Laptop ID is required.'));
    }

    // Verify laptop exists in the database
    const laptop = await Laptop.findById(laptopId);
    if (!laptop) {
      return next(new NotFoundError('Laptop not found.'));
    }

    // Find user's wishlist or create one
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, laptops: [] });
    }

    // Check if laptop is already wishlisted
    const isAlreadyWishlisted = wishlist.laptops.includes(laptopId);
    if (isAlreadyWishlisted) {
      return next(new BadRequestError('This laptop is already in your wishlist.'));
    }

    wishlist.laptops.push(laptopId);
    await wishlist.save();

    res.status(200).json(formatResponse('Laptop added to wishlist successfully', wishlist.laptops));
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a laptop from user's wishlist
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { laptopId } = req.params;

    if (!laptopId) {
      return next(new BadRequestError('Laptop ID is required.'));
    }

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return next(new NotFoundError('Wishlist not found for this user.'));
    }

    // Check if laptop is actually in wishlist
    const index = wishlist.laptops.indexOf(laptopId);
    if (index === -1) {
      return next(new BadRequestError('This laptop is not in your wishlist.'));
    }

    wishlist.laptops.splice(index, 1);
    await wishlist.save();

    res.status(200).json(formatResponse('Laptop removed from wishlist successfully', wishlist.laptops));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
