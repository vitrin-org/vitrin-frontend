/**
 * Validation utilities for forms and data
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    errors: isValid ? [] : ['Please enter a valid email address']
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateProductTitle = (title: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!title.trim()) {
    errors.push('Product title is required');
  }
  
  if (title.length < 3) {
    errors.push('Product title must be at least 3 characters long');
  }
  
  if (title.length > 200) {
    errors.push('Product title must be less than 200 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateProductDescription = (description: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!description.trim()) {
    errors.push('Product description is required');
  }
  
  if (description.length < 50) {
    errors.push('Product description must be at least 50 characters long');
  }
  
  if (description.length > 2000) {
    errors.push('Product description must be less than 2000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUrl = (url: string): ValidationResult => {
  try {
    new URL(url);
    return { isValid: true, errors: [] };
  } catch {
    return { isValid: false, errors: ['Please enter a valid URL'] };
  }
};

export const validateFile = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
} = {}): ValidationResult => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;
  const errors: string[] = [];
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${formatFileSize(maxSize)}`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not supported`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateForm = (data: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): ValidationResult => {
  const errors: string[] = [];
  
  for (const [field, value] of Object.entries(data)) {
    if (rules[field]) {
      const result = rules[field](value);
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateSearchQuery = (query: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!query.trim()) {
    errors.push('Search query is required');
  }
  
  if (query.length < 2) {
    errors.push('Search query must be at least 2 characters long');
  }
  
  if (query.length > 100) {
    errors.push('Search query must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
