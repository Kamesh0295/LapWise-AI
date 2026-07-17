require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Database connection config
const connectDB = require('./config/db');

// Error middlewares and custom classes
const errorHandler = require('./middlewares/errorMiddleware');
const { NotFoundError } = require('./utils/AppError');

// Route imports
const authRoutes = require('./routes/authRoutes');
const laptopRoutes = require('./routes/laptopRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Handle uncaught exceptions globally
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Server shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Initialize Express application
const app = express();

// Connect to MongoDB Database
connectDB();

// Setup security HTTP headers
app.use(helmet());

// Setup Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// HTTP request logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers (handling raw json & url-encoded payloads)
app.use(express.json({ limit: '10kb' })); // Limit body sizes to 10kb to avoid DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Mount Application API Routes
app.use('/api/auth', authRoutes);
app.use('/api/laptops', laptopRoutes);
app.use('/api/catalog', laptopRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);

// Fallback: handle unhandled route paths
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Cannot find route ${req.originalUrl} on this server`));
});

// Centralized error handling middleware
app.use(errorHandler);

// Set server port and run listener
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Server shutting down gracefully...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
