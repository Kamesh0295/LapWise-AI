const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is MISSING in process.env!');
      throw new Error('MONGODB_URI environment variable is NOT set in Render Environment variables.');
    }

    // Mask sensitive credentials when logging connection attempt
    const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@');
    console.log(`Connecting to MongoDB at: ${maskedUri}`);

    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
