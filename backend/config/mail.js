const nodemailer = require('nodemailer');

const isMailConfigured = Boolean(
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  !process.env.EMAIL_USER.includes('your_') &&
  !process.env.EMAIL_PASS.includes('your_')
);

let transporter = null;

if (isMailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  transporter.verify((error) => {
    if (error) {
      console.warn('⚠️ Mail server verification warning:', error.message);
    } else {
      console.log('✅ Mail server is ready to send emails');
    }
  });
} else {
  console.log('ℹ️ Mail server connection skipped (No active SMTP credentials configured).');
}

module.exports = {
  transporter,
  isMailConfigured
};
