const Expense = require('../models/Expense');
const path    = require('path');
const fs      = require('fs');

/**
 * GET /api/expenses
 * Get all expenses for the logged-in user.
 * Supports: search, category filter, date range, sort, pagination.
 */
exports.getExpenses = async (req, res, next) => {
  try {
    const {
      search, category, type, startDate, endDate,
      sortBy = 'date', order = 'desc',
      page = 1, limit = 20,
    } = req.query;

    // Build dynamic filter object
    const filter = { user: req.user._id };

    if (category && category !== 'All') filter.category = category;
    if (type)                            filter.type     = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { tags:  { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate + 'T23:59:59');
    }

    // Sort direction
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = ['date', 'amount', 'title', 'category'].includes(sortBy) ? sortBy : 'date';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Expense.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/expenses
 * Create a new expense.
 */
exports.createExpense = async (req, res, next) => {
  try {
    const {
      title, amount, category, date, notes,
      tags, isRecurring, recurringFrequency, type, paymentMethod,
    } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date) : new Date(),
      notes,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      isRecurring: Boolean(isRecurring),
      recurringFrequency: isRecurring ? recurringFrequency : null,
      type: type || 'expense',
      paymentMethod: paymentMethod || 'upi',
      receipt: req.file ? `/uploads/receipts/${req.file.filename}` : null,
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully!',
      data: expense,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    next(err);
  }
};

/**
 * PUT /api/expenses/:id
 * Update an existing expense.
 */
exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    const {
      title, amount, category, date, notes,
      tags, isRecurring, recurringFrequency, type, paymentMethod,
    } = req.body;

    // Only update fields that were provided
    if (title)             expense.title             = title;
    if (amount)            expense.amount            = parseFloat(amount);
    if (category)          expense.category          = category;
    if (date)              expense.date              = new Date(date);
    if (notes !== undefined) expense.notes           = notes;
    if (tags)              expense.tags              = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (isRecurring !== undefined) expense.isRecurring = Boolean(isRecurring);
    if (recurringFrequency) expense.recurringFrequency = recurringFrequency;
    if (type)              expense.type              = type;
    if (paymentMethod)     expense.paymentMethod     = paymentMethod;
    if (req.file)          expense.receipt           = `/uploads/receipts/${req.file.filename}`;

    await expense.save();

    res.json({
      success: true,
      message: 'Expense updated successfully!',
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/expenses/:id
 * Delete an expense and its receipt file if any.
 */
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    // Delete receipt file from disk if it exists
    if (expense.receipt) {
      const filePath = path.join(__dirname, '../../', expense.receipt);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await expense.deleteOne();

    res.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/expenses/stats
 * Quick stats for dashboard cards.
 */
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now    = new Date();

    // Current month range
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Last month range
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentMonthStats, lastMonthStats, allTime] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: monthStart, $lte: monthEnd }, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd }, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const currentTotal  = currentMonthStats[0]?.total || 0;
    const lastTotal     = lastMonthStats[0]?.total    || 0;
    const allTimeTotal  = allTime[0]?.total           || 0;
    const budget        = req.user.settings?.monthlyBudget || 10000;
    const changePercent = lastTotal > 0
      ? (((currentTotal - lastTotal) / lastTotal) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        currentMonthTotal:  currentTotal,
        currentMonthCount:  currentMonthStats[0]?.count || 0,
        lastMonthTotal:     lastTotal,
        changePercent:      parseFloat(changePercent),
        budget,
        remaining:          Math.max(0, budget - currentTotal),
        savings:            Math.max(0, budget - currentTotal),
        allTimeTotal,
        allTimeCount:       allTime[0]?.count || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
