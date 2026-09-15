import { useCallback, useEffect, useState } from 'react';
import {
  Pencil,
  Plus,
  Trash2,
  Wallet,
  Search,
  CalendarDays,
  Tag,
  IndianRupee,
} from 'lucide-react';

import Modal from '../Comp/Modal.jsx';
import Loader from '../Comp/Loader.jsx';
import EmptyState from '../Comp/EmptyState.jsx';
import Pagination from '../Comp/Pagination.jsx';
import FilterBar from '../Comp/FilterBar.jsx';
import { notifyError, notifySuccess } from '../Comp/Toast.jsx';
import { incomeService } from '../services/incomeService.js';
import { useUser } from '../context/UserContext.jsx';
import useDebounce from '../hooks/useDebounce.js';

import {
  INCOME_SOURCES,
  formatCurrency,
  formatDate,
  todayISO,
} from '../utils/format.js';

const EMPTY_FORM = {
  source: 'Salary',
  amount: '',
  date: todayISO(),
  description: '',
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10';

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10';

const labelClass =
  'mb-2 block text-sm font-semibold text-slate-700';

export default function Incomes() {
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
    source: '',
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
      if (filters.source) params.source = filters.source;

      const res = await incomeService.list(params);

      setRows(res?.data || []);
      setMeta(res?.meta || null);
    } catch (err) {
      notifyError(err.message || 'Failed to load incomes');
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
    filters.source,
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
    filters.source,
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
      source: row.source,
      amount: row.amount,
      date: row.date,
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

    if (!form.source || !form.amount || !form.date) {
      notifyError('Please fill all required fields');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        userId,
        source: form.source,
        amount: Number(form.amount),
        date: form.date,
        description: form.description || null,
      };

      if (editing) {
        await incomeService.update(editing.id, payload);
        notifySuccess('Income updated');
      } else {
        await incomeService.create(payload);
        notifySuccess('Income created');
      }

      closeModal();
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
        `Delete this income of ${formatCurrency(row.amount)}?`
      )
    ) {
      return;
    }

    try {
      await incomeService.remove(row.id);
      notifySuccess('Income deleted');
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
      source: '',
    });

  return (
    <div className="min-h-full bg-slate-50/40 p-1">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <Wallet size={22} strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Income
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Track salary, freelance work and other earnings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="
            inline-flex w-full items-center justify-center gap-2
            rounded-xl bg-emerald-600
            px-5 py-3
            text-sm font-semibold text-white
            shadow-sm shadow-emerald-200
            transition
            hover:bg-emerald-700
            hover:shadow-md hover:shadow-emerald-200
            active:scale-[0.98]
            focus:outline-none
            focus:ring-4
            focus:ring-emerald-500/20
            sm:w-auto
          "
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Income
        </button>
      </div>

      {/* =====================================================
          FILTER CARD
      ====================================================== */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Search size={17} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Find income
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Search and filter your income records
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
                {/* Source */}
                <div>
                  <label className={labelClass}>
                    Income source
                  </label>

                  <div className="relative">
                    <Tag
                      size={16}
                      className="
                        pointer-events-none
                        absolute left-3.5 top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <select
                      value={filters.source}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          source: e.target.value,
                        })
                      }
                      className={`${selectClass} pl-10`}
                    >
                      <option value="">
                        All sources
                      </option>

                      {INCOME_SOURCES.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Empty grid column */}
                <div className="hidden lg:block" />
              </>
            }
          />
        </div>
      </div>

      {/* =====================================================
          TABLE CARD
      ====================================================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {loading ? (
          <div className="flex min-h-90 items-center justify-center">
            <Loader label="Loading income..." />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-16">
            <EmptyState
              title="No income found"
              description="Add your first income to start tracking your earnings."
              action={
                <button
                  type="button"
                  onClick={openCreate}
                  className="
                    inline-flex items-center gap-2
                    rounded-xl bg-emerald-600
                    px-4 py-2.5
                    text-sm font-semibold text-white
                    shadow-sm
                    transition
                    hover:bg-emerald-700
                    focus:outline-none
                    focus:ring-4
                    focus:ring-emerald-500/20
                  "
                >
                  <Plus size={17} />
                  Add your first income
                </button>
              }
            />
          </div>
        ) : (
          <>
            {/* Table heading */}
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Income history
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Click a column heading to sort
                </p>
              </div>

              {meta?.total != null && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <Wallet size={13} />
                  {meta.total} records
                </div>
              )}
            </div>

            {/* Responsive table */}
            <div className="overflow-x-auto">
              <table className="min-w-190 w-full">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    {/* Date */}
                    <th
                      className="
                        cursor-pointer
                        px-5 py-3.5
                        text-left
                        text-xs font-semibold
                        text-slate-500
                        transition
                        hover:text-emerald-600
                      "
                      onClick={() => toggleSort('date')}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        Date

                        <span className="font-bold text-emerald-600">
                          {sortArrow('date')}
                        </span>
                      </span>
                    </th>

                    {/* Source */}
                    <th
                      className="
                        cursor-pointer
                        px-5 py-3.5
                        text-left
                        text-xs font-semibold
                        text-slate-500
                        transition
                        hover:text-emerald-600
                      "
                      onClick={() => toggleSort('source')}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        Source

                        <span className="font-bold text-emerald-600">
                          {sortArrow('source')}
                        </span>
                      </span>
                    </th>

                    {/* Amount */}
                    <th
                      className="
                        cursor-pointer
                        px-5 py-3.5
                        text-right
                        text-xs font-semibold
                        text-slate-500
                        transition
                        hover:text-emerald-600
                      "
                      onClick={() => toggleSort('amount')}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        Amount

                        <span className="font-bold text-emerald-600">
                          {sortArrow('amount')}
                        </span>
                      </span>
                    </th>

                    {/* Description */}
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500">
                      Description
                    </th>

                    {/* Actions */}
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="
                        group
                        transition
                        hover:bg-slate-50/70
                      "
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

                      {/* Source */}
                      <td className="px-5 py-4">
                        <span
                          className="
                            inline-flex items-center gap-1.5
                            rounded-lg
                            bg-emerald-50
                            px-2.5 py-1.5
                            text-xs font-semibold
                            text-emerald-700
                            ring-1 ring-inset ring-emerald-100
                          "
                        >
                          <Wallet size={13} />
                          {row.source}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                          <span className="text-emerald-500">+</span>
                          {formatCurrency(row.amount)}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="max-w-75 px-5 py-4">
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
                            title="Edit income"
                            aria-label="Edit income"
                            className="
                              inline-flex h-9 w-9
                              items-center justify-center
                              rounded-lg
                              border border-transparent
                              text-slate-500
                              transition
                              hover:border-emerald-100
                              hover:bg-emerald-50
                              hover:text-emerald-600
                              focus:outline-none
                              focus:ring-4
                              focus:ring-emerald-500/10
                            "
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            title="Delete income"
                            aria-label="Delete income"
                            className="
                              inline-flex h-9 w-9
                              items-center justify-center
                              rounded-lg
                              border border-transparent
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

      {/* =====================================================
          ADD / EDIT INCOME MODAL
      ====================================================== */}
      <Modal
        open={modalOpen}
        title={editing ? 'Edit income' : 'Add income'}
        onClose={closeModal}
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="
                rounded-xl
                border border-slate-200
                bg-white
                px-5 py-2.5
                text-sm font-semibold
                text-slate-600
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
              form="income-form"
              type="submit"
              disabled={saving}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl
                bg-emerald-600
                px-5 py-2.5
                text-sm font-semibold
                text-white
                shadow-sm shadow-emerald-200
                transition
                hover:bg-emerald-700
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-60
                focus:outline-none
                focus:ring-4
                focus:ring-emerald-500/20
              "
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Plus size={16} />

                  {editing
                    ? 'Update Income'
                    : 'Add Income'}
                </>
              )}
            </button>

          </div>
        }
      >
        <form
          id="income-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Modal intro */}
          <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
            <p className="text-sm font-medium text-emerald-900">
              {editing
                ? 'Update your income details.'
                : 'Enter the details of your new income.'}
            </p>

            <p className="mt-0.5 text-xs text-emerald-600">
              Fields marked with * are required.
            </p>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Source */}
            <div>
              <label className={labelClass}>
                Income source{' '}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Wallet
                  size={17}
                  className="
                    pointer-events-none
                    absolute left-3.5 top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className={`${selectClass} pl-10`}
                >
                  {INCOME_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className={labelClass}>
                Amount{' '}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <IndianRupee
                  size={17}
                  className="
                    pointer-events-none
                    absolute left-3.5 top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Date */}
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Date{' '}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="
                    pointer-events-none
                    absolute left-3.5 top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
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
              placeholder="What is this income from?"
              className={`${inputClass} resize-none`}
            />
          </div>

        </form>
      </Modal>
    </div>
  );
}

