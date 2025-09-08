import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { authService } from './auth';
import { config } from '../config/env';

// API Configuration
const API_BASE_URL = config.API_BASE_URL;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
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
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshed = await authService.refreshAccessToken();
      if (refreshed) {
        // Retry the original request
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${authService.getAccessToken()}`;
        return api(originalRequest);
      } else {
        // Refresh failed, logout user
        authService.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: '/products/products/',
  PRODUCT_DETAIL: (id: string | number) => `/products/products/${id}/`,
  PRODUCT_UPVOTE: (id: string | number) => `/products/products/${id}/upvote/`,
  PRODUCT_COMMENT: (id: string | number) => `/products/products/${id}/comment/`,
  PRODUCT_TRENDING: '/products/products/trending/',
  PRODUCT_FEATURED: '/products/products/featured/',
  
  // Categories
  CATEGORIES: '/products/categories/',
  CATEGORY_PRODUCTS: (slug: string) => `/products/categories/${slug}/products/`,
  
  // Tags
  TAGS: '/products/tags/',
  TAG_PRODUCTS: (slug: string) => `/products/tags/${slug}/products/`,
  
  // Users
  USERS: '/users/users/',
  USER_PROFILE: (username: string) => `/users/users/${username}/profile/`,
  USER_PRODUCTS: (username: string) => `/users/users/${username}/products/`,
  USER_ACTIVITIES: (username: string) => `/users/users/${username}/activities/`,
  
  // Authentication
  REGISTER: '/users/auth/register/',
  LOGIN: '/users/auth/login/',
  CHANGE_PASSWORD: '/users/auth/change-password/',
  
  // User Profile
  PROFILE_ME: '/users/profiles/me/',
  FOLLOWS: '/users/follows/',
  FOLLOWERS: '/users/follows/followers/',
  FOLLOWING: '/users/follows/following/',
  
  // Search
  SEARCH: '/search/',
  USER_SEARCH: '/users/search/',
  
  // Core
  HEALTH: '/health/',
  API_INFO: '/info/',
  STATS: '/stats/',
};

// API service functions
export const apiService = {
  // Generic GET request
  get: async <T>(endpoint: string, params?: any): Promise<T> => {
    const response = await api.get(endpoint, { params });
    return response.data;
  },

  // Generic POST request
  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await api.post(endpoint, data);
    return response.data;
  },

  // Generic PUT request
  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await api.put(endpoint, data);
    return response.data;
  },

  // Generic PATCH request
  patch: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await api.patch(endpoint, data);
    return response.data;
  },

  // Generic DELETE request
  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await api.delete(endpoint);
    return response.data;
  },
};

// Product service
export const productService = {
  // Get all products
  getProducts: (params?: any) => apiService.get(API_ENDPOINTS.PRODUCTS, params),
  
  // Get product by ID
  getProduct: (id: string | number) => apiService.get(API_ENDPOINTS.PRODUCT_DETAIL(id)),
  
  // Create product
  createProduct: (data: any) => apiService.post(API_ENDPOINTS.PRODUCTS, data),
  
  // Update product
  updateProduct: (id: string | number, data: any) => apiService.put(API_ENDPOINTS.PRODUCT_DETAIL(id), data),
  
  // Delete product
  deleteProduct: (id: string | number) => apiService.delete(API_ENDPOINTS.PRODUCT_DETAIL(id)),
  
  // Upvote product
  upvoteProduct: (id: string | number) => apiService.post(API_ENDPOINTS.PRODUCT_UPVOTE(id)),
  
  // Comment on product
  commentProduct: (id: string | number, data: any) => apiService.post(API_ENDPOINTS.PRODUCT_COMMENT(id), data),
  
  // Get trending products
  getTrending: () => apiService.get(API_ENDPOINTS.PRODUCT_TRENDING),
  
  // Get featured products
  getFeatured: () => apiService.get(API_ENDPOINTS.PRODUCT_FEATURED),
  
  // Get categories
  getCategories: () => apiService.get(API_ENDPOINTS.CATEGORIES),
};

// User service
export const userService = {
  // Get user profile
  getProfile: (username: string) => apiService.get(API_ENDPOINTS.USER_PROFILE(username)),
  
  // Get user products
  getUserProducts: (username: string, params?: any) => apiService.get(API_ENDPOINTS.USER_PRODUCTS(username), params),
  
  // Get user activities
  getUserActivities: (username: string, params?: any) => apiService.get(API_ENDPOINTS.USER_ACTIVITIES(username), params),
  
  // Update own profile
  updateProfile: (data: any) => apiService.patch(API_ENDPOINTS.PROFILE_ME, data),
  
  // Get own profile
  getOwnProfile: () => apiService.get(API_ENDPOINTS.PROFILE_ME),
};

// Note: Auth service is now in auth.ts

// Search service
export const searchService = {
  // Global search
  globalSearch: (query: string) => apiService.get(API_ENDPOINTS.SEARCH, { q: query }),
  
  // User search
  userSearch: (query: string) => apiService.get(API_ENDPOINTS.USER_SEARCH, { q: query }),
};

export default api;
