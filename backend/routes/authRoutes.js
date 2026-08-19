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

// Public auth endpoints
router.post('/register', authLimiter, registerRules, authController.register);
router.post('/login', authLimiter, loginRules, authController.login);
router.post('/logout', authController.logout);
router.post('/google', authLimiter, authController.googleLogin);
router.post('/google-login', authLimiter, authController.googleLogin);
router.post('/forgot-password', authLimiter, forgotPasswordRules, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordRules, authController.resetPassword);

// Protected auth endpoints
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, changePasswordRules, authController.changePassword);

module.exports = router;
