import api from '../api/axios';

const BASE = '/reports';

export const reportService = {
  monthlySummary: (params = {}) => api.get(`${BASE}/summary/monthly`, { params }),
  categorySummary: (params = {}) => api.get(`${BASE}/summary/category`, { params }),
  paymentModeSummary: (params = {}) => api.get(`${BASE}/summary/payment-mode`, { params }),
  topCategories: (params = {}) => api.get(`${BASE}/top-categories`, { params }),
  dailyTrend: (params = {}) => api.get(`${BASE}/trends/daily`, { params }),
  monthlyTrend: (params = {}) => api.get(`${BASE}/trends/monthly`, { params }),
  incomeVsExpense: (params = {}) => api.get(`${BASE}/income-vs-expense`, { params }),
};