const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    // ==========================================
    // CONTEXT & PARTICIPANTS
    // ==========================================
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Ride ID reference is required'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required'],
    },
    senderRole: {
      type: String,
      enum: {
        values: ['customer', 'driver', 'admin'],
        message: 'Sender role must be customer, driver, or admin',
      },
      required: [true, 'Sender role is required'],
    },

    // ==========================================
    // MESSAGE PAYLOAD
    // ==========================================
    messageType: {
      type: String,
      enum: ['text', 'image', 'audio', 'location'],
      default: 'text',
    },
    text: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Message body cannot exceed 1000 characters'],
    },
    attachmentUrl: {
      type: String,
      default: '',
      trim: true,
    },
    locationData: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      address: { type: String, default: '' },
    },

    // ==========================================
    // STATUS & TIMESTAMPS
    // ==========================================
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Manages createdAt and updatedAt automatically
  }
);

// Compound indexes for high-performance query execution in chat windows
MessageSchema.index({ ride: 1, createdAt: 1 });
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);