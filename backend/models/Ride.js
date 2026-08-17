const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema(
  {
    // ==========================================
    // TRIP PARTICIPANTS
    // ==========================================
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rider/Customer ID is required'],
      index: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // ==========================================
    // GEOGRAPHIC LOCATIONS & ADDRESSES
    // ==========================================
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Pickup coordinates [lng, lat] are required'],
      },
      address: {
        type: String,
        required: [true, 'Pickup street address is required'],
        trim: true,
      },
    },
    dropoffLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Dropoff coordinates [lng, lat] are required'],
      },
      address: {
        type: String,
        required: [true, 'Dropoff street address is required'],
        trim: true,
      },
    },

    // ==========================================
    // PRICING & ROUTE METRICS
    // ==========================================
    fare: {
      type: Number,
      required: [true, 'Upfront fare amount is required'],
      min: [0, 'Fare cannot be a negative amount'],
    },
    distance: {
      type: String,
      default: '0 km', // Human-readable distance text (e.g. "12.4 km")
    },
    duration: {
      type: String,
      default: '0 mins', // Human-readable duration text (e.g. "25 mins")
    },

    // ==========================================
    // TRIP STATUS & LIFECYCLE
    // ==========================================
    status: {
      type: String,
      enum: {
        values: [
          'pending',     // Customer requested, waiting for driver acceptance
          'accepted',    // Driver accepted request
          'arrived',     // Driver arrived at pickup location
          'in_progress', // Driver picked up customer, trip active
          'completed',   // Safely arrived at destination
          'cancelled',   // Cancelled by rider or driver
        ],
        message: 'Status `{VALUE}` is not a valid ride status',
      },
      default: 'pending',
      index: true,
    },

    // ==========================================
    // CANCELLATION & REASON AUDITING
    // ==========================================
    cancellationReason: {
      type: String,
      default: '',
      trim: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ==========================================
    // EARNINGS & PLATFORM COMMISSION
    // ==========================================
    commissionAmount: {
      type: Number,
      default: 0, // Platform service fee deduction
    },
    driverEarnings: {
      type: Number,
      default: 0, // Net payout to driver (Fare - Commission)
    },

    // ==========================================
    // SAFETY & LIVE TRACKING
    // ==========================================
    trackingToken: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // Allows null/undefined values without throwing duplicate key errors
    },

    // Timestamps for trip lifecycle checkpoints
    acceptedAt: { type: Date, default: null },
    arrivedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // Manages createdAt and updatedAt automatically
  }
);

// Geospatial 2dsphere indexes for pickup and dropoff queries
RideSchema.index({ pickupLocation: '2dsphere' });
RideSchema.index({ dropoffLocation: '2dsphere' });

module.exports = mongoose.model('Ride', RideSchema);