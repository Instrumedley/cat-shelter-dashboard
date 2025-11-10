import axios from 'axios';
import { ApiResponse, AuthResponse, DashboardMetrics, AdoptionHistory } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7005';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth on 401 if we have a token (user was logged in)
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
    }
    // Don't reload on 403 - it might be a permission issue for public endpoints
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  register: async (username: string, password: string, role: string = 'public'): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      username,
      password,
      role,
    });
    return response.data;
  },
};

export const metricsService = {
  getDashboardMetrics: async (): Promise<ApiResponse<DashboardMetrics>> => {
    const response = await api.get<ApiResponse<DashboardMetrics>>('/metrics/dashboard');
    return response.data;
  },

  getAdoptionHistory: async (): Promise<ApiResponse<AdoptionHistory[]>> => {
    const response = await api.get<ApiResponse<AdoptionHistory[]>>('/metrics/adoption-history');
    return response.data;
  },
};

// Fetcher function for SWR
export const fetcher = async <T>(url: string): Promise<T> => {
  try {
    const response = await api.get<ApiResponse<T>>(url);
    if (!response.data.success) {
      const error: any = new Error(response.data.error?.message || 'Request failed');
      error.response = response;
      throw error;
    }
    return response.data.data;
  } catch (error: any) {
    // Re-throw with response attached for status code checking
    if (error.response) {
      throw error;
    }
    // If no response, it's a network error
    const networkError: any = new Error(error.message || 'Network error');
    networkError.response = { status: 0 };
    throw networkError;
  }
};

export default api;
