const router  = require('express').Router();
const ctrl    = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const upload  = require('../middleware/upload');

// All routes require authentication
router.use(protect);

router.get('/stats',      ctrl.getStats);
router.get('/',           ctrl.getExpenses);
router.post('/',          upload.single('receipt'), ctrl.createExpense);
router.put('/:id',        upload.single('receipt'), ctrl.updateExpense);
router.delete('/:id',     ctrl.deleteExpense);

module.exports = router;
