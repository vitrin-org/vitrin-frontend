import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddProduct } from '../AddProduct';
import { productService } from '../../services/api';
import { authService } from '../../services/auth';

// Mock the services
jest.mock('../../services/api');
jest.mock('../../services/auth');

const mockProductService = productService as jest.Mocked<typeof productService>;
const mockAuthService = authService as jest.Mocked<typeof authService>;

const mockNavigate = jest.fn();

describe('AddProduct Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.isAuthenticated.mockReturnValue(true);
  });

  it('renders the form correctly', () => {
    render(<AddProduct onNavigate={mockNavigate} isLoggedIn={true} />);
    
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tagline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit product/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated and tries to submit', async () => {
    const user = userEvent.setup();
    mockAuthService.isAuthenticated.mockReturnValue(false);
    
    render(<AddProduct onNavigate={mockNavigate} isLoggedIn={false} />);
    
    // Try to submit the form
    const submitButton = screen.getByRole('button', { name: /submit product/i });
    await user.click(submitButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('login');
  });

  it('handles form input changes', async () => {
    const user = userEvent.setup();
    render(<AddProduct onNavigate={mockNavigate} isLoggedIn={true} />);
    
    const productNameInput = screen.getByLabelText(/product name/i);
    const taglineInput = screen.getByLabelText(/tagline/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    await user.type(productNameInput, 'Test Product');
    await user.type(taglineInput, 'A test product');
    await user.type(descriptionInput, 'This is a test product description');
    
    expect(productNameInput).toHaveValue('Test Product');
    expect(taglineInput).toHaveValue('A test product');
    expect(descriptionInput).toHaveValue('This is a test product description');
  });

  it('adds and removes tags correctly', async () => {
    const user = userEvent.setup();
    render(<AddProduct onNavigate={mockNavigate} isLoggedIn={true} />);
    
    const tagInput = screen.getByPlaceholderText(/add tags \(press enter\)/i);
    const addTagButton = screen.getByRole('button', { name: /add/i });
    
    // Add a tag
    await user.type(tagInput, 'test-tag');
    await user.click(addTagButton);
    
    expect(screen.getByText('test-tag')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
    
    // Remove the tag by clicking the X icon (it's clickable but has no accessible name)
    const tagElement = screen.getByText('test-tag').closest('[data-testid]') || screen.getByText('test-tag').parentElement;
    const removeIcon = tagElement?.querySelector('svg[class*="cursor-pointer"]') as HTMLElement;
    if (removeIcon) {
      await user.click(removeIcon);
    }
    
    expect(screen.queryByText('test-tag')).not.toBeInTheDocument();
  });

  it('prevents adding duplicate tags', async () => {
    const user = userEvent.setup();
    render(<AddProduct onNavigate={mockNavigate} isLoggedIn={true} />);
    
    const tagInput = screen.getByPlaceholderText(/add tags \(press enter\)/i);
    const addTagButton = screen.getByRole('button', { name: /add/i });
    
    // Add a tag
    await user.type(tagInput, 'test-tag');
    await user.click(addTagButton);
    
    // Try to add the same tag again
    await user.type(tagInput, 'test-tag');
    await user.click(addTagButton);
    
    // Should only have one instance of the tag
    const tagElements = screen.getAllByText('test-tag');
    expect(tagElements).toHaveLength(1);
  });

  it('shows validation error when required fields are missing', async () => {
    const user = userEvent.setup();
    render(<AddProduct onNavigate={mockNavigate} isLoggedIn={true} />);
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /submit product/i });
    await user.click(submitButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  it('has save as draft button', () => {
    render(<AddProduct onNavigate={mockNavigate} isLoggedIn={true} />);
    
    // Just check that the draft button exists
    expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument();
  });

  it('navigates back to home when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddProduct onNavigate={mockNavigate} isLoggedIn={true} />);
    
    const backButton = screen.getByRole('button', { name: /back to home/i });
    await user.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('home');
  });
});
