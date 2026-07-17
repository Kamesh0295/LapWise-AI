const User = require('../models/User');
const Laptop = require('../models/Laptop');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const RecommendationHistory = require('../models/RecommendationHistory');
const SearchHistory = require('../models/SearchHistory');
const { NotFoundError, BadRequestError } = require('../utils/AppError');
const { formatResponse } = require('../utils/helpers');

/**
 * Get basic dashboard counts and average reviews (Admin only)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalLaptops = await Laptop.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Average rating across all systems
    const ratingAggregate = await Laptop.aggregate([
      {
        $group: {
          _id: null,
          avgSystemRating: { $avg: '$rating' }
        }
      }
    ]);
    const averageRating = ratingAggregate.length > 0 ? Math.round(ratingAggregate[0].avgSystemRating * 10) / 10 : 0;

    res.status(200).json(
      formatResponse('Dashboard stats fetched successfully', {
        usersCount: totalUsers,
        adminsCount: totalAdmins,
        laptopsCount: totalLaptops,
        reviewsCount: totalReviews,
        averageRating
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get advanced platform usage analytics (Admin only)
 */
const getAnalytics = async (req, res, next) => {
  try {
    // 1. Total Recommendations Count
    const totalRecommendations = await RecommendationHistory.countDocuments();

    // 2. Top Wishlisted Laptops
    const topWishlisted = await Wishlist.aggregate([
      { $unwind: '$laptops' },
      {
        $group: {
          _id: '$laptops',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'laptops',
          localField: '_id',
          foreignField: '_id',
          as: 'laptopDetails'
        }
      },
      { $unwind: '$laptopDetails' },
      {
        $project: {
          _id: 1,
          count: 1,
          brand: '$laptopDetails.brand',
          model: '$laptopDetails.model',
          price: '$laptopDetails.price'
        }
      }
    ]);

    // 3. Most Popular Search Queries
    const popularQueries = await SearchHistory.aggregate([
      {
        $group: {
          _id: '$query',
          searchCount: { $sum: 1 }
        }
      },
      { $sort: { searchCount: -1 } },
      { $limit: 10 }
    ]);

    // 4. Recommendation Distributions (Gaming vs Programming vs Entertainment)
    const categoryDistribution = await RecommendationHistory.aggregate([
      {
        $group: {
          _id: '$purpose',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(
      formatResponse('Platform analytics aggregated successfully', {
        recommendationsTotalCount: totalRecommendations,
        topWishlistedLaptops: topWishlisted,
        popularSearchQueries: popularQueries,
        recommendationCategoryDistribution: categoryDistribution
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Users: Retrieve users list (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-verificationToken -verificationTokenExpire -resetPasswordToken -resetPasswordExpire')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    const totalUsers = await User.countDocuments();

    res.status(200).json(
      formatResponse('User profiles retrieved successfully', {
        users,
        pagination: {
          totalUsers,
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit)
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Users: Mutate user role (Admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return next(new BadRequestError('Role is required and must be either "user" or "admin".'));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError('User not found.'));
    }

    // Guard: Prevent self-demotion
    if (user._id.toString() === req.user.id && role !== 'admin') {
      return next(new BadRequestError('You cannot demote yourself from Admin status.'));
    }

    user.role = role;
    await user.save();

    res.status(200).json(formatResponse(`User role updated to ${role} successfully`, user));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user profile completely (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError('User not found.'));
    }

    if (user._id.toString() === req.user.id) {
      return next(new BadRequestError('You cannot delete your own admin account.'));
    }

    // Clean up user wishlist
    await Wishlist.deleteOne({ user: userId });

    // Clean up reviews written by this user
    const reviews = await Review.find({ user: userId });
    for (const review of reviews) {
      await Review.findByIdAndDelete(review._id);
    }

    // Clean up recommendations history logs
    await RecommendationHistory.deleteMany({ user: userId });

    // Delete user profile
    await User.findByIdAndDelete(userId);

    res.status(200).json(formatResponse('User and all associated records deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser
};
