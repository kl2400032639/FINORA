const Expense = require('../models/Expense');

/**
 * GET /api/analytics/monthly
 * Monthly totals for the last 12 months (line/bar chart data).
 */
exports.getMonthlyTrend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now    = new Date();
    const start  = new Date(now.getFullYear(), now.getMonth() - 11, 1); // 12 months back

    const data = await Expense.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year: '$date' },
            month: { $month: '$date' },
          },
          total:    { $sum: '$amount' },
          count:    { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build a complete 12-month array (fill missing months with 0)
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const found = data.find(
        x => x._id.year === d.getFullYear() && x._id.month === d.getMonth() + 1
      );
      months.push({
        label:     d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
        month:     d.getMonth() + 1,
        year:      d.getFullYear(),
        total:     found?.total     || 0,
        count:     found?.count     || 0,
        avgAmount: found?.avgAmount || 0,
      });
    }

    res.json({ success: true, data: months });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/categories
 * Expense breakdown by category for a given month/year.
 */
exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y   = parseInt(year)  || now.getFullYear();
    const m   = parseInt(month) || now.getMonth() + 1;

    const start = new Date(y, m - 1, 1);
    const end   = new Date(y, m, 0, 23, 59, 59);

    const data = await Expense.aggregate([
      {
        $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lte: end } },
      },
      {
        $group: {
          _id:   '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = data.reduce((s, d) => s + d.total, 0);

    const result = data.map(d => ({
      category:   d._id,
      total:      d.total,
      count:      d.count,
      percentage: grandTotal > 0 ? parseFloat(((d.total / grandTotal) * 100).toFixed(1)) : 0,
    }));

    res.json({ success: true, data: result, grandTotal });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/daily
 * Daily spending for the current month (heatmap / calendar data).
 */
exports.getDailyBreakdown = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y   = parseInt(year)  || now.getFullYear();
    const m   = parseInt(month) || now.getMonth() + 1;

    const start = new Date(y, m - 1, 1);
    const end   = new Date(y, m, 0, 23, 59, 59);

    const data = await Expense.aggregate([
      {
        $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lte: end } },
      },
      {
        $group: {
          _id:   { $dayOfMonth: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Fill all days in month
    const daysInMonth = new Date(y, m, 0).getDate();
    const result = Array.from({ length: daysInMonth }, (_, i) => {
      const day   = i + 1;
      const found = data.find(d => d._id === day);
      return {
        day,
        date:  new Date(y, m - 1, day).toISOString().split('T')[0],
        total: found?.total || 0,
        count: found?.count || 0,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/insights
 * Rule-based AI spending insights for the user.
 */
exports.getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now    = new Date();

    // Last 3 months of data
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const [categoryData, monthlyData, topExpenses] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, type: 'expense', date: { $gte: threeMonthsAgo } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, type: 'expense', date: { $gte: threeMonthsAgo } } },
        { $group: {
          _id:   { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Expense.find({ user: userId, type: 'expense' })
        .sort({ amount: -1 })
        .limit(3)
        .select('title amount category date'),
    ]);

    const insights = [];
    const budget   = req.user.settings?.monthlyBudget || 10000;

    // Insight 1: Highest spending category
    if (categoryData.length > 0) {
      const top = categoryData[0];
      insights.push({
        type: 'warning',
        icon: '🔥',
        title: `Top Spending: ${top._id}`,
        message: `You've spent ₹${top.total.toLocaleString('en-IN')} on ${top._id} in the last 3 months — that's your biggest expense category.`,
      });
    }

    // Insight 2: Month-over-month comparison
    if (monthlyData.length >= 2) {
      const last   = monthlyData[monthlyData.length - 2]?.total || 0;
      const curr   = monthlyData[monthlyData.length - 1]?.total || 0;
      const change = last > 0 ? ((curr - last) / last * 100).toFixed(0) : 0;

      if (change > 20) {
        insights.push({
          type: 'alert',
          icon: '📈',
          title: 'Spending Spike Detected',
          message: `Your spending this month is ${change}% higher than last month. Time to review your expenses!`,
        });
      } else if (change < -10) {
        insights.push({
          type: 'success',
          icon: '🎉',
          title: 'Great Progress!',
          message: `You spent ${Math.abs(change)}% less than last month. Keep up the great work!`,
        });
      }
    }

    // Insight 3: Budget utilization
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = await Expense.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: currentMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const thisMonthTotal = thisMonth[0]?.total || 0;
    const utilization    = ((thisMonthTotal / budget) * 100).toFixed(0);

    if (utilization > 90) {
      insights.push({
        type: 'alert',
        icon: '⚠️',
        title: 'Budget Almost Exhausted',
        message: `You've used ${utilization}% of your monthly budget. Only ₹${(budget - thisMonthTotal).toLocaleString('en-IN')} remaining!`,
      });
    } else if (utilization < 50) {
      insights.push({
        type: 'success',
        icon: '✅',
        title: 'On Track This Month',
        message: `You've used only ${utilization}% of your budget. You're on track to save ₹${(budget - thisMonthTotal).toLocaleString('en-IN')} this month!`,
      });
    }

    // Insight 4: Recurring subscriptions reminder
    const recurring = await Expense.countDocuments({ user: userId, isRecurring: true });
    if (recurring > 0) {
      insights.push({
        type: 'info',
        icon: '🔄',
        title: `${recurring} Recurring Expense${recurring > 1 ? 's' : ''}`,
        message: `You have ${recurring} recurring expense${recurring > 1 ? 's' : ''} set up. Review them to find potential savings.`,
      });
    }

    // Insight 5: Savings tip based on top category
    if (categoryData.length > 0) {
      const tipMap = {
        Food:          'Consider meal prepping at home to cut food expenses by 30%.',
        Shopping:      'Try a 24-hour rule before buying non-essentials — it reduces impulse spending.',
        Entertainment: 'Bundle your streaming services or use free alternatives for entertainment.',
        Travel:        'Book travel in advance and use public transport to reduce travel costs.',
        Bills:         'Audit your subscriptions — cancel the ones you rarely use.',
      };
      const tip = tipMap[categoryData[0]._id];
      if (tip) {
        insights.push({
          type: 'tip',
          icon: '💡',
          title: 'Smart Saving Tip',
          message: tip,
        });
      }
    }

    res.json({
      success: true,
      data: { insights, topExpenses, categoryData, budget, thisMonthTotal },
    });
  } catch (err) {
    next(err);
  }
};
