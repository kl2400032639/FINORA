const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a signed JWT token for a user ID.
 * @param {string} id - MongoDB user _id
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/signup
 * Register a new user account.
 */
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already registered
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    // Create the user (password hashed by model pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate token
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: `Welcome to Finora, ${user.name.split(' ')[0]}! 🎉`,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    // Handle mongoose validation errors nicely
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Log in with email and password, returns JWT.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please sign up.',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    // Update streak
    await updateStreak(user);

    const token = signToken(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name.split(' ')[0]}! 👋`,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Return the current logged-in user's profile.
 */
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
  });
};

/**
 * Helper: Update user's daily expense streak.
 * Streak increments if user logged in on consecutive days.
 */
async function updateStreak(user) {
  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = user.streak.lastActive ? new Date(user.streak.lastActive) : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      user.streak.current += 1;
      if (user.streak.current > user.streak.longest) {
        user.streak.longest = user.streak.current;
      }
    } else if (diffDays > 1) {
      // Streak broken
      user.streak.current = 1;
    }
    // diffDays === 0 = same day, no change
  } else {
    // First login ever
    user.streak.current = 1;
    user.streak.longest = 1;
  }

  user.streak.lastActive = new Date();
  await user.save({ validateBeforeSave: false });
}
