const mongoose = require('mongoose');
const dns = require('dns');

// Fix querySrv ECONNREFUSED on Windows networks by using Google Public DNS servers
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (dnsErr) {
  // Ignore if environment overrides DNS configuration
}

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

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
