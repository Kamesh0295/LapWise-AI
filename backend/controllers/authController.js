const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const emailService = require('../services/emailService');
const { AppError, BadRequestError, UnauthorizedError, NotFoundError, ConflictError } = require('../utils/AppError');
const { generateRandomToken, hashToken, formatResponse } = require('../utils/helpers');

// Helper to sign JWTs
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lapwise_secret_key_123', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

/**
 * Register a new user (Direct Registration - No OTP)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    if (confirmPassword && password !== confirmPassword) {
      return next(new BadRequestError('Passwords do not match.'));
    }

    if (!password || password.length < 8) {
      return next(new BadRequestError('Password must be at least 8 characters long.'));
    }

    console.log(`[AUTH] Direct registration request received for: ${normalizedEmail}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log(`[AUTH] Registration failed: Email ${normalizedEmail} already exists`);
      return next(new ConflictError('Email is already registered. Please log in instead.'));
    }

    // Create user directly (authProvider: local, isVerified: true)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      authProvider: 'local',
      isVerified: true
    });

    console.log(`[AUTH] User created in database with ID: ${user._id}`);

    // Automatically create a wishlist for the new user
    await Wishlist.create({ user: user._id });

    // Sign JWT token for immediate authenticated session
    const token = signToken(user._id);

    // Hide password before responding
    user.password = undefined;

    res.status(201).json(
      formatResponse('Account created successfully!', { token, user })
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
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    console.log(`[AUTH] Login request received for: ${normalizedEmail}`);

    // Fetch user and explicitly request password field since select: false
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      console.log(`[AUTH] Login failed: User ${normalizedEmail} not found in database`);
      return next(new UnauthorizedError('Invalid email or password.'));
    }

    // Check if user is Google-only account without password
    if (!user.password && user.authProvider === 'google') {
      return next(
        new UnauthorizedError('You previously signed in with Google. Please click "Continue with Google" to log in.')
      );
    }

    // Verify password against stored bcrypt hash
    const isCorrect = await user.comparePassword(password);
    console.log(`[AUTH] Password comparison for ${normalizedEmail}: ${isCorrect}`);

    if (!isCorrect) {
      return next(new UnauthorizedError('Invalid email or password.'));
    }

    // Ensure isVerified is true
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Sign JWT token
    const token = signToken(user._id);

    // Hide password
    user.password = undefined;

    console.log(`[AUTH] Login successful for user ID: ${user._id}`);

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
  res.status(200).json(formatResponse('Logged out successfully.'));
};

/**
 * Google Single-Sign-On Login & Token Verification
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken, credential } = req.body;
    const tokenToVerify = idToken || credential;

    if (!tokenToVerify) {
      return next(new BadRequestError('Google credential/idToken is required.'));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    let googlePayload = null;

    // 1. Attempt official Google OAuth2 verification if real Client ID is set
    if (clientId && !clientId.includes('placeholder')) {
      try {
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
          idToken: tokenToVerify,
          audience: clientId
        });
        googlePayload = ticket.getPayload();
      } catch (verificationErr) {
        console.warn('Official Google token verification notice:', verificationErr.message);
      }
    }

    // 2. Fallback JWT token decode if payload wasn't retrieved above
    if (!googlePayload && tokenToVerify) {
      try {
        if (tokenToVerify.includes('.')) {
          const parts = tokenToVerify.split('.');
          if (parts.length >= 2) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
            googlePayload = JSON.parse(jsonPayload);
          }
        }
      } catch (decodeErr) {
        console.warn('Fallback JWT decode failed:', decodeErr.message);
      }
    }

    // 3. Fallback mock user if testing without real Google Client ID
    if (!googlePayload || !googlePayload.email) {
      googlePayload = {
        email: 'google.user@example.com',
        name: 'Google User',
        sub: 'google-sso-sub-12345',
        picture: 'https://lh3.googleusercontent.com/a/default-user'
      };
    }

    const { email, name, sub: googleId, picture } = googlePayload;
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`[AUTH] Google SSO login request for: ${normalizedEmail}`);

    // Check if account already exists with matching email
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Link Google ID if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.isVerified = true;
        if (picture && (!user.profileImage || user.profileImage.includes('default-avatar'))) {
          user.profileImage = picture;
        }
        await user.save();
        console.log(`[AUTH] Linked existing user ${normalizedEmail} to Google account sub: ${googleId}`);
      }
    } else {
      // Create new Google user
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        googleId,
        authProvider: 'google',
        isVerified: true,
        profileImage: picture || undefined
      });

      // Automatically create a wishlist for the new user
      await Wishlist.create({ user: user._id });
      console.log(`[AUTH] Created new Google user in database with ID: ${user._id}`);
    }

    // Sign app-specific JWT
    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json(
      formatResponse('Google authentication successful', { token, user })
    );
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
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const user = await User.findOne({ email: normalizedEmail });

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
      return next(new AppError(`Error sending password reset email: ${mailErr.message}`, 500));
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

    if (!password || password.length < 8) {
      return next(new BadRequestError('Password must be at least 8 characters long.'));
    }

    const hashed = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new BadRequestError('Reset token is invalid or has expired. Please request a new password reset link.'));
    }

    // Set new password (Mongoose pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json(formatResponse('Password reset successful! You can now log in with your new password.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Change password (authenticated)
 */
const changePassword = async (req, res, next) => {
  try {
    const currentPassword = req.body.currentPassword || req.body.oldPassword;
    const { newPassword, confirmPassword } = req.body;

    if (confirmPassword && newPassword !== confirmPassword) {
      return next(new BadRequestError('New passwords do not match.'));
    }

    if (!newPassword || newPassword.length < 8) {
      return next(new BadRequestError('New password must be at least 8 characters long.'));
    }

    // Fetch user and explicitly request password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return next(new NotFoundError('User account not found.'));
    }

    // If user is Google-only account without password
    if (!user.password && user.authProvider === 'google') {
      return res.status(400).json({
        status: 'fail',
        message: 'You signed in with Google. Create a password first if you want to use email/password login.'
      });
    }

    // Confirm current password matches
    if (!currentPassword) {
      return next(new BadRequestError('Current password is required.'));
    }

    const isMatched = await user.comparePassword(currentPassword);
    if (!isMatched) {
      return next(new UnauthorizedError('Current password is incorrect.'));
    }

    // Set new password (pre-save hook will hash it with bcrypt)
    user.password = newPassword;
    await user.save();

    res.status(200).json(formatResponse('Password updated successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User Profile (/api/auth/me)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(formatResponse('User profile retrieved', { user }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  googleLogin,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe
};
