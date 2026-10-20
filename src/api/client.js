import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

// Create a dedicated Axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Tokens dynamically
apiClient.interceptors.request.use(
  (config) => {
    // In a real app, grab your JWT token from the store or cookies
    const user = useAuthStore.getState().user;
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;
    const addToast = useToastStore.getState().addToast;
    const logout = useAuthStore.getState().logout;

    if (response?.status === 401) {
      addToast('Session expired. Please log in again.', 'error');
      logout();
      window.location.href = '/login';
    } else if (response?.status >= 500) {
      addToast('Server error. Our team has been notified.', 'error');
    }

    return Promise.reject(error);
  }
);
