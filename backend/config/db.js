const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (
    !mongoURI ||
    mongoURI.includes('<username>') ||
    mongoURI.includes('<password>')
  ) {
    throw new Error(
      'MONGO_URI is missing or still contains placeholder credentials.'
    );
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log(
      `[MongoDB] Connected database: ${mongoose.connection.name}`
    );
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Error:', err.message);
  });

  const conn = await mongoose.connect(mongoURI, {
    autoIndex: process.env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  console.log('==========================================');
  console.log('[MongoDB] CONNECTION SUCCESSFUL');
  console.log(`[MongoDB] Host: ${conn.connection.host}`);
  console.log(`[MongoDB] Database: ${conn.connection.name}`);
  console.log('==========================================');

  if (conn.connection.name !== 'Spleaz') {
    console.warn(
      `[MongoDB] WARNING: Expected database "Spleaz" but connected to "${conn.connection.name}"`
    );
  }

  return conn;
};

module.exports = connectDB;
