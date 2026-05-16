const router = require('express').Router();
const ctrl   = require('../controllers/goalsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',     ctrl.getGoals);
router.post('/',    ctrl.createGoal);
router.put('/:id',  ctrl.updateGoal);
router.delete('/:id', ctrl.deleteGoal);

module.exports = router;
