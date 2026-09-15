export const formatCurrency = (value) => {
  const n = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n);
};

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN').format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const monthLabel = (period) => {
  if (!period) return '';
  const [y, m] = period.split('-');
  if (!y || !m) return period;
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const PAYMENT_MODES = ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET', 'OTHER'];

export const INCOME_SOURCES = ['Salary', 'Freelance', 'Investment', 'Rental', 'Bonus', 'Other'];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Rent',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
];

export const todayISO = () => new Date().toISOString().slice(0, 10);