const SavingsGoal = require('../models/SavingsGoal');

/** GET /api/goals — List all savings goals */
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (err) { next(err); }
};

/** POST /api/goals — Create a new savings goal */
exports.createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, deadline, icon, color } = req.body;
    const goal = await SavingsGoal.create({
      user: req.user._id, title, targetAmount, deadline, icon, color,
    });
    res.status(201).json({ success: true, message: 'Goal created!', data: goal });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(err.errors)[0].message });
    }
    next(err);
  }
};

/** PUT /api/goals/:id — Update goal (add savings, edit title, etc.) */
exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });

    const { title, targetAmount, savedAmount, deadline, icon, color } = req.body;
    if (title)        goal.title        = title;
    if (targetAmount) goal.targetAmount = targetAmount;
    if (savedAmount !== undefined) {
      goal.savedAmount   = parseFloat(savedAmount);
      goal.isCompleted   = goal.savedAmount >= goal.targetAmount;
    }
    if (deadline)     goal.deadline     = deadline;
    if (icon)         goal.icon         = icon;
    if (color)        goal.color        = color;

    await goal.save();
    res.json({ success: true, message: 'Goal updated!', data: goal });
  } catch (err) { next(err); }
};

/** DELETE /api/goals/:id — Delete a goal */
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.json({ success: true, message: 'Goal deleted.' });
  } catch (err) { next(err); }
};
