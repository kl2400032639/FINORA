const mongoose = require('mongoose');

/**
 * SavingsGoal Model
 * Tracks user-defined savings targets with progress.
 */
const savingsGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [80, 'Title cannot exceed 80 characters'],
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target must be greater than 0'],
  },
  savedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Saved amount cannot be negative'],
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  icon: {
    type: String,
    default: '🎯',
  },
  color: {
    type: String,
    default: '#4f8ef7',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// ── Virtual: percentage complete ──────────────────────────
savingsGoalSchema.virtual('percentage').get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.savedAmount / this.targetAmount) * 100));
});

savingsGoalSchema.set('toJSON', { virtuals: true });
savingsGoalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
