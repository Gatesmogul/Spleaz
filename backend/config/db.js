const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (
    !mongoURI ||
    mongoURI.includes('<username>') ||
    mongoURI.includes('<password>')
  ) {
    throw new Error(
      'MONGO_URI is missing or still contains placeholder credentials. Configure backend/.env with a valid MongoDB URI.'
    );
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Error:', err.message);
  });

  const isProduction =
    String(process.env.NODE_ENV || '').toLowerCase() === 'production';

  const conn = await mongoose.connect(mongoURI, {
    autoIndex: !isProduction,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  console.log(
    `[MongoDB] Connected to ${conn.connection.host}/${conn.connection.name}`
  );

  return conn;
};

module.exports = connectDB;
