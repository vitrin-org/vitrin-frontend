import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
import { userService } from '../../services/api';
import { authService } from '../../services/auth';

// Mock the services
jest.mock('../../services/api');
jest.mock('../../services/auth');

const mockUserService = userService as jest.Mocked<typeof userService>;
const mockAuthService = authService as jest.Mocked<typeof authService>;

const mockNavigate = jest.fn();

describe('UserProfile Component', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    date_joined: '2024-01-01T00:00:00Z'
  };

  const mockUserProfile = {
    id: 1,
    user: mockUser,
    bio: 'Test bio',
    avatar: '',
    website: 'https://example.com',
    location: 'San Francisco, CA',
    company: 'Test Company',
    job_title: 'Developer',
    twitter: 'https://twitter.com/testuser',
    github: 'https://github.com/testuser',
    linkedin: 'https://linkedin.com/in/testuser',
    products_submitted: 5,
    total_upvotes_given: 10,
    total_upvotes_received: 25,
    full_name: 'Test User'
  };

  const mockUserProducts = [
    {
      id: 1,
      title: 'Test Product 1',
      short_description: 'A test product',
      status: 'published',
      upvote_count: 10,
      comment_count: 5,
      view_count: 100,
      created_at: '2024-01-01T00:00:00Z',
      category: { name: 'SaaS' }
    },
    {
      id: 2,
      title: 'Test Product 2',
      short_description: 'Another test product',
      status: 'draft',
      upvote_count: 5,
      comment_count: 2,
      view_count: 50,
      created_at: '2024-01-02T00:00:00Z',
      category: { name: 'AI Tools' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.getUser.mockReturnValue(mockUser);
  });

  it('renders loading state initially', () => {
    mockUserService.getOwnProfile.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    mockUserService.getUserProducts.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<UserProfile onNavigate={mockNavigate} />);
    
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('renders user profile data correctly', async () => {
    mockUserService.getOwnProfile.mockResolvedValue(mockUserProfile);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: mockUserProducts }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('Test bio')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });
  });

  it('displays user stats correctly', async () => {
    mockUserService.getOwnProfile.mockResolvedValue(mockUserProfile);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: mockUserProducts }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Products count
      expect(screen.getByText('25')).toBeInTheDocument(); // Upvotes received
      expect(screen.getByText('5')).toBeInTheDocument(); // Products submitted
      expect(screen.getByText('10')).toBeInTheDocument(); // Upvotes given
    });
  });

  it('displays user products correctly', async () => {
    mockUserService.getOwnProfile.mockResolvedValue(mockUserProfile);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: mockUserProducts }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('A test product')).toBeInTheDocument();
      expect(screen.getByText('Another test product')).toBeInTheDocument();
    });
  });

  it('shows correct product status badges', async () => {
    mockUserService.getOwnProfile.mockResolvedValue(mockUserProfile);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: mockUserProducts }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('published')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });
  });

  it('displays empty state when no products', async () => {
    mockUserService.getOwnProfile.mockResolvedValue(mockUserProfile);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: [] }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('No products yet')).toBeInTheDocument();
      expect(screen.getByText('Start building your portfolio by submitting your first product.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit your first product/i })).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    mockUserService.getOwnProfile.mockRejectedValue(new Error('Failed to fetch'));
    mockUserService.getUserProducts.mockRejectedValue(new Error('Failed to fetch'));

    render(<UserProfile onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load profile data')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
    });
  });

  it('handles user not found error', async () => {
    mockAuthService.getUser.mockReturnValue(null);

    render(<UserProfile onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('displays contact information correctly', async () => {
    mockUserService.getOwnProfile.mockResolvedValue(mockUserProfile);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: mockUserProducts }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    // Switch to About tab
    await waitFor(() => {
      const aboutTab = screen.getByRole('tab', { name: /about/i });
      aboutTab.click();
    });
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('Test Company')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });
  });

  it('displays social links correctly', async () => {
    mockUserService.getOwnProfile.mockResolvedValue(mockUserProfile);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: mockUserProducts }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    // Switch to About tab
    await waitFor(() => {
      const aboutTab = screen.getByRole('tab', { name: /about/i });
      aboutTab.click();
    });
    
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /twitter profile/i })).toHaveAttribute('href', 'https://twitter.com/testuser');
      expect(screen.getByRole('link', { name: /github profile/i })).toHaveAttribute('href', 'https://github.com/testuser');
      expect(screen.getByRole('link', { name: /linkedin profile/i })).toHaveAttribute('href', 'https://linkedin.com/in/testuser');
    });
  });

  it('shows no social links message when none provided', async () => {
    const profileWithoutSocial = {
      ...mockUserProfile,
      twitter: '',
      github: '',
      linkedin: ''
    };

    mockUserService.getOwnProfile.mockResolvedValue(profileWithoutSocial);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: mockUserProducts }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    // Switch to About tab
    await waitFor(() => {
      const aboutTab = screen.getByRole('tab', { name: /about/i });
      aboutTab.click();
    });
    
    await waitFor(() => {
      expect(screen.getByText('No social links provided')).toBeInTheDocument();
    });
  });

  it('displays stats overview correctly', async () => {
    mockUserService.getOwnProfile.mockResolvedValue(mockUserProfile);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: mockUserProducts }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    // Switch to About tab
    await waitFor(() => {
      const aboutTab = screen.getByRole('tab', { name: /about/i });
      aboutTab.click();
    });
    
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // Upvotes Received
      expect(screen.getByText('10')).toBeInTheDocument(); // Upvotes Given
      expect(screen.getByText('5')).toBeInTheDocument(); // Products Submitted
      expect(screen.getByText('2')).toBeInTheDocument(); // Total Products
    });
  });

  it('navigates to add product when clicking submit button', async () => {
    mockUserService.getOwnProfile.mockResolvedValue(mockUserProfile);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: [] }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit your first product/i });
      submitButton.click();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('add-product');
  });

  it('navigates back to home when clicking back button', async () => {
    mockUserService.getOwnProfile.mockResolvedValue(mockUserProfile);
    mockUserService.getUserProducts.mockResolvedValue({
      data: { results: mockUserProducts }
    });

    render(<UserProfile onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back to home/i });
      backButton.click();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('home');
  });
});
