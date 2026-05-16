const router  = require('express').Router();
const ctrl    = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/monthly',    ctrl.getMonthlyTrend);
router.get('/categories', ctrl.getCategoryBreakdown);
router.get('/daily',      ctrl.getDailyBreakdown);
router.get('/insights',   ctrl.getInsights);

module.exports = router;
