const express = require('express');
const ctrl = require('../controller/expenseController.js');

const router = express.Router();

router.route('/').post(ctrl.createExpense).get(ctrl.listExpenses);

router
  .route('/:id')
  .get(ctrl.getExpense)
  .put(ctrl.updateExpense)
  .patch(ctrl.updateExpense)
  .delete(ctrl.deleteExpense);

module.exports = router;