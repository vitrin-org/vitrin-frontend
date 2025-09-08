import { authService } from '../auth';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Reset the singleton instance
    (authService as any).tokens = null;
    (authService as any).user = null;
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponseData = {
        message: 'Login successful',
        tokens: {
          access: 'access_token',
          refresh: 'refresh_token'
        },
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User'
        }
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData)
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await authService.login('testuser', 'password');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/users/auth/login/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'testuser', password: 'password' }),
        }
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'access_token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'refresh_token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponseData.user));
      expect(result).toEqual(mockResponseData);
    });

    it('should throw error on login failure', async () => {
      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ detail: 'Invalid credentials' })
      };

      mockFetch.mockResolvedValue(mockErrorResponse);

      await expect(authService.login('testuser', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register successfully and store tokens', async () => {
      const mockResponseData = {
        message: 'Registration successful',
        tokens: {
          access: 'access_token',
          refresh: 'refresh_token'
        },
        user: {
          id: 1,
          username: 'newuser',
          email: 'new@example.com',
          first_name: 'New',
          last_name: 'User'
        }
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData)
      };

      mockFetch.mockResolvedValue(mockResponse);

      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User'
      };

      const result = await authService.register(userData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/users/auth/register/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'access_token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'refresh_token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponseData.user));
      expect(result).toEqual(mockResponseData);
    });

    it('should handle registration validation errors', async () => {
      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ 
          detail: 'This field is required., Enter a valid email address.'
        })
      };

      mockFetch.mockResolvedValue(mockErrorResponse);

      await expect(authService.register({})).rejects.toThrow('This field is required., Enter a valid email address.');
    });
  });

  describe('googleLogin', () => {
    it('should login with Google successfully', async () => {
      const mockResponseData = {
        message: 'Google login successful',
        tokens: {
          access: 'access_token',
          refresh: 'refresh_token'
        },
        user: {
          id: 1,
          username: 'googleuser',
          email: 'google@example.com',
          first_name: 'Google',
          last_name: 'User'
        }
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData)
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await authService.googleLogin('google_credential');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/users/auth/google/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential: 'google_credential' }),
        }
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'access_token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'refresh_token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponseData.user));
      expect(result).toEqual(mockResponseData);
    });

    it('should handle Google login error', async () => {
      const mockErrorResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Invalid Google token' })
      };

      mockFetch.mockResolvedValue(mockErrorResponse);

      await expect(authService.googleLogin('invalid_token')).rejects.toThrow('Invalid Google token');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      localStorageMock.getItem.mockReturnValue('refresh_token');

      const mockResponseData = {
        access: 'new_access_token'
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseData)
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await authService.refreshAccessToken();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/users/auth/refresh/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: 'refresh_token' }),
        }
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'new_access_token');
      expect(result).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear all tokens and user data', () => {
      authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorageMock.getItem.mockReturnValue('access_token');

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token');
    });

    it('should return false when no access token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token');
    });
  });

  describe('getAccessToken', () => {
    it('should return access token', () => {
      localStorageMock.getItem.mockReturnValue('access_token');

      const result = authService.getAccessToken();

      expect(result).toBe('access_token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token');
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token', () => {
      localStorageMock.getItem.mockReturnValue('refresh_token');

      const result = authService.getRefreshToken();

      expect(result).toBe('refresh_token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('getUser', () => {
    it('should return user data when available', () => {
      const userData = { id: 1, username: 'testuser' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(userData));

      const result = authService.getUser();

      expect(result).toEqual(userData);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    });

    it('should return null when no user data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.getUser();

      expect(result).toBe(null);
    });

    it('should return null when invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = authService.getUser();

      expect(result).toBe(null);
    });
  });
});