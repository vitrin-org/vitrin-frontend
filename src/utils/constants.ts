/**
 * Application constants
 */

export const API_ENDPOINTS = {
  PRODUCTS: '/products/products/',
  PRODUCT_DETAIL: (id: string | number) => `/products/products/${id}/`,
  PRODUCT_UPVOTE: (id: string | number) => `/products/products/${id}/upvote/`,
  PRODUCT_COMMENT: (id: string | number) => `/products/products/${id}/comment/`,
  PRODUCT_TRENDING: '/products/products/trending/',
  PRODUCT_FEATURED: '/products/products/featured/',
  CATEGORIES: '/products/categories/',
  TAGS: '/products/tags/',
  USERS: '/users/users/',
  USER_PROFILE: (username: string) => `/users/users/${username}/profile/`,
  USER_PRODUCTS: (username: string) => `/users/users/${username}/products/`,
  REGISTER: '/users/auth/register/',
  LOGIN: '/users/auth/login/',
  GOOGLE_AUTH: '/users/auth/google/',
  PROFILE_ME: '/users/profiles/me/',
  SEARCH: '/search/',
  USER_SEARCH: '/users/search/',
  HEALTH: '/health/',
  API_INFO: '/info/',
  STATS: '/stats/',
} as const;

export const ROUTES = {
  HOME: 'home',
  PRODUCT_DETAIL: 'product-detail',
  ADD_PRODUCT: 'add-product',
  PROFILE: 'profile',
  LOGIN: 'login',
} as const;

export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const USER_ACTIVITY_TYPES = {
  PRODUCT_SUBMIT: 'product_submit',
  PRODUCT_UPVOTE: 'product_upvote',
  PRODUCT_COMMENT: 'product_comment',
  PROFILE_UPDATE: 'profile_update',
  LOGIN: 'login',
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_PRODUCT_TITLE_LENGTH: 3,
  MAX_PRODUCT_TITLE_LENGTH: 200,
  MIN_PRODUCT_DESCRIPTION_LENGTH: 50,
  MAX_PRODUCT_DESCRIPTION_LENGTH: 2000,
  MIN_SEARCH_QUERY_LENGTH: 2,
  MAX_SEARCH_QUERY_LENGTH: 100,
} as const;

export const SOCIAL_LINKS = {
  TWITTER: 'twitter',
  GITHUB: 'github',
  LINKEDIN: 'linkedin',
  WEBSITE: 'website',
} as const;

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Product created successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  USER_REGISTERED: 'Account created successfully!',
  USER_LOGGED_IN: 'Welcome back!',
  USER_LOGGED_OUT: 'You have been logged out.',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
} as const;

export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const QUERY_KEYS = {
  PRODUCTS: 'products',
  PRODUCT_DETAIL: 'product-detail',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  USER_PROFILE: 'user-profile',
  USER_PRODUCTS: 'user-products',
  SEARCH: 'search',
  TRENDING: 'trending',
  FEATURED: 'featured',
} as const;
