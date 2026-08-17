const mongoose = require('mongoose');

const CommissionSchema = new mongoose.Schema(
  {
    // ==========================================
    // DRIVER IDENTIFIER
    // ==========================================
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver ID is required'],
      index: true,
    },

    // ==========================================
    // PAYMENT METRICS
    // ==========================================
    amountPaid: {
      type: Number,
      required: [true, 'Amount paid is required'],
      min: [1, 'Payment amount must be greater than zero'],
    },
    paymentReference: {
      type: String,
      default: '',
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'card', 'cash_deposit', 'pos', 'other'],
      default: 'bank_transfer',
    },

    // ==========================================
    // RECEIPT ATTACHMENT
    // ==========================================
    receiptUrl: {
      type: String,
      required: [true, 'Receipt image or document URL is required'],
      trim: true,
    },

    // ==========================================
    // VERIFICATION WORKFLOW & AUDITING
    // ==========================================
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status `{VALUE}` is not a valid commission status',
      },
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Admin user who approved or rejected the receipt
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically tracks createdAt and updatedAt
  }
);

// Compound index for fast querying by driver and payment status
CommissionSchema.index({ driver: 1, status: 1 });

module.exports = mongoose.model('Commission', CommissionSchema);