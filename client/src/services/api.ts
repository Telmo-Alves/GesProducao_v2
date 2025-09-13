import axios, { AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, User, CreateUserRequest, UpdateUserRequest, ApiResponse, AppConfig } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AxiosResponse<ApiResponse<LoginResponse>>> => {
    return api.post('/auth/login', credentials);
  },

  validateToken: async (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> => {
    return api.get('/auth/validate');
  },
};

// Users API
export const usersApi = {
  getAllUsers: async (): Promise<AxiosResponse<ApiResponse<User[]>>> => {
    return api.get('/users');
  },

  getUserById: async (id: string): Promise<AxiosResponse<ApiResponse<User>>> => {
    return api.get(`/users/${id}`);
  },

  createUser: async (userData: CreateUserRequest): Promise<AxiosResponse<ApiResponse<User>>> => {
    return api.post('/users', userData);
  },

  updateUser: async (id: string, userData: UpdateUserRequest): Promise<AxiosResponse<ApiResponse<User>>> => {
    return api.put(`/users/${id}`, userData);
  },

  deleteUser: async (id: string): Promise<AxiosResponse<ApiResponse>> => {
    return api.delete(`/users/${id}`);
  },
};

// Config API
export const configApi = {
  getConfig: async (): Promise<AxiosResponse<ApiResponse<AppConfig>>> => {
    return api.get('/config');
  },

  updateConfig: async (configData: Partial<AppConfig>): Promise<AxiosResponse<ApiResponse<AppConfig>>> => {
    return api.put('/config', configData);
  },

  testConnection: async (database: 'producao' | 'gescom'): Promise<AxiosResponse<ApiResponse<{ database: string; connected: boolean }>>> => {
    return api.get(`/config/test/${database}`);
  },

  testAllConnections: async (): Promise<AxiosResponse<ApiResponse<{ producao: boolean; gescom: boolean }>>> => {
    return api.get('/config/test');
  },

  reloadConfig: async (): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/config/reload');
  },
};

export default api;
