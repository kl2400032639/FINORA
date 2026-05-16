const router = require('express').Router();
const ctrl   = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/profile',          ctrl.getProfile);
router.put('/profile',          upload.single('avatar'), ctrl.updateProfile);
router.put('/settings',         ctrl.updateSettings);
router.put('/password',         ctrl.changePassword);
router.put('/onboarding',       ctrl.completeOnboarding);

module.exports = router;
