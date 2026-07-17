const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules
} = require('../validators/authValidator');

const router = express.Router();

// Apply auth rate limiter to all auth-related actions
router.post('/register', authLimiter, registerRules, authController.register);
router.post('/login', authLimiter, loginRules, authController.login);
router.post('/logout', authController.logout);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authLimiter, forgotPasswordRules, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordRules, authController.resetPassword);
router.post('/google-login', authLimiter, authController.googleLogin);

// Protected auth routes
router.put('/change-password', protect, changePasswordRules, authController.changePassword);

module.exports = router;
