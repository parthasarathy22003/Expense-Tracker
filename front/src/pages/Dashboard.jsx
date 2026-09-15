import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import StatCard from '../Comp/StatCard.jsx';
import Loader from '../Comp/Loader.jsx';
import EmptyState from '../Comp/EmptyState.jsx';
import { reportService } from '../services/reportService.js';
import { useUser } from '../context/UserContext.jsx';
import { formatCurrency, monthLabel } from '../utils/format.js';
import { notifyError } from '../Comp/Toast.jsx';

export default function Dashboard() {
  const { userId } = useUser();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const [ive, trendRes, top] = await Promise.all([
          reportService.incomeVsExpense({
            userId,
            groupBy: 'month',
          }),
          reportService.monthlyTrend({ userId }),
          reportService.topCategories({
            userId,
            limit: 5,
          }),
        ]);

        if (cancelled) return;

        setSummary(ive?.summary || null);
        setTrend(trendRes?.data || []);
        setRecent(top?.data || []);
      } catch (err) {
        if (!cancelled) {
          notifyError(err.message || 'Failed to load dashboard');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <Loader label="Loading dashboard…" />;
  }

  const chartData = trend.map((t) => ({
    month: monthLabel(t.period),
    Spending: t.totalAmount,
    Cumulative: t.cumulativeAmount,
  }));

  return (
    <div className="min-h-full space-y-6 bg-slate-50/60 p-1 sm:p-2">

      {/* -------------------------------------------------
          Header
      -------------------------------------------------- */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-brand-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Financial Overview
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Here’s a quick look at your financial activity.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <Wallet size={18} />
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              User
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {userId}
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          Stats
      -------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="group rounded-2xl border border-emerald-100 bg-linear-to-br from-white to-emerald-50/60 p-1 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <StatCard
            label="Total Income"
            value={formatCurrency(summary?.totalIncome)}
            icon={TrendingUp}
            tone="green"
          />
        </div>

        <div className="group rounded-2xl border border-rose-100 bg-linear-to-br from-white to-rose-50/60 p-1 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <StatCard
            label="Total Expense"
            value={formatCurrency(summary?.totalExpense)}
            icon={TrendingDown}
            tone="red"
          />
        </div>

        <div className="group rounded-2xl border border-indigo-100 bg-linear-to-br from-white to-indigo-50/60 p-1 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <StatCard
            label="Net Savings"
            value={formatCurrency(summary?.netSavings)}
            sub={summary?.status}
            icon={PiggyBank}
            tone={summary?.netSavings >= 0 ? 'brand' : 'amber'}
          />
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-1 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <StatCard
            label="Savings Rate"
            value={`${summary?.savingsRate ?? 0}%`}
            icon={Wallet}
            tone="slate"
          />
        </div>
      </div>

      {/* -------------------------------------------------
          Main Content
      -------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* -------------------------------------------------
            Spending Chart
        -------------------------------------------------- */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

          {/* Chart Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly spending trend
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Track your spending over time
              </p>
            </div>

            <Link
              to="/reports"
              className="group inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50"
            >
              View reports
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {/* Chart */}
          <div className="p-4 sm:p-5">
            {chartData.length === 0 ? (
              <div className="flex min-h-70 items-center justify-center">
                <EmptyState
                  title="No spending data"
                  description="Add some expenses to see your monthly trend."
                />
              </div>
            ) : (
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 5,
                      left: -15,
                      bottom: 5,
                    }}
                    barGap={8}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#e2e8f0"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 12,
                        fill: '#64748b',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: '#64748b',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      cursor={{
                        fill: '#f8fafc',
                      }}
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow:
                          '0 10px 25px rgba(15, 23, 42, 0.08)',
                        padding: '10px 12px',
                      }}
                    />

                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={35}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: '12px',
                        color: '#64748b',
                      }}
                    />

                    <Bar
                      dataKey="Spending"
                      fill="#6366f1"
                      radius={[7, 7, 0, 0]}
                      maxBarSize={32}
                    />

                    <Bar
                      dataKey="Cumulative"
                      fill="#c7d2fe"
                      radius={[7, 7, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------
            Top Categories
        -------------------------------------------------- */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Top categories
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Where your money goes
              </p>
            </div>

            <Link
              to="/reports"
              className="group flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-brand-50 hover:text-brand-600"
              title="View all reports"
            >
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {/* Categories */}
          <div className="p-4">
            {recent.length === 0 ? (
              <div className="flex min-h-70 items-center justify-center">
                <EmptyState
                  title="No categories"
                  description="Add expenses to see your top spending categories."
                />
              </div>
            ) : (
              <ul className="space-y-2">
                {recent.map((c, index) => (
                  <li
                    key={c.category}
                    className="group flex items-center justify-between rounded-xl border border-transparent p-3 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">

                      {/* Rank */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-inset ring-brand-100">
                        {c.rank || index + 1}
                      </div>

                      {/* Category Info */}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {c.category}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {c.transactionCount} transactions
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <span className="ml-3 whitespace-nowrap text-sm font-bold text-slate-800">
                      {formatCurrency(c.totalAmount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          Bottom Info
      -------------------------------------------------- */}
      <div className="rounded-2xl border border-brand-100 bg-linear-to-r from-brand-50/80 via-white to-indigo-50/60 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Keep an eye on your spending
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use the reports section to understand your income,
              expenses, and spending patterns in more detail.
            </p>
          </div>

          <Link
            to="/reports"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Explore reports
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

