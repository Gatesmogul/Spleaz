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
      select: false,
    },

    // ==========================================
    // USER ROLE
    // ==========================================
    // Public registration only allows:
    // - customer
    // - driver
    //
    // admin accounts are created through the backend.
    role: {
      type: String,
      enum: {
        values: ['customer', 'driver', 'admin'],
        message: 'Role must be customer, driver, or admin',
      },
      default: 'customer',
    },

    profilePictureUrl: {
      type: String,
      default: '',
    },

    // ==========================================
    // ADDRESS DETAILS
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

    // ==========================================
    // GEO LOCATION
    // ==========================================
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },

      address: {
        type: String,
        default: '',
      },
    },

    heading: {
      type: Number,
      default: 0,
      min: 0,
      max: 360,
    },

    lastLocationUpdate: {
      type: Date,
      default: Date.now,
    },

    // ==========================================
    // DRIVER STATUS
    // ==========================================
    isOnline: {
      type: Boolean,
      default: false,
    },

    // Customers are automatically approved.
    // Drivers require admin approval.
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== 'driver';
      },
    },

    // ==========================================
    // DRIVER VEHICLE DETAILS
    // ==========================================
    vehicle: {
      make: {
        type: String,
        trim: true,
        default: '',
      },

      model: {
        type: String,
        trim: true,
        default: '',
      },

      year: {
        type: Number,
        default: null,
      },

      // Car colour is required for drivers.
      color: {
        type: String,
        trim: true,
        default: '',
      },

      // License plate is required for drivers.
      licensePlate: {
        type: String,
        trim: true,
        uppercase: true,
        default: '',
      },
    },

    // ==========================================
    // RATING & RIDE METRICS
    // ==========================================
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
    // DRIVER EARNINGS
    // ==========================================
    totalEarnings: {
      type: Number,
      default: 0,
    },

    unpaidCommission: {
      type: Number,
      default: 0,
    },

    // ==========================================
    // VERIFICATION
    // ==========================================
    isVerified: {
      type: Boolean,
      default: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ==========================================
    // COMMISSION RECEIPTS
    // ==========================================
    commissionReceipts: [
      {
        receiptUrl: {
          type: String,
          required: true,
        },

        amountPaid: {
          type: Number,
          required: true,
        },

        paymentReference: {
          type: String,
          default: '',
        },

        notes: {
          type: String,
          default: '',
        },

        status: {
          type: String,
          enum: [
            'pending_verification',
            'approved',
            'rejected',
          ],
          default: 'pending_verification',
        },

        submittedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ==========================================
// GEO-SPATIAL INDEX
// ==========================================
UserSchema.index({
  location: '2dsphere',
});

// ==========================================
// DRIVER VALIDATION
// ==========================================
//
// Customers do not need vehicle information.
//
// Drivers MUST have:
// - vehicle make
// - vehicle model
// - vehicle color
// - license plate
//
// Admin accounts are not created through public
// registration, so no vehicle validation is applied
// to admins.
//
UserSchema.pre('validate', function (next) {
  if (this.role === 'driver') {
    if (!this.vehicle) {
      this.invalidate(
        'vehicle',
        'Vehicle details are required for drivers.'
      );
    } else {
      if (!this.vehicle.make?.trim()) {
        this.invalidate(
          'vehicle.make',
          'Vehicle make is required for drivers.'
        );
      }

      if (!this.vehicle.model?.trim()) {
        this.invalidate(
          'vehicle.model',
          'Vehicle model is required for drivers.'
        );
      }

      if (!this.vehicle.color?.trim()) {
        this.invalidate(
          'vehicle.color',
          'Vehicle color is required for drivers.'
        );
      }

      if (!this.vehicle.licensePlate?.trim()) {
        this.invalidate(
          'vehicle.licensePlate',
          'License plate is required for drivers.'
        );
      }
    }
  }

  next();
});

module.exports = mongoose.model('User', UserSchema);
