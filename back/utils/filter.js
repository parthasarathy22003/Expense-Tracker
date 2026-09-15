const { Op } = require('sequelize');

const splitCsv = (value) =>
  String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const applyRange = (where, field, query, startKey, endKey, cast) => {
  if (!query[startKey] && !query[endKey]) return;
  where[field] = {};
  if (query[startKey]) where[field][Op.gte] = cast ? cast(query[startKey]) : query[startKey];
  if (query[endKey]) where[field][Op.lte] = cast ? cast(query[endKey]) : query[endKey];
};

const buildDateAndAmountFilters = (where, query) => {
  applyRange(where, 'date', query, 'startDate', 'endDate');
  applyRange(where, 'amount', query, 'minAmount', 'maxAmount', Number);

  if (query.search) {
    where.description = { [Op.like]: `%${query.search}%` };
  }
};

/**
 * Reusable WHERE builder for the Expense table
 */
const buildExpenseFilters = (query = {}) => {
  const where = {};

  if (query.userId) where.userId = query.userId;

  if (query.category) {
    const categories = splitCsv(query.category);
    where.category = categories.length > 1 ? { [Op.in]: categories } : categories[0];
  }

  if (query.paymentMode) {
    const modes = splitCsv(query.paymentMode).map((m) => m.toUpperCase());
    where.paymentMode = modes.length > 1 ? { [Op.in]: modes } : modes[0];
  }

  buildDateAndAmountFilters(where, query);
  return where;
};

/**
 * Reusable WHERE builder for the Income table
 */
const buildIncomeFilters = (query = {}) => {
  const where = {};

  if (query.userId) where.userId = query.userId;

  if (query.source) {
    const sources = splitCsv(query.source);
    where.source = sources.length > 1 ? { [Op.in]: sources } : sources[0];
  }

  buildDateAndAmountFilters(where, query);
  return where;
};

module.exports = { buildExpenseFilters, buildIncomeFilters, splitCsv };