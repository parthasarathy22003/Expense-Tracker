import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — unwraps the payload and normalizes errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const payload = error.response?.data;
    const message =
      payload?.message ||
      payload?.error ||
      error.message ||
      'Unexpected error occurred';

    return Promise.reject({
      message,
      errors: payload?.errors || [],
      status: error.response?.status || 0,
    });
  }
);

export default api;