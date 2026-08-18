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

// Helper to check if email verification is explicitly enabled or configured
const isVerificationRequired = () => {
  if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') return true;
  if (process.env.REQUIRE_EMAIL_VERIFICATION === 'false') return false;
  return Boolean(
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    !process.env.EMAIL_USER.includes('your_') &&
    !process.env.EMAIL_PASS.includes('your_')
  );
};

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    console.log(`[AUTH] Registration request received for: ${normalizedEmail}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log(`[AUTH] Registration failed: Email ${normalizedEmail} already exists`);
      return next(new ConflictError('Email is already registered. Please login instead.'));
    }

    // Generate email verification token
    const rawToken = generateRandomToken();
    const hashedVerificationToken = hashToken(rawToken);

    const requireVerification = isVerificationRequired();

    // Create user (password will be hashed ONCE by User Mongoose pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      isVerified: !requireVerification, // Auto-verify if email service is not configured
      verificationToken: hashedVerificationToken,
      verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours validity
    });

    console.log(`[AUTH] User created in database with ID: ${user._id} (isVerified: ${user.isVerified})`);

    // Automatically create a wishlist for the new user
    await Wishlist.create({ user: user._id });

    // Send verification email if verification is required
    let emailSent = false;
    let emailErrorMsg = '';
    if (requireVerification) {
      try {
        await emailService.sendVerificationEmail(user, rawToken);
        emailSent = true;
        console.log(`[AUTH] Verification email sent successfully to ${normalizedEmail}`);
      } catch (mailErr) {
        console.error('❌ Registration verification email failed to send:', mailErr.message);
        emailErrorMsg = mailErr.message;
      }
    }

    // Hide password before responding
    user.password = undefined;

    if (requireVerification && !emailSent) {
      return res.status(201).json(
        formatResponse(
          'Registration successful! However, verification email could not be sent due to mail server setup. Please use the resend verification option once email settings are configured.',
          { user, emailSent: false, emailError: emailErrorMsg }
        )
      );
    }

    const responseMsg = requireVerification
      ? 'Registration successful! Please check your email to verify your account.'
      : 'Registration successful! You can now log in directly.';

    res.status(201).json(
      formatResponse(responseMsg, { user, emailSent })
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

    // Verify password against stored bcrypt hash
    const isCorrect = await user.comparePassword(password);
    console.log(`[AUTH] Password comparison for ${normalizedEmail}: ${isCorrect}`);

    if (!isCorrect) {
      return next(new UnauthorizedError('Invalid email or password.'));
    }

    // Check if account email verification is required
    const requireVerification = isVerificationRequired();

    if (requireVerification && !user.isVerified) {
      console.log(`[AUTH] Login blocked: ${normalizedEmail} is not verified yet`);
      return next(
        new UnauthorizedError('Please verify your email address before logging in. Check your inbox for the verification link.')
      );
    }

    // Auto-verify existing unverified accounts if SMTP verification is disabled/unconfigured
    if (!user.isVerified && !requireVerification) {
      user.isVerified = true;
      await user.save();
      console.log(`[AUTH] Auto-verified existing user: ${normalizedEmail}`);
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
      return next(new BadRequestError('Verification token is invalid or has expired. Please request a new verification email.'));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    console.log(`[AUTH] Email verified successfully for user: ${user.email}`);

    res.status(200).json(formatResponse('Email verification successful! You can now log in to your account.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Resend Email Verification link
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new BadRequestError('Email address is required.'));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return next(new NotFoundError('No account found with that email address.'));
    }

    if (user.isVerified) {
      return next(new BadRequestError('This account is already verified. You can log in directly.'));
    }

    // Generate new verification token
    const rawToken = generateRandomToken();
    user.verificationToken = hashToken(rawToken);
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity
    await user.save();

    let emailSent = false;
    let emailErrorMsg = '';
    try {
      await emailService.sendVerificationEmail(user, rawToken);
      emailSent = true;
    } catch (mailErr) {
      console.error('❌ Resend verification email failed:', mailErr.message);
      emailErrorMsg = mailErr.message;
    }

    if (!emailSent) {
      return next(new AppError(`Failed to send verification email: ${emailErrorMsg || 'Mail server error'}. Please check your SMTP environment settings.`, 500));
    }

    res.status(200).json(formatResponse('A new verification email has been sent to your inbox. Please check your email.'));
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

    const hashed = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new BadRequestError('Reset token is invalid or has expired. Please request a new password reset link.'));
    }

    // Set new password (Mongoose pre-save hook will hash it ONCE)
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
    const { oldPassword, newPassword } = req.body;

    // Fetch user and explicitly request password
    const user = await User.findById(req.user.id).select('+password');

    // Confirm old password matches
    const isMatched = await user.comparePassword(oldPassword);
    if (!isMatched) {
      return next(new UnauthorizedError('Old password does not match.'));
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
    const normalizedEmail = email.trim().toLowerCase();

    // Find or create user
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true; // Auto-verify Google SSO users
        if (picture && user.profileImage.includes('default-avatar')) {
          user.profileImage = picture;
        }
        await user.save();
      }
    } else {
      // Create new user (Google verified email)
      user = await User.create({
        name,
        email: normalizedEmail,
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
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  googleLogin
};
