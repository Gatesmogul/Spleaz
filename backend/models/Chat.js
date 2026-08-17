const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
  {
    // ==========================================
    // TRIP & SENDER REFERENCES
    // ==========================================
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Ride ID is required for chat messages'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    senderRole: {
      type: String,
      enum: {
        values: ['customer', 'driver'],
        message: 'Sender role must be either customer or driver',
      },
      required: [true, 'Sender role is required'],
    },

    // ==========================================
    // MESSAGE CONTENT & STATUS
    // ==========================================
    text: {
      type: String,
      required: [true, 'Message text cannot be empty'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
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

// Compound index for fast chronological fetching per ride
ChatSchema.index({ ride: 1, createdAt: 1 });

module.exports = mongoose.model('Chat', ChatSchema);