const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const emailService = require('../services/emailService');
const { AppError, BadRequestError, UnauthorizedError, NotFoundError, ConflictError } = require('../utils/AppError');
const { generateRandomToken, hashToken, formatResponse } = require('../utils/helpers');

// Helper to sign JWTs
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError('Email is already registered. Please login instead.'));
    }

    // Generate email verification token
    const rawToken = generateRandomToken();
    const hashedVerificationToken = hashToken(rawToken);

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      verificationToken: hashedVerificationToken,
      verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours validity
    });

    // Automatically create a wishlist for the new user
    await Wishlist.create({ user: user._id });

    // Send verification email (don't block the HTTP response)
    try {
      await emailService.sendVerificationEmail(user, rawToken);
    } catch (mailErr) {
      console.error('Registration email failed to send:', mailErr.message);
    }

    // Hide password before responding
    user.password = undefined;

    res.status(201).json(
      formatResponse('Registration successful! Please check your email to verify your account.', { user })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user and explicitly request password field since it is selected false
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new UnauthorizedError('Invalid email or password.'));
    }

    // Verify password
    const isCorrect = await user.comparePassword(password);
    if (!isCorrect) {
      return next(new UnauthorizedError('Invalid email or password.'));
    }

    // Sign token
    const token = signToken(user._id);

    // Hide password
    user.password = undefined;

    res.status(200).json(
      formatResponse('Login successful', { token, user })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  // In stateless JWT architectures, logouts are handled client-side (token deletion)
  // We send a success code confirming signout
  res.status(200).json(formatResponse('Logged out successfully. Please clear your token from storage.'));
};

/**
 * Verify Email address
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashed = hashToken(token);

    const user = await User.findOne({
      verificationToken: hashed,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new BadRequestError('Verification token is invalid or has expired.'));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json(formatResponse('Email verification successful! You can now log in.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password - Generate reset token and email it
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new NotFoundError('No account found with that email address.'));
    }

    // Generate random reset token
    const rawResetToken = generateRandomToken();
    user.resetPasswordToken = hashToken(rawResetToken);
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes validity
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(user, rawResetToken);
      res.status(200).json(formatResponse('Password reset link sent to your email address.'));
    } catch (mailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return next(new AppError('There was an error sending the reset email. Try again later.', 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashed = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new BadRequestError('Reset token is invalid or has expired.'));
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json(formatResponse('Password reset successful! You can now login with your new password.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Change password (authenticated)
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Fetch user and explicitly request password
    const user = await User.findById(req.user.id).select('+password');

    // Confirm old password matches
    const isMatched = await user.comparePassword(oldPassword);
    if (!isMatched) {
      return next(new UnauthorizedError('Old password matches incorrectly.'));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(formatResponse('Password changed successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Google Single-Sign-On Login
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return next(new BadRequestError('Google idToken is required.'));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return next(new AppError('Google login is not configured on this server.', 500));
    }

    const client = new OAuth2Client(clientId);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId
      });
      payload = ticket.getPayload();
    } catch (verificationErr) {
      return next(new UnauthorizedError('Google authentication failed. Invalid token.'));
    }

    const { email, name, sub: googleId, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      // User exists, check if they already have a googleId
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture && user.profileImage.includes('default-avatar')) {
          user.profileImage = picture;
        }
        await user.save();
      }
    } else {
      // Create new user (skip verification because Google verified the email)
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true,
        profileImage: picture || undefined
      });

      // Automatically create a wishlist for the new user
      await Wishlist.create({ user: user._id });
    }

    // Sign app-specific JWT
    const token = signToken(user._id);

    res.status(200).json(
      formatResponse('Google login successful', { token, user })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  googleLogin
};
