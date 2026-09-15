const express = require('express');
const ctrl = require('../controller/incomeController.js');

const router = express.Router();

router.route('/').post(ctrl.createIncome).get(ctrl.listIncomes);

router
  .route('/:id')
  .get(ctrl.getIncome)
  .put(ctrl.updateIncome)
  .patch(ctrl.updateIncome)
  .delete(ctrl.deleteIncome);

module.exports = router;