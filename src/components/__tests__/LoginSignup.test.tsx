import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginSignup } from '../LoginSignup';
import { authService } from '../../services/auth';

// Mock the services
jest.mock('../../services/auth');

const mockAuthService = authService as jest.Mocked<typeof authService>;

const mockNavigate = jest.fn();
const mockOnLogin = jest.fn();

// Mock Google Identity Services
const mockGoogle = {
  accounts: {
    id: {
      initialize: jest.fn(),
      prompt: jest.fn(),
    },
  },
};

// Mock document.createElement to return a mock script element
const mockScript = {
  src: '',
  async: false,
  defer: false,
  onload: null,
  dispatchEvent: jest.fn(),
};

// Mock document methods
const originalCreateElement = document.createElement;
const originalAppendChild = document.body.appendChild;

beforeEach(() => {
  Object.defineProperty(document, 'createElement', {
    value: jest.fn((tagName) => {
      if (tagName === 'script') {
        return mockScript;
      }
      return originalCreateElement.call(document, tagName);
    }),
    writable: true,
  });

  Object.defineProperty(document.body, 'appendChild', {
    value: jest.fn(),
    writable: true,
  });
});

afterEach(() => {
  Object.defineProperty(document, 'createElement', {
    value: originalCreateElement,
    writable: true,
  });

  Object.defineProperty(document.body, 'appendChild', {
    value: originalAppendChild,
    writable: true,
  });
});

describe('LoginSignup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).google = mockGoogle;
  });

  afterEach(() => {
    delete (window as any).google;
  });

  it('renders login form by default', () => {
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to signup form when signup tab is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    const signupTab = screen.getAllByRole('button', { name: /sign up/i })[0];
    await user.click(signupTab);
    
    expect(screen.getByText('Join Vitrin')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('switches back to login form when sign in tab is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    // Switch to signup first
    const signupTab = screen.getAllByRole('button', { name: /sign up/i })[0];
    await user.click(signupTab);
    
    // Switch back to login
    const loginTab = screen.getByRole('button', { name: /sign in/i });
    await user.click(loginTab);
    
    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  it('handles login form submission successfully', async () => {
    const user = userEvent.setup();
    mockAuthService.login.mockResolvedValue({
      message: 'Login successful',
      user: { id: 1, username: 'testuser', email: 'test@example.com' },
      tokens: { access: 'access_token', refresh: 'refresh_token' }
    });

    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /Sign In/i, type: 'submit' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockOnLogin).toHaveBeenCalledWith(true);
      expect(mockNavigate).toHaveBeenCalledWith('home');
    });
  });

  it('handles login form submission with error', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    
    const submitButton = screen.getByRole('button', { name: /Sign In/i, type: 'submit' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Login failed: Invalid credentials');
    });
    
    alertSpy.mockRestore();
  });

  it('handles signup form submission successfully', async () => {
    const user = userEvent.setup();
    mockAuthService.register.mockResolvedValue({
      message: 'Registration successful',
      user: { id: 1, username: 'newuser', email: 'new@example.com' },
      tokens: { access: 'access_token', refresh: 'refresh_token' }
    });

    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    // Switch to signup
    const signupTab = screen.getAllByRole('button', { name: /sign up/i })[0];
    await user.click(signupTab);
    
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'New User');
    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthService.register).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        password_confirm: 'password123',
        first_name: 'New',
        last_name: 'User'
      });
      expect(mockOnLogin).toHaveBeenCalledWith(true);
      expect(mockNavigate).toHaveBeenCalledWith('home');
    });
  });

  it('handles signup form submission with password mismatch', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    // Switch to signup
    const signupTab = screen.getAllByRole('button', { name: /sign up/i })[0];
    await user.click(signupTab);
    
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'New User');
    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword');
    
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Passwords do not match. Please try again.');
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });
    
    alertSpy.mockRestore();
  });

  it('handles signup form submission with error', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockAuthService.register.mockRejectedValue(new Error('Email already exists'));

    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    // Switch to signup
    const signupTab = screen.getAllByRole('button', { name: /sign up/i })[0];
    await user.click(signupTab);
    
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/full name/i), 'Existing User');
    await user.type(screen.getByLabelText(/username/i), 'existinguser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Signup failed: Email already exists');
    });
    
    alertSpy.mockRestore();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles confirm password visibility in signup form', async () => {
    const user = userEvent.setup();
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    // Switch to signup
    const signupTab = screen.getAllByRole('button', { name: /sign up/i })[0];
    await user.click(signupTab);
    
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const toggleButtons = screen.getAllByRole('button', { name: '' }); // Eye icon buttons
    const confirmPasswordToggle = toggleButtons[1]; // Second eye icon button
    
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    await user.click(confirmPasswordToggle);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    
    await user.click(confirmPasswordToggle);
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('handles Google sign-in button click', async () => {
    const user = userEvent.setup();
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    const googleButton = screen.getByRole('button', { name: /continue with google/i });
    await user.click(googleButton);
    
    expect(mockGoogle.accounts.id.prompt).toHaveBeenCalled();
  });

  it('handles Google sign-in when Google services not loaded', async () => {
    const user = userEvent.setup();
    delete (window as any).google;
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    const googleButton = screen.getByRole('button', { name: /continue with google/i });
    await user.click(googleButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Google Sign-In is not loaded. Please refresh the page and try again.');
    
    alertSpy.mockRestore();
  });

  it('handles Google sign-in success', async () => {
    mockAuthService.googleLogin.mockResolvedValue({
      message: 'Google login successful',
      user: { id: 1, username: 'googleuser', email: 'google@example.com' },
      tokens: { access: 'access_token', refresh: 'refresh_token' }
    });

    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    // Simulate script loading by triggering the onload event
    if (mockScript.onload) {
      mockScript.onload();
    }
    
    // Wait for Google initialization
    await waitFor(() => {
      expect(mockGoogle.accounts.id.initialize).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Simulate Google sign-in callback
    const mockResponse = { credential: 'google_credential' };
    
    // Get the callback from the initialize mock
    const initializeCall = mockGoogle.accounts.id.initialize.mock.calls[0];
    if (initializeCall && initializeCall[0] && initializeCall[0].callback) {
      await initializeCall[0].callback(mockResponse);
    }
    
    await waitFor(() => {
      expect(mockAuthService.googleLogin).toHaveBeenCalledWith('google_credential');
      expect(mockOnLogin).toHaveBeenCalledWith(true);
      expect(mockNavigate).toHaveBeenCalledWith('home');
    });
  });

  it('handles Google sign-in error', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockAuthService.googleLogin.mockRejectedValue(new Error('Google authentication failed'));

    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    // Simulate script loading by triggering the onload event
    if (mockScript.onload) {
      mockScript.onload();
    }
    
    // Wait for Google initialization
    await waitFor(() => {
      expect(mockGoogle.accounts.id.initialize).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Simulate Google sign-in callback with error
    const mockResponse = { credential: 'invalid_credential' };
    
    // Get the callback from the initialize mock
    const initializeCall = mockGoogle.accounts.id.initialize.mock.calls[0];
    if (initializeCall && initializeCall[0] && initializeCall[0].callback) {
      await initializeCall[0].callback(mockResponse);
    }
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Google sign-in failed: Google authentication failed');
    });
    
    alertSpy.mockRestore();
  });

  it('shows loading state during form submission', async () => {
    const user = userEvent.setup();
    mockAuthService.login.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /Sign In/i, type: 'submit' });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('navigates back to home when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    const backButton = screen.getByRole('button', { name: /back to home/i });
    await user.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('home');
  });

  it('shows remember me checkbox in login form', () => {
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('shows terms checkbox in signup form', async () => {
    const user = userEvent.setup();
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    // Switch to signup
    const signupTab = screen.getAllByRole('button', { name: /sign up/i })[0];
    await user.click(signupTab);
    
    expect(screen.getByRole('checkbox', { name: /I agree to the/i })).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('shows other social login buttons', () => {
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument();
  });

  it('handles other social login button clicks', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LoginSignup onNavigate={mockNavigate} onLogin={mockOnLogin} />);
    
    const githubButton = screen.getByRole('button', { name: /github/i });
    await user.click(githubButton);
    
    expect(alertSpy).toHaveBeenCalledWith('github sign-in is not yet implemented. Please use email signup/login or Google Sign-In.');
    
    alertSpy.mockRestore();
  });
});
