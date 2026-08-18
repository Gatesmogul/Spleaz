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
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
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
    //
    // Public registration:
    // - customer
    // - driver
    //
    // Admin accounts are managed through the
    // backend/admin system.
    //

    role: {
      type: String,
      enum: {
        values: ['customer', 'driver', 'admin'],
        message: 'Role must be customer, driver, or admin',
      },
      default: 'customer',
    },

    // ==========================================
    // ADMIN ROLE & PERMISSIONS
    // ==========================================
    //
    // Admin hierarchy:
    //
    // founder_admin
    // senior_admin
    // junior_admin
    //
    // These fields are only meaningful when:
    // role === 'admin'
    //

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

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================

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

    // ==========================================
    // ADMIN ACCOUNT PASSWORD SETUP
    // ==========================================
    //
    // Founder/Senior/Junior admin accounts can be
    // required to create a password through the
    // secure password setup flow.
    //

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

    // ==========================================
    // ADMIN AUDIT INFORMATION
    // ==========================================
    //
    // Stores the admin/user identifier responsible
    // for creating this account.
    //

    createdByAdmin: {
      type: String,
      default: null,
      trim: true,
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

    // Existing password-reset fields
    // used by the normal user password recovery flow.

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
// USER EMAIL INDEX
// ==========================================
//
// The email field already has unique: true.
// This explicit index makes the intended database
// constraint clear and is safe because it matches
// the schema definition.
//

UserSchema.index(
  { email: 1 },
  { unique: true }
);

// ==========================================
// ADMIN INDEX
// ==========================================
//
// Helps backend admin queries find admins by
// admin status and hierarchy.
//

UserSchema.index({
  isAdmin: 1,
  adminRole: 1,
});

// ==========================================
// ACCOUNT STATUS INDEX
// ==========================================
//
// Helps administrative queries find suspended
// and inactive accounts efficiently.
//

UserSchema.index({
  isSuspended: 1,
  isActive: 1,
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
// Admin accounts are not subject to driver
// vehicle validation.
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

// ==========================================
// ADMIN DATA VALIDATION
// ==========================================
//
// Keeps admin-related fields consistent.
//
// If a user is not an admin:
// - isAdmin must be false
// - adminRole must be null
// - adminPermissions must be empty
//
// If a user is an admin:
// - role must be admin
// - isAdmin must be true
// - adminRole must be specified
//

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

// ==========================================
// PASSWORD CHANGE TRACKING
// ==========================================
//
// When an existing user's password is changed,
// record the time of the password change.
//
// This does not interfere with the password hash
// generated by authController/adminController.
//

UserSchema.pre('save', function (next) {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = new Date();
    this.mustSetPassword = false;

    // Invalidate any outstanding admin password
    // setup token after the password is changed.
    this.passwordResetTokenHash = null;
    this.passwordResetExpiresAt = null;
  }

  next();
});

// ==========================================
// MODEL EXPORT
// ==========================================

module.exports = mongoose.model('User', UserSchema);
