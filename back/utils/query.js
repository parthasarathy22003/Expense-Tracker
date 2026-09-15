/**
 * Builds LIMIT / OFFSET from ?page & ?limit
 */
const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Builds ORDER BY from ?sortBy & ?order (whitelist protected)
 */
const getSorting = (query, allowedFields, defaultField = 'date', defaultOrder = 'DESC') => {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const order = String(query.order || defaultOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  return [[sortBy, order]];
};

/**
 * Standard pagination metadata
 */
const buildMeta = (totalItems, page, limit) => ({
  totalItems,
  totalPages: Math.ceil(totalItems / limit) || 0,
  currentPage: page,
  pageSize: limit,
  hasNextPage: page * limit < totalItems,
  hasPrevPage: page > 1,
});

module.exports = { getPagination, getSorting, buildMeta };