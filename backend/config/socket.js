const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (httpServer) => {
  const allowedOrigins = [
    'https://Spleaz-app.onrender.com',
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

  console.log(
    '[Socket.IO] Allowed CORS origins:',
    allowedOrigins
  );

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests without an Origin header.
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.warn(
          `[Socket.IO] CORS blocked origin: ${origin}`
        );

        return callback(
          new Error(`Socket.IO CORS blocked origin: ${origin}`)
        );
      },

      methods: ['GET', 'POST'],

      credentials: true,
    },

    pingTimeout: Number(
      process.env.SOCKET_PING_TIMEOUT || 60000
    ),

    pingInterval: Number(
      process.env.SOCKET_PING_INTERVAL || 25000
    ),
  });

  // ==========================================
  // SOCKET AUTHENTICATION
  // ==========================================

  io.use((socket, next) => {
    try {
      const raw =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

      const token = String(raw || '').replace(
        /^Bearer\s+/,
        ''
      );

      if (!token) {
        return next(
          new Error('Authentication required')
        );
      }

      socket.user = jwt.verify(
        token,
        process.env.JWT_SECRET || 'change-me'
      );

      next();
    } catch (error) {
      console.error(
        '[Socket.IO] Authentication failed:',
        error.message
      );

      next(
        new Error('Invalid socket token')
      );
    }
  });

  // ==========================================
  // CONNECTION
  // ==========================================

  io.on('connection', (socket) => {
    const userId = String(socket.user.id);
    const role = socket.user.role;

    console.log(
      `[Socket.IO] User connected: ${userId} (${role})`
    );

    // ========================================
    // USER ROOM
    // ========================================

    socket.join(`user_${userId}`);

    // ========================================
    // RIDE ROOM
    // ========================================

    socket.on('join:ride_room', (rideId) => {
      if (!rideId) return;

      socket.join(`ride_${rideId}`);

      console.log(
        `[Socket.IO] ${userId} joined ride_${rideId}`
      );
    });

    socket.on('leave:ride_room', (rideId) => {
      if (!rideId) return;

      socket.leave(`ride_${rideId}`);

      console.log(
        `[Socket.IO] ${userId} left ride_${rideId}`
      );
    });

    // ========================================
    // DRIVER LOCATION
    // ========================================

    socket.on(
      'location:send',
      ({
        rideId,
        latitude,
        longitude,
        heading = 0,
      }) => {
        if (!rideId) return;

        if (
          !Number.isFinite(Number(latitude)) ||
          !Number.isFinite(Number(longitude))
        ) {
          return;
        }

        io
          .to(`ride_${rideId}`)
          .emit(
            'location:updated',
            {
              rideId,
              driverId: userId,
              latitude: Number(latitude),
              longitude: Number(longitude),
              heading: Number(heading),
              timestamp:
                new Date().toISOString(),
            }
          );
      }
    );

    // ========================================
    // CHAT
    // ========================================

    socket.on(
      'chat:send_message',
      (data) => {
        if (!data?.rideId) return;

        io
          .to(`ride_${data.rideId}`)
          .emit(
            'chat:message_received',
            {
              ...data,

              id:
                data.id ||
                `${Date.now()}-${socket.id}`,

              senderId: userId,
              senderRole: role,

              timestamp:
                new Date().toISOString(),
            }
          );
      }
    );

    // ========================================
    // PASSENGER WALKING OUT
    // ========================================

    socket.on(
      'ride:passenger_walking_out',
      ({ rideId }) => {
        if (!rideId) return;

        io
          .to(`ride_${rideId}`)
          .emit(
            'ride:status_changed',
            {
              rideId,
              status:
                'PASSENGER_WALKING_OUT',
              timestamp:
                new Date().toISOString(),
            }
          );
      }
    );

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on('disconnect', (reason) => {
      console.log(
        `[Socket.IO] User disconnected: ${userId} (${reason})`
      );
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error(
      'Socket.io has not been initialized.'
    );
  }

  return io;
};

module.exports = {
  initSocket,
  getIO,
};
