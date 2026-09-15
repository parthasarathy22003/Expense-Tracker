const { Income } = require('../model');
const asyncHandler = require('../utils/asyncHandler.js');
const { getPagination, getSorting, buildMeta } = require('../utils/query.js');
const { buildIncomeFilters } = require('../utils/filter.js');
const { validateIncome } = require('../validators/incomeValidator.js');

const SORTABLE_FIELDS = ['id', 'date', 'amount', 'source', 'createdAt', 'updatedAt'];

exports.createIncome = asyncHandler(async (req, res) => {
  const errors = validateIncome(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const income = await Income.create({
    userId: req.body.userId.trim(),
    source: req.body.source.trim(),
    amount: Number(req.body.amount),
    date: req.body.date,
    description: req.body.description ? String(req.body.description).trim() : null,
  });

  return res.status(201).json({
    success: true,
    message: 'Income created successfully',
    data: income,
  });
});

exports.listIncomes = asyncHandler(async (req, res) => {
  const where = buildIncomeFilters(req.query);
  const { page, limit, offset } = getPagination(req.query);
  const order = getSorting(req.query, SORTABLE_FIELDS, 'date', 'DESC');

  const { rows, count } = await Income.findAndCountAll({
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
  });
});

exports.getIncome = asyncHandler(async (req, res) => {
  const income = await Income.findByPk(req.params.id);

  if (!income) {
    return res.status(404).json({ success: false, message: 'Income not found' });
  }

  return res.json({ success: true, data: income });
});

exports.updateIncome = asyncHandler(async (req, res) => {
  const income = await Income.findByPk(req.params.id);

  if (!income) {
    return res.status(404).json({ success: false, message: 'Income not found' });
  }

  const partial = req.method === 'PATCH';
  const errors = validateIncome(req.body, { partial });
  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const payload = {};
  if (req.body.userId !== undefined) payload.userId = String(req.body.userId).trim();
  if (req.body.source !== undefined) payload.source = String(req.body.source).trim();
  if (req.body.amount !== undefined) payload.amount = Number(req.body.amount);
  if (req.body.date !== undefined) payload.date = req.body.date;
  if (req.body.description !== undefined) {
    payload.description = req.body.description ? String(req.body.description).trim() : null;
  }

  await income.update(payload);

  return res.json({
    success: true,
    message: 'Income updated successfully',
    data: income,
  });
});

exports.deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findByPk(req.params.id);

  if (!income) {
    return res.status(404).json({ success: false, message: 'Income not found' });
  }

  await income.destroy();

  return res.json({ success: true, message: 'Income deleted successfully' });
});