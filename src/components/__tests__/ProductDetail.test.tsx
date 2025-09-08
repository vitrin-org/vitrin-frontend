import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductDetail } from '../ProductDetail';
import { productService } from '../../services/api';
import { authService } from '../../services/auth';

// Mock the services
jest.mock('../../services/api');
jest.mock('../../services/auth');

const mockProductService = productService as jest.Mocked<typeof productService>;
const mockAuthService = authService as jest.Mocked<typeof authService>;

const mockNavigate = jest.fn();

describe('ProductDetail Component', () => {
  const mockProduct = {
    id: 9,
    title: 'Test Product',
    short_description: 'A test product description',
    description: 'This is a detailed test product description with more information.',
    category: { name: 'SaaS' },
    author: {
      id: 1,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      avatar: ''
    },
    image: 'https://example.com/image.jpg',
    website_url: 'https://example.com',
    demo_url: 'https://demo.example.com',
    upvote_count: 25,
    view_count: 150,
    comment_count: 8,
    is_upvoted: false,
    created_at: '2024-01-01T00:00:00Z',
    tags: [
      { id: 1, name: 'analytics' },
      { id: 2, name: 'saas' }
    ],
    comments: [
      {
        id: 1,
        content: 'Great product!',
        author: {
          id: 2,
          username: 'commenter',
          first_name: 'Comment',
          last_name: 'User',
          avatar: ''
        },
        created_at: '2024-01-01T12:00:00Z'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockProductService.getProduct.mockResolvedValue(mockProduct);
  });

  it('renders loading state initially', () => {
    mockProductService.getProduct.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<ProductDetail onNavigate={mockNavigate} />);
    
    expect(screen.getByText('Loading product...')).toBeInTheDocument();
  });

  it('renders product data correctly', async () => {
    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('A test product description')).toBeInTheDocument();
      expect(screen.getByText('This is a detailed test product description with more information.')).toBeInTheDocument();
      expect(screen.getByText('SaaS')).toBeInTheDocument();
    });
  });

  it('displays product stats correctly', async () => {
    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // Upvotes
      expect(screen.getByText('8')).toBeInTheDocument(); // Comments
      expect(screen.getByText('150')).toBeInTheDocument(); // Views
    });
  });

  it('displays maker information correctly', async () => {
    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });
  });

  it('displays product links correctly', async () => {
    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const visitWebsiteLink = screen.getByRole('link', { name: /visit website/i });
      const viewDemoLink = screen.getByRole('link', { name: /view demo/i });
      
      expect(visitWebsiteLink).toHaveAttribute('href', 'https://example.com');
      expect(viewDemoLink).toHaveAttribute('href', 'https://demo.example.com');
    });
  });

  it('displays product tags correctly', async () => {
    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('analytics')).toBeInTheDocument();
      expect(screen.getByText('saas')).toBeInTheDocument();
    });
  });

  it('handles upvote when authenticated', async () => {
    const user = userEvent.setup();
    mockProductService.upvoteProduct.mockResolvedValue({ message: 'Product upvoted successfully' });

    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const upvoteButton = screen.getByRole('button', { name: /25/i });
      user.click(upvoteButton);
    });
    
    await waitFor(() => {
      expect(mockProductService.upvoteProduct).toHaveBeenCalledWith(9);
    });
  });

  it('redirects to login when upvoting without authentication', async () => {
    const user = userEvent.setup();
    mockAuthService.isAuthenticated.mockReturnValue(false);

    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const upvoteButton = screen.getByRole('button', { name: /25/i });
      user.click(upvoteButton);
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('login');
  });

  it('displays comments correctly', async () => {
    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Comments (1)')).toBeInTheDocument();
      expect(screen.getByText('Great product!')).toBeInTheDocument();
      expect(screen.getByText('Comment User')).toBeInTheDocument();
    });
  });

  it('shows empty comments state when no comments', async () => {
    const productWithoutComments = {
      ...mockProduct,
      comments: []
    };
    mockProductService.getProduct.mockResolvedValue(productWithoutComments);

    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Comments (0)')).toBeInTheDocument();
      expect(screen.getByText('No comments yet. Be the first to share your thoughts!')).toBeInTheDocument();
    });
  });

  it('allows authenticated users to post comments', async () => {
    const user = userEvent.setup();
    const newComment = {
      id: 2,
      content: 'New comment',
      author: {
        id: 1,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        avatar: ''
      },
      created_at: '2024-01-01T13:00:00Z'
    };
    mockProductService.commentProduct.mockResolvedValue(newComment);

    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const commentInput = screen.getByPlaceholderText(/share your thoughts/i);
      const postButton = screen.getByRole('button', { name: /post comment/i });
      
      user.type(commentInput, 'New comment');
      user.click(postButton);
    });
    
    await waitFor(() => {
      expect(mockProductService.commentProduct).toHaveBeenCalledWith(9, {
        content: 'New comment'
      });
    });
  });

  it('shows sign in prompt for unauthenticated users', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Sign in to leave a comment')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('handles comment submission error', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockProductService.commentProduct.mockRejectedValue(new Error('Failed to post comment'));

    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const commentInput = screen.getByPlaceholderText(/share your thoughts/i);
      const postButton = screen.getByRole('button', { name: /post comment/i });
      
      user.type(commentInput, 'New comment');
      user.click(postButton);
    });
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to post comment');
    });
    
    alertSpy.mockRestore();
  });

  it('handles upvote error', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockProductService.upvoteProduct.mockRejectedValue(new Error('Failed to upvote'));

    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const upvoteButton = screen.getByRole('button', { name: /25/i });
      user.click(upvoteButton);
    });
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to upvote product');
    });
    
    alertSpy.mockRestore();
  });

  it('handles error state', async () => {
    mockProductService.getProduct.mockRejectedValue(new Error('Product not found'));

    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load product details')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument();
    });
  });

  it('navigates back to home when clicking back button', async () => {
    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back to home/i });
      backButton.click();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('home');
  });

  it('navigates to profile when clicking view profile button', async () => {
    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const profileButton = screen.getByRole('button', { name: /view profile/i });
      profileButton.click();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('profile');
  });

  it('displays product image when available', async () => {
    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const productImage = screen.getByAltText('Test Product');
      expect(productImage).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  it('handles product without image', async () => {
    const productWithoutImage = {
      ...mockProduct,
      image: ''
    };
    mockProductService.getProduct.mockResolvedValue(productWithoutImage);

    render(<ProductDetail onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.queryByAltText('Test Product')).not.toBeInTheDocument();
    });
  });
});
