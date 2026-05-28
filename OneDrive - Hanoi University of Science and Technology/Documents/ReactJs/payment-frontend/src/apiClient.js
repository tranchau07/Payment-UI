import axios from 'axios';

let authToken = null;
let logoutCallback = null;
let tokenRefreshCallback = null;

export const setSessionToken = (token) => {
  authToken = token;
};

export const registerLogoutCallback = (cb) => {
  logoutCallback = cb;
};

export const registerTokenRefreshCallback = (cb) => {
  tokenRefreshCallback = cb;
};

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // Crucial for receiving/sending HttpOnly cookies
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor: Attach JWT access token to header if exists
apiClient.interceptors.request.use(
  (config) => {
    // Avoid putting auth header on login / refresh requests to keep them isolated
    if (authToken && !config.url.startsWith('/auth/login') && !config.url.startsWith('/auth/refresh')) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle expired tokens and automatic refresh
let isRefreshing = false;
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and request has not already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we are already refreshing or the request is login/refresh itself, don't loop
      if (originalRequest.url.startsWith('/auth/login') || originalRequest.url.startsWith('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Enqueue the request until token is refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[SECURITY] Access token expired, attempting silent refresh...');
        const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const { accessToken } = response.data;

        if (accessToken) {
          setSessionToken(accessToken);
          if (tokenRefreshCallback) {
            tokenRefreshCallback(accessToken, response.data.username, response.data.roles);
          }
          
          processQueue(null, accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        console.warn('[SECURITY] Refresh token expired or invalid, forcing logout');
        processQueue(refreshErr, null);
        if (logoutCallback) {
          logoutCallback();
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;