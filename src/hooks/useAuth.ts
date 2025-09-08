import { useState, useEffect, useCallback } from 'react';
import { authService, User } from '../services/auth';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getUser();
      setIsAuthenticated(authenticated);
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(username, password);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    try {
      setIsLoading(true);
      const response = await authService.googleLogin(credential);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const success = await authService.refreshAccessToken();
      if (!success) {
        logout();
      }
      return success;
    } catch (error) {
      logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    googleLogin,
    logout,
    refreshToken,
  };
};
