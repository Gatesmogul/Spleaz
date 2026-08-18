'use strict';

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    // ============================================================
    // CORE USER IDENTIFIERS
    // ============================================================

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
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },

    /*
     * Phone is required for normal customer/driver accounts.
     *
     * Founder/Senior/Junior Admin accounts are created by the
     * backend and may not have a phone number during bootstrap.
     */
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },

    /*
     * Normal users require a password.
     *
     * Admin accounts initially use the secure password-setup flow,
     * so the password may temporarily be absent until the admin
     * completes setup.
     */
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
      default: null,
    },

    // ============================================================
    // USER ROLE
    // ============================================================

    role: {
      type: String,
      enum: {
        values: ['customer', 'driver', 'admin'],
        message: 'Role must be customer, driver, or admin',
      },
      default: 'customer',
    },

    // ============================================================
    // ADMIN ROLE & PERMISSIONS
    // ============================================================

    adminRole: {
      type: String,
      enum: [
        'founder_admin',
        'senior_admin',
        'junior_admin',
        null,
      ],
      default: null,
    },

    adminPermissions: {
      type: [String],
      default: [],
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    // ============================================================
    // ACCOUNT STATUS
    // ============================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    suspensionReason: {
      type: String,
      default: null,
      trim: true,
    },

    suspendedAt: {
      type: Date,
      default: null,
    },

    suspendedBy: {
      type: String,
      default: null,
      trim: true,
    },

    // ============================================================
    // ADMIN PASSWORD SETUP
    // ============================================================

    mustSetPassword: {
      type: Boolean,
      default: false,
    },

    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // ADMIN AUDIT INFORMATION
    // ============================================================

    createdByAdmin: {
      type: String,
      default: null,
      trim: true,
    },

    // ============================================================
    // PROFILE
    // ============================================================

    profilePictureUrl: {
      type: String,
      default: '',
    },

    // ============================================================
    // ADDRESS DETAILS
    // ============================================================

    /*
     * Address information is required for normal customer/driver
     * accounts but not for backend-created admin accounts.
     */
    addressInfo: {
      country: {
        type: String,
        trim: true,
        default: 'Nigeria',
      },

      state: {
        type: String,
        trim: true,
        default: '',
      },

      city: {
        type: String,
        trim: true,
        default: '',
      },

      streetAddress: {
        type: String,
        trim: true,
        default: '',
      },
    },

    // ============================================================
    // GEO LOCATION
    // ============================================================

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

    // ============================================================
    // DRIVER STATUS
    // ============================================================

    isOnline: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== 'driver';
      },
    },

    // ============================================================
    // DRIVER VEHICLE DETAILS
    // ============================================================

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

      color: {
        type: String,
        trim: true,
        default: '',
      },

      licensePlate: {
        type: String,
        trim: true,
        uppercase: true,
        default: '',
      },
    },

    // ============================================================
    // RATING & RIDE METRICS
    // ============================================================

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

    // ============================================================
    // DRIVER EARNINGS
    // ============================================================

    totalEarnings: {
      type: Number,
      default: 0,
    },

    unpaidCommission: {
      type: Number,
      default: 0,
    },

    // ============================================================
    // VERIFICATION
    // ============================================================

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ============================================================
    // NORMAL USER PASSWORD RESET
    // ============================================================

    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },

    // ============================================================
    // COMMISSION RECEIPTS
    // ============================================================

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

// ============================================================
// GEO-SPATIAL INDEX
// ============================================================

UserSchema.index({
  location: '2dsphere',
});

// ============================================================
// ADMIN INDEX
// ============================================================

UserSchema.index({
  isAdmin: 1,
  adminRole: 1,
});

// ============================================================
// ACCOUNT STATUS INDEX
// ============================================================

UserSchema.index({
  isSuspended: 1,
  isActive: 1,
});

// ============================================================
// DRIVER VALIDATION
// ============================================================

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

// ============================================================
// ADMIN DATA VALIDATION
// ============================================================

UserSchema.pre('validate', function (next) {
  if (this.role !== 'admin') {
    this.isAdmin = false;
    this.adminRole = null;
    this.adminPermissions = [];
  }

  if (this.role === 'admin') {
    this.isAdmin = true;

    if (!this.adminRole) {
      this.invalidate(
        'adminRole',
        'Admin role is required for admin accounts.'
      );
    }
  }

  next();
});

// ============================================================
// PASSWORD CHANGE TRACKING
// ============================================================

UserSchema.pre('save', function (next) {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = new Date();

    this.mustSetPassword = false;

    this.passwordResetTokenHash = null;
    this.passwordResetExpiresAt = null;
  }

  next();
});

// ============================================================
// MODEL EXPORT
// ============================================================

module.exports = mongoose.model('User', UserSchema);
