require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const {
  notFoundHandler,
  errorHandler,
} = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const driverRoutes = require('./routes/driverRoutes');
const chatRoutes = require('./routes/chatRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const utilsRoutes = require('./routes/utilsRoutes');

const app = express();

app.disable('x-powered-by');

// ======================================================
// CORS
// ======================================================
const allowedOrigin = process.env.CLIENT_ORIGIN || '*';

app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ======================================================
// BODY PARSING
