const PAYMENT_MODES = ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET', 'OTHER'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const validateExpense = (body = {}, { partial = false } = {}) => {
  const errors = [];
  const present = (k) => body[k] !== undefined;

  if (!partial) {
    ['userId', 'category', 'amount', 'date', 'paymentMode'].forEach((field) => {
      if (!present(field) || body[field] === '' || body[field] === null) {
        errors.push(`${field} is required`);
      }
    });
  }

  if (present('userId') && (typeof body.userId !== 'string' || !body.userId.trim())) {
    errors.push('userId must be a non-empty string');
  } else if (present('userId') && body.userId.length > 64) {
    errors.push('userId must be at most 64 characters');
  }

  if (present('category') && (typeof body.category !== 'string' || !body.category.trim())) {
    errors.push('category must be a non-empty string');
  } else if (present('category') && body.category.length > 64) {
    errors.push('category must be at most 64 characters');
  }

  if (present('amount')) {
    const n = Number(body.amount);
    if (!Number.isFinite(n) || n <= 0) errors.push('amount must be a positive number');
  }

  if (present('date')) {
    if (!DATE_REGEX.test(String(body.date)) || Number.isNaN(Date.parse(body.date))) {
      errors.push('date must be a valid date in YYYY-MM-DD format');
    }
  }

  if (present('paymentMode')) {
    if (!PAYMENT_MODES.includes(String(body.paymentMode).toUpperCase())) {
      errors.push(`paymentMode must be one of: ${PAYMENT_MODES.join(', ')}`);
    }
  }

  if (present('description') && body.description !== null && String(body.description).length > 255) {
    errors.push('description must be at most 255 characters');
  }

  return errors;
};

module.exports = { validateExpense, PAYMENT_MODES };