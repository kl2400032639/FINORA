const mongoose = require('mongoose');

/**
 * Expense Model
 * Stores every expense transaction for a user.
 */
const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // index for fast per-user queries
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Others'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  // Receipt image URL (uploaded via multer)
  receipt: {
    type: String,
    default: null,
  },
  // Recurring expense configuration
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly', null],
    default: null,
  },
  // Type: expense (spending) or income
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense',
  },
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'netbanking', 'other'],
    default: 'upi',
  },
}, {
  timestamps: true,
});

// ── Compound index for efficient per-user + date queries ──
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
