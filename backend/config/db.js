const mongoose = require('mongoose');

const DATABASE_NAME = 'Spleaz';

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (
    !mongoURI ||
    mongoURI.includes('<username>') ||
    mongoURI.includes('<password>')
  ) {
    throw new Error(
      'MONGO_URI is missing or still contains placeholder credentials. Configure Render MONGO_URI with a valid MongoDB Atlas URI.'
    );
  }

  // Prevent accidental database-name casing problems.
  const cleanURI = mongoURI.replace(
    /mongodb(\+srv)?:\/\/([^/]+)\/{1,2}(?:[^?]*)/,
    (match, srv, credentials) => {
      return `mongodb${srv || ''}://${credentials}/${DATABASE_NAME}`;
    }
  );

  console.log('[MongoDB] Connecting...');
  console.log(`[MongoDB] Required database: ${DATABASE_NAME}`);

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log(
      `[MongoDB] Connection established. Database: ${mongoose.connection.name}`
    );
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Error:', err.message);
  });

  const conn = await mongoose.connect(cleanURI, {
    dbName: DATABASE_NAME,
    autoIndex: process.env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  console.log(
    `[MongoDB] Connected to ${conn.connection.host}/${conn.connection.name}`
  );

  if (conn.connection.name !== DATABASE_NAME) {
    throw new Error(
      `[MongoDB] DATABASE NAME MISMATCH. Expected "${DATABASE_NAME}" but connected to "${conn.connection.name}".`
    );
  }

  console.log(`[MongoDB] Database verified: ${DATABASE_NAME}`);

  return conn;
};

module.exports = connectDB;
