require('dotenv').config();

console.log('[Spleaz] server.js loading...');

const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('[Spleaz] Loading database configuration...');
const connectDB = require('./config/db');

console.log('[Spleaz] Loading socket configuration...');
const { initSocket } = require('./config/socket');

console.log('[Spleaz] Loading error middleware...');
const {
  notFoundHandler,
  errorHandler,
} = require('./middleware/errorHandler');

console.log('[Spleaz] Loading routes...');

const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const driverRoutes = require('./routes/driverRoutes');
const chatRoutes = require('./routes/chatRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const utilsRoutes = require('./routes/utilsRoutes');

console.log('[Spleaz] All modules loaded successfully.');

const app = express();

app.disable('x-powered-by');

// ==========================================
// CORS
// ==========================================

const allowedOrigins = [
  'https://spleaz-app.onrender.com',
  'http://localhost:8081',
  'http://localhost:19006',
];

if (process.env.CLIENT_ORIGIN) {
  const configuredOrigins = process.env.CLIENT_ORIGIN
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  configuredOrigins.forEach((origin) => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

console.log('[Spleaz] Allowed CORS origins:');
console.log(allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header.
    // This includes some server-to-server requests,
    // health checks, mobile clients, etc.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[Spleaz] CORS blocked origin: ${origin}`);

    return callback(
      new Error(`CORS blocked origin: ${origin}`)
    );
  },

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
  ],

  credentials: true,

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Explicitly handle CORS preflight requests.
app.options(/.*/, cors(corsOptions));

// ==========================================
// BODY PARSING
// ==========================================

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// ==========================================
// STATIC UPLOADS
// ==========================================

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Spleaz API is running',
    version: '1.0.0',
    database: 'MongoDB',
    frontend: 'https://spleaz-app.onrender.com',
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use(
  '/api/v1/auth',
  authRoutes
);

app.use(
  '/api/v1/rides',
  rideRoutes
);

app.use(
  '/api/v1/driver',
  driverRoutes
);

app.use(
  '/api/v1/chat',
  chatRoutes
);

app.use(
  '/api/v1/tracking',
  trackingRoutes
);

app.use(
  '/api/v1/utils',
  utilsRoutes
);

// ==========================================
// ERROR HANDLING
// ==========================================

app.use(notFoundHandler);

app.use(errorHandler);

// ==========================================
// HTTP SERVER
// ==========================================

console.log('[Spleaz] Creating HTTP server...');

const server = http.createServer(app);

// ==========================================
// SOCKET.IO
// ==========================================

console.log('[Spleaz] Initializing Socket.IO...');

let io;

try {
  io = initSocket(server);

  console.log(
    '[Spleaz] Socket.IO initialized successfully.'
  );
} catch (error) {
  console.error(
    '[Spleaz] Socket.IO initialization failed:'
  );

  console.error(error);

  process.exit(1);
}

// ==========================================
// PORT
// ==========================================

const PORT = Number(
  process.env.PORT || 5000
);

console.log(
  `[Spleaz] PORT = ${PORT}`
);

console.log(
  `[Spleaz] NODE_ENV = ${
    process.env.NODE_ENV || 'development'
  }`
);

// ==========================================
// START SERVER
// ==========================================

(async () => {
  try {
    console.log(
      '[Spleaz] Starting application...'
    );

    console.log(
      '[Spleaz] Connecting to MongoDB...'
    );

    await connectDB();

    console.log(
      '[Spleaz] MongoDB connected successfully.'
    );

    server.listen(
      PORT,
      '0.0.0.0',
      () => {
        console.log(
          `[Spleaz] API listening on 0.0.0.0:${PORT}`
        );

        console.log(
          `[Spleaz] Frontend allowed at: https://spleaz-app.onrender.com`
        );
      }
    );
  } catch (error) {
    console.error(
      '[Spleaz] STARTUP FAILED'
    );

    console.error(
      '------------------------------------------'
    );

    console.error(error);

    console.error(
      '------------------------------------------'
    );

    process.exit(1);
  }
})();

// ==========================================
// GLOBAL ERROR HANDLERS
// ==========================================

process.on(
  'unhandledRejection',
  (error) => {
    console.error(
      '[Spleaz] UNHANDLED REJECTION'
    );

    console.error(error);
  }
);

process.on(
  'uncaughtException',
  (error) => {
    console.error(
      '[Spleaz] UNCAUGHT EXCEPTION'
    );

    console.error(error);

    process.exit(1);
  }
);

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  app,
  server,
  io,
};
