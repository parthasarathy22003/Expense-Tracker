import { useCallback, useEffect, useState } from 'react';
import {
  Pencil,
  Plus,
  Trash2,
  Receipt,
  CalendarDays,
  Search,
  CreditCard,
  Tag,
  Wallet,
  X,
} from 'lucide-react';

import Modal from '../Comp/Modal.jsx';
import Loader from '../Comp/Loader.jsx';
import EmptyState from '../Comp/EmptyState.jsx';
import Pagination from '../Comp/Pagination.jsx';
import FilterBar from '../Comp/FilterBar.jsx';
import { notifyError, notifySuccess } from '../Comp/Toast.jsx';
import { expenseService } from '../services/expenseService.js';
import { useUser } from '../context/UserContext.jsx';
import useDebounce from '../hooks/useDebounce.js';

import {
  EXPENSE_CATEGORIES,
  PAYMENT_MODES,
  formatCurrency,
  formatDate,
  todayISO,
} from '../utils/format.js';

const EMPTY_FORM = {
  category: 'Food',
  amount: '',
  date: todayISO(),
  paymentMode: 'UPI',
  description: '',
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

const labelClass =
  'mb-2 block text-sm font-semibold text-slate-700';

export default function Expenses() {
  const { userId } = useUser();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('DESC');

  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    category: '',
    paymentMode: '',
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        userId,
        page,
        limit,
        sortBy,
        order,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.category) params.category = filters.category;
      if (filters.paymentMode) params.paymentMode = filters.paymentMode;

      const res = await expenseService.list(params);

      setRows(res?.data || []);
      setMeta(res?.meta || null);
    } catch (err) {
      notifyError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [
    userId,
    page,
    limit,
    sortBy,
    order,
    debouncedSearch,
    filters.startDate,
    filters.endDate,
    filters.category,
    filters.paymentMode,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    filters.startDate,
    filters.endDate,
    filters.category,
    filters.paymentMode,
    sortBy,
    order,
  ]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      date: todayISO(),
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);

    setForm({
      category: row.category,
      amount: row.amount,
      date: row.date,
      paymentMode: row.paymentMode,
      description: row.description || '',
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditing(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.category ||
      !form.amount ||
      !form.date ||
      !form.paymentMode
    ) {
      notifyError('Please fill all required fields');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        userId,
        category: form.category,
        amount: Number(form.amount),
        date: form.date,
        paymentMode: form.paymentMode,
        description: form.description || null,
      };

      if (editing) {
        await expenseService.update(editing.id, payload);
        notifySuccess('Expense updated');
      } else {
        await expenseService.create(payload);
        notifySuccess('Expense created');
      }

      setModalOpen(false);
      setEditing(null);
      fetchData();
    } catch (err) {
      const msg = err.errors?.length
        ? err.errors.join(', ')
        : err.message;

      notifyError(msg || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        `Delete this expense of ${formatCurrency(row.amount)}?`
      )
    ) {
      return;
    }

    try {
      await expenseService.remove(row.id);
      notifySuccess('Expense deleted');
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Delete failed');
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setOrder('DESC');
    }
  };

  const sortArrow = (field) => {
    if (sortBy !== field) return '';

    return order === 'ASC' ? '↑' : '↓';
  };

  const resetFilters = () =>
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      category: '',
      paymentMode: '',
    });

  return (
    <div className="min-h-full bg-slate-50/40 p-1">
      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <Receipt size={22} strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Expenses
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Track and manage your daily spending.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="
            inline-flex w-full items-center justify-center gap-2
            rounded-xl bg-indigo-600 px-5 py-3
            text-sm font-semibold text-white
            shadow-sm shadow-indigo-200
            transition
            hover:bg-indigo-700
            hover:shadow-md hover:shadow-indigo-200
            active:scale-[0.98]
            focus:outline-none focus:ring-4 focus:ring-indigo-500/20
            sm:w-auto
          "
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Expense
        </button>
      </div>

      {/* =========================
          FILTER CARD
      ========================== */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Search size={17} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Find expenses
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Search and filter your expense history
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            extra={
              <>
                <div>
                  <label className={labelClass}>
                    Category
                  </label>

                  <div className="relative">
                    <Tag
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      className={`${selectClass} pl-10`}
                      value={filters.category}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="">All categories</option>

                      {EXPENSE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Payment method
                  </label>

                  <div className="relative">
                    <CreditCard
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      className={`${selectClass} pl-10`}
                      value={filters.paymentMode}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          paymentMode: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        All payment methods
                      </option>

                      {PAYMENT_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            }
          />
        </div>
      </div>

      {/* =========================
          EXPENSE TABLE
      ========================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Loading */}
        {loading ? (
          <div className="flex min-h-90 items-center justify-center">
            <Loader label="Loading expenses..." />
          </div>
        ) : rows.length === 0 ? (
          /* Empty state */
          <div className="px-5 py-16">
            <EmptyState
              title="No expenses found"
              description="There are no expenses matching your current filters."
              action={
                <button
                  type="button"
                  onClick={openCreate}
                  className="
                    inline-flex items-center gap-2
                    rounded-xl bg-indigo-600
                    px-4 py-2.5
                    text-sm font-semibold text-white
                    shadow-sm
                    transition
                    hover:bg-indigo-700
                    focus:outline-none
                    focus:ring-4
                    focus:ring-indigo-500/20
                  "
                >
                  <Plus size={17} />
                  Add your first expense
                </button>
              }
            />
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Expense history
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Click a column to sort
                </p>
              </div>

              {meta?.total != null && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <Wallet size={13} />
                  {meta.total} expenses
                </div>
              )}
            </div>

            {/* Responsive table */}
            <div className="overflow-x-auto">
              <table className="min-w-212.5 w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th
                      className="cursor-pointer px-5 py-3.5 text-left text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
                      onClick={() => toggleSort('date')}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        Date
                        <span className="text-indigo-600">
                          {sortArrow('date')}
                        </span>
                      </span>
                    </th>

                    <th
                      className="cursor-pointer px-5 py-3.5 text-left text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
                      onClick={() => toggleSort('category')}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        Category
                        <span className="text-indigo-600">
                          {sortArrow('category')}
                        </span>
                      </span>
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                      Payment
                    </th>

                    <th
                      className="cursor-pointer px-5 py-3.5 text-right text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
                      onClick={() => toggleSort('amount')}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        Amount
                        <span className="text-indigo-600">
                          {sortArrow('amount')}
                        </span>
                      </span>
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                      Description
                    </th>

                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="group transition hover:bg-slate-50/70"
                    >
                      {/* Date */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <CalendarDays size={15} />
                          </div>

                          <span className="text-sm font-medium text-slate-700">
                            {formatDate(row.date)}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                          {row.category}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium capitalize text-slate-600">
                          <CreditCard size={13} />
                          {String(row.paymentMode).replace('_', ' ')}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(row.amount)}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="max-w-70 px-5 py-4">
                        <span
                          className="block truncate text-sm text-slate-500"
                          title={row.description || ''}
                        >
                          {row.description || (
                            <span className="italic text-slate-300">
                              No description
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            title="Edit expense"
                            aria-label="Edit expense"
                            className="
                              inline-flex h-9 w-9 items-center justify-center
                              rounded-lg border border-transparent
                              text-slate-500
                              transition
                              hover:border-indigo-100
                              hover:bg-indigo-50
                              hover:text-indigo-600
                              focus:outline-none
                              focus:ring-4
                              focus:ring-indigo-500/10
                            "
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            title="Delete expense"
                            aria-label="Delete expense"
                            className="
                              inline-flex h-9 w-9 items-center justify-center
                              rounded-lg border border-transparent
                              text-slate-400
                              transition
                              hover:border-red-100
                              hover:bg-red-50
                              hover:text-red-600
                              focus:outline-none
                              focus:ring-4
                              focus:ring-red-500/10
                            "
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-3">
              <Pagination
                meta={meta}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* =========================
          ADD / EDIT MODAL
      ========================== */}
      <Modal
        open={modalOpen}
        title={editing ? 'Edit expense' : 'Add expense'}
        onClose={closeModal}
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="
                rounded-xl border border-slate-200
                bg-white px-5 py-2.5
                text-sm font-semibold text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
                focus:outline-none
                focus:ring-4
                focus:ring-slate-500/10
              "
            >
              Cancel
            </button>

            <button
              form="expense-form"
              type="submit"
              disabled={saving}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl bg-indigo-600
                px-5 py-2.5
                text-sm font-semibold text-white
                shadow-sm shadow-indigo-200
                transition
                hover:bg-indigo-700
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-60
                focus:outline-none
                focus:ring-4
                focus:ring-indigo-500/20
              "
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Plus size={16} />
                  {editing ? 'Update Expense' : 'Add Expense'}
                </>
              )}
            </button>
          </div>
        }
      >
        <form
          id="expense-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Form intro */}
          <div className="rounded-xl bg-indigo-50 px-4 py-3 ring-1 ring-indigo-100">
            <p className="text-sm font-medium text-indigo-900">
              {editing
                ? 'Update your expense details.'
                : 'Enter the details of your new expense.'}
            </p>

            <p className="mt-0.5 text-xs text-indigo-600">
              Fields marked with * are required.
            </p>
          </div>

          {/* Main fields */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label className={labelClass}>
                Category <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Tag
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`${selectClass} pl-10`}
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className={labelClass}>
                Amount <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  ₹
                </span>

                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className={labelClass}>
                Date <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Payment */}
            <div>
              <label className={labelClass}>
                Payment method <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <CreditCard
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  className={`${selectClass} pl-10`}
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>

              <span className="text-xs text-slate-400">
                Optional
              </span>
            </div>

            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="What was this expense for?"
              className={`${inputClass} resize-none`}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

