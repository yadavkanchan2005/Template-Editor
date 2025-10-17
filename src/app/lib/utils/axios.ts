// import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
// });

// // Add JWT token from localStorage automatically
// api.interceptors.request.use((config) => {
//   const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//   if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`;
//   return config;
// });

// export default api;


// lib/utils/axios.ts

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;