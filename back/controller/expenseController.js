const { Expense } = require('../model');
const asyncHandler = require('../utils/asyncHandler.js');
const { getPagination, getSorting, buildMeta } = require('../utils/query.js');
const { buildExpenseFilters } = require('../utils/filter.js');
const { validateExpense } = require('../validators/expenseValidator.js');

const SORTABLE_FIELDS = ['id', 'date', 'amount', 'category', 'paymentMode', 'createdAt', 'updatedAt'];

/**
 * POST /api/expenses
 */
exports.createExpense = asyncHandler(async (req, res) => {
  const errors = validateExpense(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const expense = await Expense.create({
    userId: req.body.userId.trim(),
    category: req.body.category.trim(),
    amount: Number(req.body.amount),
    date: req.body.date,
    paymentMode: String(req.body.paymentMode).toUpperCase(),
    description: req.body.description ? String(req.body.description).trim() : null,
  });

  return res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: expense,
  });
});

/**
 * GET /api/expenses
 * Filtering: userId, category (csv), paymentMode (csv), startDate, endDate,
 *            minAmount, maxAmount, search
 * Sorting:   sortBy, order
 * Pagination: page, limit
 */
exports.listExpenses = asyncHandler(async (req, res) => {
  const where = buildExpenseFilters(req.query);
  const { page, limit, offset } = getPagination(req.query);
  const order = getSorting(req.query, SORTABLE_FIELDS, 'date', 'DESC');

  const { rows, count } = await Expense.findAndCountAll({
    where,
    order,
    limit,
    offset,
    distinct: true,
  });

  return res.json({
    success: true,
    data: rows,
    meta: buildMeta(count, page, limit),
    appliedFilters: {
      ...req.query,
      page,
      limit,
      sortBy: order[0][0],
      order: order[0][1],
    },
  });
});

/**
 * GET /api/expenses/:id
 */
exports.getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByPk(req.params.id);

  if (!expense) {
    return res.status(404).json({ success: false, message: 'Expense not found' });
  }

  return res.json({ success: true, data: expense });
});

/**
 * PUT /api/expenses/:id  (full replace)
 * PATCH /api/expenses/:id (partial update)
 */
exports.updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByPk(req.params.id);

  if (!expense) {
    return res.status(404).json({ success: false, message: 'Expense not found' });
  }

  const partial = req.method === 'PATCH';
  const errors = validateExpense(req.body, { partial });
  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const payload = {};
  if (req.body.userId !== undefined) payload.userId = String(req.body.userId).trim();
  if (req.body.category !== undefined) payload.category = String(req.body.category).trim();
  if (req.body.amount !== undefined) payload.amount = Number(req.body.amount);
  if (req.body.date !== undefined) payload.date = req.body.date;
  if (req.body.paymentMode !== undefined) payload.paymentMode = String(req.body.paymentMode).toUpperCase();
  if (req.body.description !== undefined) {
    payload.description = req.body.description ? String(req.body.description).trim() : null;
  }

  await expense.update(payload);

  return res.json({
    success: true,
    message: 'Expense updated successfully',
    data: expense,
  });
});

/**
 * DELETE /api/expenses/:id
 */
exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByPk(req.params.id);

  if (!expense) {
    return res.status(404).json({ success: false, message: 'Expense not found' });
  }

  await expense.destroy();

  return res.json({ success: true, message: 'Expense deleted successfully' });
});