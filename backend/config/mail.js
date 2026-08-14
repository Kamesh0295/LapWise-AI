const nodemailer = require('nodemailer');

// Create Nodemailer SMTP transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for 587/2525
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Prevents TLS certificate rejection on cloud platforms
  }
});

// Verify connection configuration on server startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mail server connection failed:', error.message);
  } else {
    console.log('✅ Mail server is ready to send verification & notification emails');
  }
});

module.exports = transporter;
