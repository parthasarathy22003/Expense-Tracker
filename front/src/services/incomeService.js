import api from '../api/axios';

const BASE = '/incomes';

export const incomeService = {
  list: (params = {}) => api.get(BASE, { params }),
  get: (id) => api.get(`${BASE}/${id}`),
  create: (payload) => api.post(BASE, payload),
  update: (id, payload) => api.put(`${BASE}/${id}`, payload),
  patch: (id, payload) => api.patch(`${BASE}/${id}`, payload),
  remove: (id) => api.delete(`${BASE}/${id}`),
};