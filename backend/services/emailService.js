const { transporter, isMailConfigured } = require('../config/mail');

/**
 * Send email verification link
 * @param {object} user - User document
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (user, token) => {
  if (!isMailConfigured || !transporter) {
    console.log(`[EMAIL] Mail server unconfigured. Cannot send verification email for ${user.email}`);
    throw new Error('SMTP email server is not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
  }
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333333; text-align: center;">Verify Your Email Address</h2>
      <p style="color: #666666; font-size: 16px;">Hello ${user.name},</p>
      <p style="color: #666666; font-size: 16px;">Thank you for registering on Laptop Recommendation System. Please verify your email by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email</a>
      </div>
      <p style="color: #999999; font-size: 12px; text-align: center;">If the button doesn't work, copy and paste this link in your browser: <br>${verifyUrl}</p>
      <p style="color: #999999; font-size: 14px;">This link will expire in 24 hours.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Laptop Recs" <${process.env.EMAIL_FROM || 'noreply@laptoprecs.com'}>`,
    to: user.email,
    subject: 'Verify your email address - Laptop Recs',
    html: htmlContent
  });
};

/**
 * Send password reset email
 * @param {object} user - User document
 * @param {string} token - Password reset token
 */
const sendPasswordResetEmail = async (user, token) => {
  if (!isMailConfigured || !transporter) {
    console.log(`[EMAIL] Mail server unconfigured. Cannot send password reset email for ${user.email}`);
    throw new Error('SMTP email server is not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
  }
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #d32f2f; text-align: center;">Reset Your Password</h2>
      <p style="color: #666666; font-size: 16px;">Hello ${user.name},</p>
      <p style="color: #666666; font-size: 16px;">You requested a password reset. Please click the button below to choose a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #999999; font-size: 12px; text-align: center;">If the button doesn't work, copy and paste this link in your browser: <br>${resetUrl}</p>
      <p style="color: #999999; font-size: 14px;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
      <p style="color: #999999; font-size: 14px;">This link is valid for 10 minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Laptop Recs" <${process.env.EMAIL_FROM || 'noreply@laptoprecs.com'}>`,
    to: user.email,
    subject: 'Password Reset Request - Laptop Recs',
    html: htmlContent
  });
};

/**
 * Send price drop email alert
 * @param {object} user - User document
 * @param {object} laptop - Laptop document
 * @param {number} oldPrice - Previous price
 * @param {number} newPrice - New lowered price
 */
const sendPriceDropEmail = async (user, laptop, oldPrice, newPrice) => {
  if (!isMailConfigured || !transporter) {
    console.log(`[EMAIL] Mail server unconfigured. Skipping price drop alert email for ${user.email}`);
    return;
  }
  const laptopUrl = `${process.env.FRONTEND_URL}/laptops/${laptop._id}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #ff9800; text-align: center;">Price Drop Alert! 📉</h2>
      <p style="color: #666666; font-size: 16px;">Hello ${user.name},</p>
      <p style="color: #666666; font-size: 16px;">Good news! A laptop on your wishlist has dropped in price:</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">${laptop.brand} ${laptop.model}</h3>
        <p style="margin: 5px 0; font-size: 16px;"><strong>Old Price:</strong> <span style="text-decoration: line-through; color: #d32f2f;">₹${oldPrice.toLocaleString('en-IN')}</span></p>
        <p style="margin: 5px 0; font-size: 18px; color: #2e7d32;"><strong>New Price:</strong> <strong>₹${newPrice.toLocaleString('en-IN')}</strong></p>
      </div>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${laptopUrl}" style="background-color: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">View Laptop Deal</a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Laptop Recs Alert" <${process.env.EMAIL_FROM || 'noreply@laptoprecs.com'}>`,
    to: user.email,
    subject: `Price Drop Alert: ${laptop.brand} ${laptop.model} is now cheaper!`,
    html: htmlContent
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPriceDropEmail
};
