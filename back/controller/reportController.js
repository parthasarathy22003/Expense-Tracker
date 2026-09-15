const { fn, col, literal } = require('sequelize');
const { Expense, Income } = require('../model');
const asyncHandler = require('../utils/asyncHandler.js');
const { buildExpenseFilters, buildIncomeFilters } = require('../utils/filter.js');

const PERIOD_FORMATS = {
  day: '%Y-%m-%d',
  month: '%Y-%m',
  year: '%Y',
};

/**
 * Raw SQL expression for MySQL period formatting.
 * `date` is the column name in both tables.
 */
const periodExpr = (format) => literal(`DATE_FORMAT(\`date\`, '${format}')`);

const num = (v, decimals = 2) => Number(Number(v || 0).toFixed(decimals));

const resolveGroupBy = (value) =>
  Object.prototype.hasOwnProperty.call(PERIOD_FORMATS, value) ? value : 'month';

const defaultDateRange = (query, days = 30) => {
  if (query.startDate || query.endDate) return query;
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return {
    ...query,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

/* ------------------------------------------------------------------ *
 * 1. SUMMARY BY MONTH
 * GET /api/reports/summary/monthly
 * ------------------------------------------------------------------ */
exports.monthlySummary = asyncHandler(async (req, res) => {
  const where = buildExpenseFilters(req.query);
  const expr = periodExpr(PERIOD_FORMATS.month);

  const rows = await Expense.findAll({
    attributes: [
      [expr, 'period'],
      [fn('SUM', col('amount')), 'totalAmount'],
      [fn('COUNT', col('id')), 'transactionCount'],
      [fn('AVG', col('amount')), 'averageAmount'],
      [fn('MAX', col('amount')), 'highestAmount'],
      [fn('MIN', col('amount')), 'lowestAmount'],
    ],
    where,
    group: [expr],
    order: [[expr, 'ASC']],
    raw: true,
  });

  const data = rows.map((r) => ({
    period: r.period,
    totalAmount: num(r.totalAmount),
    transactionCount: Number(r.transactionCount),
    averageAmount: num(r.averageAmount),
    highestAmount: num(r.highestAmount),
    lowestAmount: num(r.lowestAmount),
  }));

  const grandTotal = num(data.reduce((sum, r) => sum + r.totalAmount, 0));

  return res.json({
    success: true,
    report: 'monthly-summary',
    totalSpending: grandTotal,
    data,
  });
});

/* ------------------------------------------------------------------ *
 * 2. SUMMARY BY CATEGORY
 * GET /api/reports/summary/category
 * ------------------------------------------------------------------ */
exports.categorySummary = asyncHandler(async (req, res) => {
  const where = buildExpenseFilters(req.query);

  const rows = await Expense.findAll({
    attributes: [
      'category',
      [fn('SUM', col('amount')), 'totalAmount'],
      [fn('COUNT', col('id')), 'transactionCount'],
      [fn('AVG', col('amount')), 'averageAmount'],
    ],
    where,
    group: ['category'],
    order: [[literal('totalAmount'), 'DESC']],
    raw: true,
  });

  const grandTotal = rows.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

  const data = rows.map((r) => ({
    category: r.category,
    totalAmount: num(r.totalAmount),
    transactionCount: Number(r.transactionCount),
    averageAmount: num(r.averageAmount),
    percentage: grandTotal > 0 ? num((Number(r.totalAmount) / grandTotal) * 100) : 0,
  }));

  return res.json({
    success: true,
    report: 'category-summary',
    totalSpending: num(grandTotal),
    data,
  });
});

/* ------------------------------------------------------------------ *
 * 3. SUMMARY BY PAYMENT MODE
 * GET /api/reports/summary/payment-mode
 * ------------------------------------------------------------------ */
exports.paymentModeSummary = asyncHandler(async (req, res) => {
  const where = buildExpenseFilters(req.query);

  const rows = await Expense.findAll({
    attributes: [
      'paymentMode',
      [fn('SUM', col('amount')), 'totalAmount'],
      [fn('COUNT', col('id')), 'transactionCount'],
      [fn('AVG', col('amount')), 'averageAmount'],
    ],
    where,
    group: ['paymentMode'],
    order: [[literal('totalAmount'), 'DESC']],
    raw: true,
  });

  const grandTotal = rows.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

  const data = rows.map((r) => ({
    paymentMode: r.paymentMode,
    totalAmount: num(r.totalAmount),
    transactionCount: Number(r.transactionCount),
    averageAmount: num(r.averageAmount),
    percentage: grandTotal > 0 ? num((Number(r.totalAmount) / grandTotal) * 100) : 0,
  }));

  return res.json({
    success: true,
    report: 'payment-mode-summary',
    totalSpending: num(grandTotal),
    data,
  });
});

/* ------------------------------------------------------------------ *
 * 4. TOP CATEGORIES BY SPENDING
 * GET /api/reports/top-categories?limit=5
 * ------------------------------------------------------------------ */
exports.topCategories = asyncHandler(async (req, res) => {
  const where = buildExpenseFilters(req.query);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 50);

  const rows = await Expense.findAll({
    attributes: [
      'category',
      [fn('SUM', col('amount')), 'totalAmount'],
      [fn('COUNT', col('id')), 'transactionCount'],
      [fn('AVG', col('amount')), 'averageAmount'],
    ],
    where,
    group: ['category'],
    order: [[literal('totalAmount'), 'DESC']],
    limit,
    raw: true,
  });

  const data = rows.map((r, index) => ({
    rank: index + 1,
    category: r.category,
    totalAmount: num(r.totalAmount),
    transactionCount: Number(r.transactionCount),
    averageAmount: num(r.averageAmount),
  }));

  return res.json({
    success: true,
    report: 'top-categories',
    limit,
    data,
  });
});

/* ------------------------------------------------------------------ *
 * 5. DAILY SPENDING TREND
 * GET /api/reports/trends/daily?days=30
 * ------------------------------------------------------------------ */
exports.dailyTrend = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
  const query = defaultDateRange(req.query, days);
  const where = buildExpenseFilters(query);
  const expr = periodExpr(PERIOD_FORMATS.day);

  const rows = await Expense.findAll({
    attributes: [
      [expr, 'period'],
      [fn('SUM', col('amount')), 'totalAmount'],
      [fn('COUNT', col('id')), 'transactionCount'],
    ],
    where,
    group: [expr],
    order: [[expr, 'ASC']],
    raw: true,
  });

  return res.json({
    success: true,
    report: 'daily-spending-trend',
    range: { startDate: query.startDate, endDate: query.endDate },
    data: rows.map((r) => ({
      period: r.period,
      totalAmount: num(r.totalAmount),
      transactionCount: Number(r.transactionCount),
    })),
  });
});

/* ------------------------------------------------------------------ *
 * 6. MONTHLY SPENDING TREND (with running total)
 * GET /api/reports/trends/monthly
 * ------------------------------------------------------------------ */
exports.monthlyTrend = asyncHandler(async (req, res) => {
  const where = buildExpenseFilters(req.query);
  const expr = periodExpr(PERIOD_FORMATS.month);

  const rows = await Expense.findAll({
    attributes: [
      [expr, 'period'],
      [fn('SUM', col('amount')), 'totalAmount'],
      [fn('COUNT', col('id')), 'transactionCount'],
    ],
    where,
    group: [expr],
    order: [[expr, 'ASC']],
    raw: true,
  });

  let cumulative = 0;
  const data = rows.map((r) => {
    const total = num(r.totalAmount);
    cumulative = num(cumulative + total);
    return {
      period: r.period,
      totalAmount: total,
      transactionCount: Number(r.transactionCount),
      cumulativeAmount: cumulative,
    };
  });

  return res.json({
    success: true,
    report: 'monthly-spending-trend',
    data,
  });
});

/* ------------------------------------------------------------------ *
 * 7. COMBINED INCOME VS EXPENSE SUMMARY
 * GET /api/reports/income-vs-expense?groupBy=month|day|year
 * ------------------------------------------------------------------ */
exports.incomeVsExpense = asyncHandler(async (req, res) => {
  const groupBy = resolveGroupBy(req.query.groupBy);
  const format = PERIOD_FORMATS[groupBy];
  const expr = periodExpr(format);

  const expenseWhere = buildExpenseFilters(req.query);
  const incomeWhere = buildIncomeFilters(req.query);

  const [expenseRows, incomeRows] = await Promise.all([
    Expense.findAll({
      attributes: [
        [expr, 'period'],
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: expenseWhere,
      group: [expr],
      raw: true,
    }),
    Income.findAll({
      attributes: [
        [expr, 'period'],
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: incomeWhere,
      group: [expr],
      raw: true,
    }),
  ]);

  const bucket = new Map();

  const touch = (period) => {
    if (!bucket.has(period)) {
      bucket.set(period, {
        period,
        totalIncome: 0,
        totalExpense: 0,
        incomeCount: 0,
        expenseCount: 0,
      });
    }
    return bucket.get(period);
  };

  incomeRows.forEach((r) => {
    const entry = touch(r.period);
    entry.totalIncome = num(r.total);
    entry.incomeCount = Number(r.count);
  });

  expenseRows.forEach((r) => {
    const entry = touch(r.period);
    entry.totalExpense = num(r.total);
    entry.expenseCount = Number(r.count);
  });

  const data = [...bucket.values()]
    .sort((a, b) => String(a.period).localeCompare(String(b.period)))
    .map((r) => {
      const netSavings = num(r.totalIncome - r.totalExpense);
      return {
        ...r,
        netSavings,
        savingsRate:
          r.totalIncome > 0 ? num((netSavings / r.totalIncome) * 100) : 0,
      };
    });

  const totals = data.reduce(
    (acc, r) => {
      acc.totalIncome = num(acc.totalIncome + r.totalIncome);
      acc.totalExpense = num(acc.totalExpense + r.totalExpense);
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );

  const netSavings = num(totals.totalIncome - totals.totalExpense);

  return res.json({
    success: true,
    report: 'income-vs-expense',
    groupBy,
    summary: {
      totalIncome: totals.totalIncome,
      totalExpense: totals.totalExpense,
      netSavings,
      savingsRate: totals.totalIncome > 0 ? num((netSavings / totals.totalIncome) * 100) : 0,
      status: netSavings >= 0 ? 'SURPLUS' : 'DEFICIT',
    },
    data,
  });
});