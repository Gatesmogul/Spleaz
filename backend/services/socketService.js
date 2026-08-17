const User = require('../models/User');
const Ride = require('../models/Ride');
const Message = require('../models/Message');

/**
 * Initializes and manages Socket.io real-time event listeners.
 * 
 * @param {Object} io - Express Socket.io Server instance
 */
const initSocketService = (io) => {
  // Socket.io Middleware for Client Connection Authentication
  io.use((socket, next) => {
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
    const role = socket.handshake.auth?.role || socket.handshake.query?.role;

    if (!userId) {
      return next(new Error('Authentication error: Missing userId in socket handshake.'));
    }

    socket.userId = userId;
    socket.userRole = role || 'customer';
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: User ${socket.userId} (${socket.userRole}) | Socket ID: ${socket.id}`);

    // Automatically join user's personal private notification room
    const personalRoom = `user_${socket.userId}`;
    socket.join(personalRoom);

    // ==========================================
    // 1. RIDE ROOM MANAGEMENT
    // ==========================================

    /**
     * Join a specific ride room for live trip updates and chat
     * Event: 'join_ride_room'
     * Payload: { rideId: String }
     */
    socket.on('join_ride_room', async ({ rideId }) => {
      if (!rideId) return;

      const room = `ride_${rideId}`;
      socket.join(room);
      console.log(`[Socket]: User ${socket.userId} joined room ${room}`);

      socket.emit('room_joined', {
        success: true,
        room,
        rideId,
        message: `Successfully joined tracking/chat room for ride ${rideId}`,
      });
    });

    /**
     * Leave a ride room (e.g. trip completed or cancelled)
     * Event: 'leave_ride_room'
     * Payload: { rideId: String }
     */
    socket.on('leave_ride_room', ({ rideId }) => {
      if (!rideId) return;

      const room = `ride_${rideId}`;
      socket.leave(room);
      console.log(`[Socket]: User ${socket.userId} left room ${room}`);
    });

    // ==========================================
    // 2. LIVE GPS LOCATION BROADCASTING
    // ==========================================

    /**
     * Driver emits GPS coordinates & heading angle in real time
     * Event: 'driver_location_update'
     * Payload: { rideId: String, latitude: Number, longitude: Number, heading: Number }
     */
    socket.on('driver_location_update', async (data) => {
      try {
        const { rideId, latitude, longitude, heading = 0 } = data;

        if (!latitude || !longitude) return;

        // Update driver's location coordinates in MongoDB asynchronously
        await User.findByIdAndUpdate(socket.userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          heading,
          lastLocationUpdate: new Date(),
        });

        const locationPayload = {
          driverId: socket.userId,
          latitude,
          longitude,
          heading,
          timestamp: new Date().toISOString(),
        };

        // If active ride exists, broadcast location specifically to that ride's room
        if (rideId) {
          const room = `ride_${rideId}`;
          socket.to(room).emit('driver_location_changed', locationPayload);
        } else {
          // General broadcast for available nearby drivers viewing
          socket.broadcast.emit('nearby_driver_moved', locationPayload);
        }
      } catch (error) {
        console.error('[Socket - Location Update Error]:', error.message);
      }
    });

    // ==========================================
    // 3. REAL-TIME DIRECT CHAT
    // ==========================================

    /**
     * Send direct message during active trip
     * Event: 'send_message'
     * Payload: { rideId: String, recipientId: String, text: String, messageType: String, attachmentUrl: String }
     */
    socket.on('send_message', async (data) => {
      try {
        const { rideId, recipientId, text, messageType = 'text', attachmentUrl = '' } = data;

        if (!rideId || !recipientId || (!text && !attachmentUrl)) {
          return socket.emit('message_error', {
            message: 'Invalid message payload. Ride ID, recipient ID, and content are required.',
          });
        }

        // Save message record in database
        const newMessage = await Message.create({
          ride: rideId,
          sender: socket.userId,
          recipient: recipientId,
          senderRole: socket.userRole,
          text: text || '',
          messageType,
          attachmentUrl,
          status: 'sent',
        });

        await newMessage.populate([
          { path: 'sender', select: 'fullName profilePictureUrl' },
          { path: 'recipient', select: 'fullName profilePictureUrl' },
        ]);

        const room = `ride_${rideId}`;

        // Broadcast message to everyone in the ride room (including sender confirmation)
        io.in(room).emit('new_message', {
          messageId: newMessage._id,
          rideId,
          senderId: socket.userId,
          recipientId,
          senderRole: socket.userRole,
          text: newMessage.text,
          messageType: newMessage.messageType,
          attachmentUrl: newMessage.attachmentUrl,
          createdAt: newMessage.createdAt,
          sender: newMessage.sender,
        });
      } catch (error) {
        console.error('[Socket - Send Message Error]:', error.message);
        socket.emit('message_error', {
          message: 'Failed to process and send message.',
          error: error.message,
        });
      }
    });

    /**
     * Mark messages as read
     * Event: 'mark_messages_read'
     * Payload: { rideId: String }
     */
    socket.on('mark_messages_read', async ({ rideId }) => {
      try {
        if (!rideId) return;

        await Message.updateMany(
          { ride: rideId, recipient: socket.userId, status: { $ne: 'read' } },
          { $set: { status: 'read', readAt: new Date() } }
        );

        const room = `ride_${rideId}`;
        io.in(room).emit('messages_read_receipt', {
          rideId,
          readBy: socket.userId,
          readAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[Socket - Mark Read Error]:', error.message);
      }
    });

    // ==========================================
    // 4. DISCONNECTION HANDLING
    // ==========================================
    socket.on('disconnect', async () => {
      console.log(`[Socket Disconnected]: User ${socket.userId} | Socket ID: ${socket.id}`);

      // If user was a driver, mark them offline if no active socket connections remain
      if (socket.userRole === 'driver') {
        try {
          await User.findByIdAndUpdate(socket.userId, { isOnline: false });
          socket.broadcast.emit('driver_went_offline', { driverId: socket.userId });
        } catch (err) {
          console.error('[Socket - Driver Offline Sync Error]:', err.message);
        }
      }
    });
  });
};

module.exports = {
  initSocketService,
};