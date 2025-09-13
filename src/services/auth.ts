// Authentication service for managing JWT tokens
import { config } from '../config/env';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  private static instance: AuthService;
  private tokens: AuthTokens | null = null;
  private user: User | null = null;

  private constructor() {
    this.loadTokensFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Store tokens in localStorage
  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    this.tokens = tokens;
  }

  // Load tokens from localStorage
  private loadTokensFromStorage(): void {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (accessToken && refreshToken) {
      this.tokens = {
        access: accessToken,
        refresh: refreshToken
      };
    }
  }

  // Get current access token
  public getAccessToken(): string | null {
    return this.tokens?.access || null;
  }

  // Get current refresh token
  public getRefreshToken(): string | null {
    return this.tokens?.refresh || null;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.tokens?.access;
  }

  // Set user data
  public setUser(user: User): void {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Get user data
  public getUser(): User | null {
    if (!this.user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (error) {
          console.error('Failed to parse user data from localStorage:', error);
          this.user = null;
        }
      }
    }
    return this.user;
  }

  // Login user
  public async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${config.API_BASE_URL}/users/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.storeTokens(data.tokens);
    this.setUser(data.user);
    return data;
  }

  // Register user
  public async register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${config.API_BASE_URL}/users/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    this.storeTokens(data.tokens);
    this.setUser(data.user);
    return data;
  }

  // Google OAuth login
  public async googleLogin(credential: string): Promise<AuthResponse> {
    const response = await fetch(`${config.API_BASE_URL}/users/auth/google/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google login failed');
    }

    const data: AuthResponse = await response.json();
    this.storeTokens(data.tokens);
    this.setUser(data.user);
    return data;
  }

  // Refresh access token
  public async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/users/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.storeTokens({
        access: data.access,
        refresh: refreshToken
      });
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Logout user
  public logout(): void {
    this.tokens = null;
    this.user = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Get authorization header
  public getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = AuthService.getInstance();
