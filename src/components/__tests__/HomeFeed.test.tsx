import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomeFeed } from '../HomeFeed';
import { productService } from '../../services/api';

// Mock the services
jest.mock('../../services/api');

const mockProductService = productService as jest.Mocked<typeof productService>;

const mockNavigate = jest.fn();

const mockProducts = [
  {
    id: 1,
    title: 'Test Product 1',
    short_description: 'A test product',
    category: { name: 'SaaS' },
    upvote_count: 10,
    view_count: 100,
    created_at: '2024-01-01T00:00:00Z',
    author: { username: 'testuser' },
    image: 'https://example.com/image1.jpg',
    isNew: true,
    featured: true
  },
  {
    id: 2,
    title: 'Test Product 2',
    short_description: 'Another test product',
    category: { name: 'AI Tools' },
    upvote_count: 5,
    view_count: 50,
    created_at: '2024-01-02T00:00:00Z',
    author: { username: 'testuser2' },
    image: 'https://example.com/image2.jpg',
    isNew: false,
    featured: false
  }
];

const mockCategories = [
  { id: 1, name: 'SaaS', description: 'Software as a Service' },
  { id: 2, name: 'AI Tools', description: 'Artificial Intelligence tools' }
];

describe('HomeFeed Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockProductService.getProducts.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    mockProductService.getCategories.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('renders products correctly after loading', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });
  });

  it('displays categories with correct counts', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Total count
      expect(screen.getAllByText('SaaS')).toHaveLength(2); // Category button + product badge
      expect(screen.getAllByText('1')).toHaveLength(2); // SaaS count + AI Tools count
      expect(screen.getAllByText('AI Tools')).toHaveLength(2); // Category button + product badge
    });
  });

  it('filters products by category', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    // Click on SaaS category button (not the badge)
    const saasButtons = screen.getAllByText('SaaS');
    const saasCategoryButton = saasButtons.find(button => 
      button.closest('button') && button.closest('button')?.textContent?.includes('SaaS')
    );
    if (saasCategoryButton) {
      fireEvent.click(saasCategoryButton.closest('button')!);
    }

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
    });
  });

  it('shows featured product when products are available', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('🔥 Featured Today')).toBeInTheDocument();
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });
  });

  it('displays product stats correctly', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Upvotes for first product
      expect(screen.getByText('5')).toBeInTheDocument(); // Upvotes for second product
    });
  });

  it('handles error state correctly', async () => {
    mockProductService.getProducts.mockRejectedValue(new Error('API Error'));
    mockProductService.getCategories.mockRejectedValue(new Error('API Error'));

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load products. Please try again.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('retries data fetch when retry button is clicked', async () => {
    mockProductService.getProducts.mockRejectedValueOnce(new Error('API Error'));
    mockProductService.getCategories.mockRejectedValueOnce(new Error('API Error'));

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load products. Please try again.')).toBeInTheDocument();
    });

    // Mock successful response for retry
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });
  });

  it('shows empty state when no products are available', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: [] }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('No products yet')).toBeInTheDocument();
      expect(screen.getByText('Be the first to share an amazing product with the community!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit your first product/i })).toBeInTheDocument();
    });
  });

  it('navigates to add product when submit button is clicked', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: [] }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit your first product/i });
      fireEvent.click(submitButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('add-product');
  });

  it('navigates to product detail when product is clicked', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      const productCard = screen.getByText('Test Product 1').closest('[class*="cursor-pointer"]');
      fireEvent.click(productCard!);
    });

    expect(mockNavigate).toHaveBeenCalledWith('product-detail');
  });

  it('displays search input and filter button', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });
  });

  it('shows load more button when products are available', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /load more products/i })).toBeInTheDocument();
    });
  });

  it('displays correct hero section content', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Discover Amazing Products')).toBeInTheDocument();
      expect(screen.getByText('Find the best new products, apps, and tools launched today by the startup community')).toBeInTheDocument();
    });
  });

  it('displays welcome message when no products', async () => {
    mockProductService.getProducts.mockResolvedValue({
      data: { results: [] }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Start Your Product Journey')).toBeInTheDocument();
      expect(screen.getByText('Be the first to discover and share amazing products with the community')).toBeInTheDocument();
    });
  });

  it('handles search input changes', async () => {
    const user = userEvent.setup();
    mockProductService.getProducts.mockResolvedValue({
      data: { results: mockProducts }
    });
    mockProductService.getCategories.mockResolvedValue({
      data: mockCategories
    });

    render(<HomeFeed onNavigate={mockNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search products...');
    await user.type(searchInput, 'test search');

    // Note: The current implementation doesn't handle search, but we can test the input
    expect(screen.getByDisplayValue('test search')).toBeInTheDocument();
  });
});
