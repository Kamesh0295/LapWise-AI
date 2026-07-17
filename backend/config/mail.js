const nodemailer = require('nodemailer');

// Create Nodemailer SMTP transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT, 10) || 2525,
  secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for others
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Mail server connection failed:', error.message);
  } else {
    console.log('Mail server is ready to send notifications');
  }
});

module.exports = transporter;
