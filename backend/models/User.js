const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    // ==========================================
    // CORE USER IDENTIFIERS
    // ==========================================
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Prevents password from being returned in standard queries
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'driver', 'admin'],
        message: 'Role must be either customer, driver, or admin',
      },
      default: 'customer',
    },
    profilePictureUrl: {
      type: String,
      default: '',
    },

    // ==========================================
    // LOCATION & ADDRESS DETAILS (Country, State, City)
    // ==========================================
    addressInfo: {
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'Nigeria',
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      streetAddress: {
        type: String,
        trim: true,
        default: '',
      },
    },

    // 2D GeoJSON Point for real-time proximity searches (e.g., finding nearby drivers)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: {
        type: String,
        default: '',
      },
    },
    heading: {
      type: Number,
      default: 0, // Vehicle direction in degrees (0-360)
    },
    lastLocationUpdate: {
      type: Date,
      default: Date.now,
    },

    // ==========================================
    // DRIVER-SPECIFIC ATTRIBUTES
    // ==========================================
    isOnline: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== 'driver'; // Auto-approve customers; drivers require admin review
      },
    },
    vehicle: {
      make: { type: String, trim: true, default: '' },       // e.g., Toyota
      model: { type: String, trim: true, default: '' },      // e.g., Corolla
      year: { type: Number, default: null },                 // e.g., 2018
      color: { type: String, trim: true, default: '' },      // e.g., Silver
      licensePlate: { type: String, trim: true, default: '' }, // e.g., KJA-123AA
    },

    // Rating & Review Metrics
    rating: {
      type: Number,
      default: 5.0,
      min: [1.0, 'Rating cannot be lower than 1.0'],
      max: [5.0, 'Rating cannot exceed 5.0'],
    },
    totalRides: {
      type: Number,
      default: 0,
    },

    // ==========================================
    // DRIVER EARNINGS & COMMISSION MANAGEMENT
    // ==========================================
    totalEarnings: {
      type: Number,
      default: 0,
    },
    unpaidCommission: {
      type: Number,
      default: 0,
    },
    isVerified: { type: Boolean, default: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    commissionReceipts: [
      {
        receiptUrl: { type: String, required: true },
        amountPaid: { type: Number, required: true },
        paymentReference: { type: String, default: '' },
        notes: { type: String, default: '' },
        status: {
          type: String,
          enum: ['pending_verification', 'approved', 'rejected'],
          default: 'pending_verification',
        },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Create 2dsphere index on location field for spatial geospatial queries (finding drivers within N km)
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);