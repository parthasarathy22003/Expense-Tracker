const express = require('express');
const ctrl = require('../controller/reportController.js');

const router = express.Router();

/* Summary reports */
router.get('/summary/monthly', ctrl.monthlySummary);
router.get('/summary/category', ctrl.categorySummary);
router.get('/summary/payment-mode', ctrl.paymentModeSummary);

/* Top categories */
router.get('/top-categories', ctrl.topCategories);

/* Spending trends */
router.get('/trends/daily', ctrl.dailyTrend);
router.get('/trends/monthly', ctrl.monthlyTrend);

/* Combined income vs expense */
router.get('/income-vs-expense', ctrl.incomeVsExpense);

module.exports = router;