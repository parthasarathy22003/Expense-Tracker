import { useCallback, useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

import {
  BarChart3,
  CalendarDays,
  Filter,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from 'lucide-react';

import Loader from '../Comp/Loader.jsx';
import EmptyState from '../Comp/EmptyState.jsx';
import { reportService } from '../services/reportService.js';
import { useUser } from '../context/UserContext.jsx';
import { formatCurrency, monthLabel } from '../utils/format.js';
import { notifyError } from '../Comp/Toast.jsx';

const PIE_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f43f5e',
  '#84cc16',
];

const selectClass = `
  w-full rounded-xl
  border border-slate-200
  bg-white
  px-3.5 py-2.5
  text-sm font-medium text-slate-700
  outline-none
  transition
  hover:border-slate-300
  focus:border-indigo-500
  focus:ring-4
  focus:ring-indigo-500/10
`;

const dateClass = `
  w-full rounded-xl
  border border-slate-200
  bg-white
  px-3.5 py-2.5
  text-sm font-medium text-slate-700
  outline-none
  transition
  hover:border-slate-300
  focus:border-indigo-500
  focus:ring-4
  focus:ring-indigo-500/10
`;

const cardClass =
  'rounded-2xl border border-slate-200 bg-white shadow-sm';

export default function Reports() {
  const { userId } = useUser();

  const [loading, setLoading] = useState(true);

  const [groupBy, setGroupBy] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [ive, setIve] = useState(null);
  const [categorySummary, setCategorySummary] = useState([]);
  const [paymentModeSummary, setPaymentModeSummary] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    try {
      const baseParams = { userId };

      if (startDate) baseParams.startDate = startDate;
      if (endDate) baseParams.endDate = endDate;

      const [
        iveRes,
        catRes,
        payRes,
        topRes,
        dailyRes,
      ] = await Promise.all([
        reportService.incomeVsExpense({
          ...baseParams,
          groupBy,
        }),
        reportService.categorySummary(baseParams),
        reportService.paymentModeSummary(baseParams),
        reportService.topCategories({
          ...baseParams,
          limit: 5,
        }),
        reportService.dailyTrend({
          ...baseParams,
          days: 30,
        }),
      ]);

      setIve(iveRes);
      setCategorySummary(catRes?.data || []);
      setPaymentModeSummary(payRes?.data || []);
      setTopCategories(topRes?.data || []);
      setDailyTrend(dailyRes?.data || []);
    } catch (err) {
      notifyError(
        err.message || 'Failed to load reports'
      );
    } finally {
      setLoading(false);
    }
  }, [userId, groupBy, startDate, endDate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex min-h-125 items-center justify-center">
        <Loader label="Preparing your reports..." />
      </div>
    );
  }

  const summary = ive?.summary || {};

  const iveData = (ive?.data || []).map((d) => ({
    period:
      groupBy === 'month'
        ? monthLabel(d.period)
        : d.period,
    Income: d.totalIncome,
    Expense: d.totalExpense,
    Net: d.netSavings,
  }));

  const catChartData = categorySummary.slice(0, 8);

  const payChartData = paymentModeSummary;

  const dailyData = dailyTrend.map((d) => ({
    period: d.period?.slice(5),
    Spending: d.totalAmount,
  }));

  const resetFilters = () => {
    setGroupBy('month');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-full bg-slate-50/40 p-1">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">
          <div className="
            flex h-12 w-12 shrink-0
            items-center justify-center
            rounded-2xl
            bg-indigo-50
            text-indigo-600
            ring-1 ring-indigo-100
          ">
            <BarChart3 size={23} strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reports & Analytics
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Understand your income, spending and savings.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTER CARD
      ====================================================== */}
      <div className={`${cardClass} mb-6 overflow-hidden`}>

        {/* Filter heading */}
        <div className="
          flex flex-col gap-2
          border-b border-slate-100
          px-5 py-4
          sm:flex-row sm:items-center sm:justify-between
        ">
          <div className="flex items-center gap-3">

            <div className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              bg-slate-100
              text-slate-600
            ">
              <Filter size={17} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Report filters
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Choose the period and date range for your report.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="
              inline-flex items-center justify-center gap-2
              self-start
              rounded-lg
              border border-slate-200
              bg-white
              px-3 py-2
              text-xs font-semibold
              text-slate-600
              transition
              hover:bg-slate-50
              hover:text-slate-900
              focus:outline-none
              focus:ring-4
              focus:ring-slate-500/10
              sm:self-auto
            "
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">

          {/* Group By */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Group results by
            </label>

            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className={selectClass}
            >
              <option value="month">
                Month
              </option>

              <option value="day">
                Day
              </option>

              <option value="year">
                Year
              </option>
            </select>

            <p className="mt-1.5 text-xs text-slate-400">
              Controls the main income vs expense chart.
            </p>
          </div>

          {/* Start date */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Start date
            </label>

            <div className="relative">
              <CalendarDays
                size={16}
                className="
                  pointer-events-none
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className={`${dateClass} pl-10`}
              />
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              Optional beginning date.
            </p>
          </div>

          {/* End date */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              End date
            </label>

            <div className="relative">
              <CalendarDays
                size={16}
                className="
                  pointer-events-none
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                className={`${dateClass} pl-10`}
              />
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              Optional ending date.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Income */}
        <div className={`${cardClass} p-5`}>
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total income
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>

            <div className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-emerald-50
              text-emerald-600
              ring-1 ring-emerald-100
            ">
              <TrendingUp size={19} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <ArrowUpRight size={14} />
            Money received
          </div>
        </div>

        {/* Total Expense */}
        <div className={`${cardClass} p-5`}>
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total expense
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>

            <div className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-red-50
              text-red-600
              ring-1 ring-red-100
            ">
              <TrendingDown size={19} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-red-600">
            <ArrowDownRight size={14} />
            Money spent
          </div>
        </div>

        {/* Net Savings */}
        <div className={`${cardClass} p-5`}>
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Net savings
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(summary.netSavings)}
              </p>
            </div>

            <div className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-indigo-50
              text-indigo-600
              ring-1 ring-indigo-100
            ">
              <PiggyBank size={19} />
            </div>
          </div>

          <div className="mt-4 text-xs font-medium text-slate-500">
            Status:{' '}
            <span className="font-semibold text-slate-700">
              {summary.status || '—'}
            </span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className={`${cardClass} p-5`}>
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Savings rate
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {summary.savingsRate ?? 0}%
              </p>
            </div>

            <div className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-slate-100
              text-slate-600
              ring-1 ring-slate-200
            ">
              <Percent size={19} />
            </div>
          </div>

          <div className="mt-4 text-xs font-medium text-slate-500">
            Income saved after expenses
          </div>
        </div>
      </div>

      {/* =====================================================
          CHARTS
      ====================================================== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Income vs Expense */}
        <div className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">

              <div className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-indigo-50
                text-indigo-600
              ">
                <BarChart3 size={17} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Income vs expense
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Compare income, spending and savings over time.
                </p>
              </div>

            </div>
          </div>

          <div className="p-5">
            {iveData.length === 0 ? (
              <div className="flex min-h-75 items-center justify-center">
                <EmptyState
                  title="No data"
                  description="There is nothing to chart for this period."
                />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={iveData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="period"
                      tick={{
                        fontSize: 12,
                      }}
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tick={{
                        fontSize: 12,
                      }}
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow:
                          '0 10px 30px rgba(15,23,42,0.08)',
                      }}
                    />

                    <Legend />

                    <Bar
                      dataKey="Income"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />

                    <Bar
                      dataKey="Expense"
                      fill="#ef4444"
                      radius={[6, 6, 0, 0]}
                    />

                    <Bar
                      dataKey="Net"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Category */}
        <div className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">

              <div className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-amber-50
                text-amber-600
              ">
                <Wallet size={17} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Spending by category
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  See where most of your money is going.
                </p>
              </div>

            </div>
          </div>

          <div className="p-5">
            {catChartData.length === 0 ? (
              <div className="flex min-h-75 items-center justify-center">
                <EmptyState
                  title="No expense data"
                  description="There are no expenses to display."
                />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={catChartData}
                      dataKey="totalAmount"
                      nameKey="category"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {catChartData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={
                            PIE_COLORS[
                              index % PIE_COLORS.length
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow:
                          '0 10px 30px rgba(15,23,42,0.08)',
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Payment Mode */}
        <div className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">

              <div className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-indigo-50
                text-indigo-600
              ">
                <Wallet size={17} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Spending by payment method
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Compare spending across payment methods.
                </p>
              </div>

            </div>
          </div>

          <div className="p-5">
            {payChartData.length === 0 ? (
              <div className="flex min-h-75 items-center justify-center">
                <EmptyState
                  title="No payment data"
                  description="There are no expenses to display."
                />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={payChartData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 15,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      tick={{
                        fontSize: 12,
                      }}
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="paymentMode"
                      tick={{
                        fontSize: 12,
                      }}
                      stroke="#64748b"
                      tickLine={false}
                      axisLine={false}
                      width={105}
                    />

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow:
                          '0 10px 30px rgba(15,23,42,0.08)',
                      }}
                    />

                    <Bar
                      dataKey="totalAmount"
                      fill="#6366f1"
                      radius={[0, 7, 7, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Daily Spending */}
        <div className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">

              <div className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-red-50
                text-red-600
              ">
                <TrendingDown size={17} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Daily spending
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Spending trend across the last 30 days.
                </p>
              </div>

            </div>
          </div>

          <div className="p-5">
            {dailyData.length === 0 ? (
              <div className="flex min-h-75 items-center justify-center">
                <EmptyState
                  title="No spending data"
                  description="There are no expenses to display."
                />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={dailyData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="period"
                      tick={{
                        fontSize: 11,
                      }}
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tick={{
                        fontSize: 12,
                      }}
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow:
                          '0 10px 30px rgba(15,23,42,0.08)',
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="Spending"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          TOP CATEGORIES
      ====================================================== */}
      <div className={`${cardClass} mt-6 overflow-hidden`}>

        <div className="
          flex flex-col gap-2
          border-b border-slate-100
          px-5 py-4
          sm:flex-row sm:items-center sm:justify-between
        ">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Top spending categories
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Categories with the highest total spending.
            </p>
          </div>

          <div className="
            inline-flex w-fit
            items-center gap-2
            rounded-full
            bg-slate-100
            px-3 py-1.5
            text-xs font-semibold
            text-slate-600
          ">
            <Wallet size={13} />
            Top 5
          </div>
        </div>

        {topCategories.length === 0 ? (
          <div className="px-5 py-14">
            <EmptyState
              title="No data yet"
              description="Add some expenses to see your top spending categories."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-175 w-full">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="
                    px-5 py-3.5
                    text-left
                    text-xs font-semibold
                    text-slate-500
                  ">
                    Rank
                  </th>

                  <th className="
                    px-5 py-3.5
                    text-left
                    text-xs font-semibold
                    text-slate-500
                  ">
                    Category
                  </th>

                  <th className="
                    px-5 py-3.5
                    text-right
                    text-xs font-semibold
                    text-slate-500
                  ">
                    Total spent
                  </th>

                  <th className="
                    px-5 py-3.5
                    text-right
                    text-xs font-semibold
                    text-slate-500
                  ">
                    Transactions
                  </th>

                  <th className="
                    px-5 py-3.5
                    text-right
                    text-xs font-semibold
                    text-slate-500
                  ">
                    Average
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {topCategories.map((row) => (
                  <tr
                    key={row.category}
                    className="
                      transition
                      hover:bg-slate-50/70
                    "
                  >

                    {/* Rank */}
                    <td className="px-5 py-4">
                      <span className="
                        inline-flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-indigo-50
                        text-xs font-bold
                        text-indigo-700
                      ">
                        #{row.rank}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-slate-800">
                        {row.category}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(row.totalAmount)}
                      </span>
                    </td>

                    {/* Transactions */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm text-slate-600">
                        {row.transactionCount}
                      </span>
                    </td>

                    {/* Average */}
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-medium text-slate-600">
                        {formatCurrency(row.averageAmount)}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
