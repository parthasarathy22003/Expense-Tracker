const express = require('express');

const router = express.Router();

router.use('/expenses', require('./expenseRoutes'));
router.use('/incomes', require('./incomeRoutes'));
router.use('/reports', require('./reportRoutes'));

module.exports = router;