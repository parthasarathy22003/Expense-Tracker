const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.name, '-', err.message);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e) => e.message),
    });
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({
      success: false,
      message: 'Database error',
      error: err.message,
    });
  }

  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
    });
  }

  const status = err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = { notFound, errorHandler };