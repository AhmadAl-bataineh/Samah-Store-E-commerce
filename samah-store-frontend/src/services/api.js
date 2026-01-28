import axios from 'axios';

// Production: use empty string (relative paths, same-origin via reverse proxy)
// Development: Vite proxy handles /api/* -> localhost:8080
// Only set baseURL if explicitly needed (e.g., different API domain)
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Single-flight refresh state
let isRefreshing = false;
let refreshPromise = null;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - handle 401/refresh with queueing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request and wait for refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const { data } = await axios.post(
            `${baseURL}/api/auth/refresh`,
            {},
            { withCredentials: true }
          );

          if (data && data.accessToken) {
            localStorage.setItem('token', data.accessToken);
            if (data.user) localStorage.setItem('userInfo', JSON.stringify(data.user));
            processQueue(null, data.accessToken);
            return data.accessToken;
          }

          throw new Error('No access token in refresh response');
        } catch (refreshError) {
          processQueue(refreshError, null);
          // logout on refresh failure
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          // dispatch a logout event so the app (AuthProvider) can handle cleanup/redirection
          try {
            window.dispatchEvent(new Event('samah_logout'));
          } catch (e) {
            // fallback to simple redirect if events fail
            window.location.href = '/login';
          }
          throw refreshError;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      try {
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

