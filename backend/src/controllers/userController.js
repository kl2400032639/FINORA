const User = require('../models/User');

/** GET /api/user/profile */
exports.getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

/** PUT /api/user/profile — Update name, avatar */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (name) req.user.name = name;
    if (req.file) req.user.avatar = `/uploads/receipts/${req.file.filename}`;
    await req.user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Profile updated!', data: req.user.toSafeObject() });
  } catch (err) { next(err); }
};

/** PUT /api/user/settings — Update budget, theme, currency */
exports.updateSettings = async (req, res, next) => {
  try {
    const { monthlyBudget, currency, theme, notifications } = req.body;
    if (monthlyBudget  !== undefined) req.user.settings.monthlyBudget = parseFloat(monthlyBudget);
    if (currency)                     req.user.settings.currency      = currency;
    if (theme)                        req.user.settings.theme         = theme;
    if (notifications !== undefined)  req.user.settings.notifications = Boolean(notifications);
    await req.user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Settings saved!', data: req.user.settings });
  } catch (err) { next(err); }
};

/** PUT /api/user/password — Change password */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) { next(err); }
};

/** PUT /api/user/onboarding */
exports.completeOnboarding = async (req, res, next) => {
  try {
    req.user.onboardingCompleted = true;
    await req.user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Onboarding complete!' });
  } catch (err) { next(err); }
};
