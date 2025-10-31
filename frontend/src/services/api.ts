import axios from 'axios';
import { ApiResponse, AuthResponse, DashboardMetrics, AdoptionHistory } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7000';

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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
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

export default api;
