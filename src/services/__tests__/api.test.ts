import axios from 'axios';
import { apiService, productService, userService, searchService, API_ENDPOINTS } from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:8000/api',
      },
    },
  },
});

// Mock auth service
jest.mock('../auth', () => ({
  authService: {
    getAccessToken: jest.fn(() => 'mock_access_token'),
    refreshAccessToken: jest.fn(() => Promise.resolve(true)),
    logout: jest.fn(),
  },
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('apiService', () => {
    it('should make GET request with correct parameters', async () => {
      const mockResponse = { data: { results: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await apiService.get('/test-endpoint', { page: 1 });

      expect(mockedAxios.get).toHaveBeenCalledWith('/test-endpoint', { params: { page: 1 } });
      expect(result).toEqual(mockResponse.data);
    });

    it('should make POST request with correct data', async () => {
      const mockResponse = { data: { id: 1, title: 'Test' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await apiService.post('/test-endpoint', { title: 'Test' });

      expect(mockedAxios.post).toHaveBeenCalledWith('/test-endpoint', { title: 'Test' });
      expect(result).toEqual(mockResponse.data);
    });

    it('should make PUT request with correct data', async () => {
      const mockResponse = { data: { id: 1, title: 'Updated' } };
      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await apiService.put('/test-endpoint/1', { title: 'Updated' });

      expect(mockedAxios.put).toHaveBeenCalledWith('/test-endpoint/1', { title: 'Updated' });
      expect(result).toEqual(mockResponse.data);
    });

    it('should make PATCH request with correct data', async () => {
      const mockResponse = { data: { id: 1, title: 'Patched' } };
      mockedAxios.patch.mockResolvedValue(mockResponse);

      const result = await apiService.patch('/test-endpoint/1', { title: 'Patched' });

      expect(mockedAxios.patch).toHaveBeenCalledWith('/test-endpoint/1', { title: 'Patched' });
      expect(result).toEqual(mockResponse.data);
    });

    it('should make DELETE request', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await apiService.delete('/test-endpoint/1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/test-endpoint/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('productService', () => {
    it('should get products with correct endpoint', async () => {
      const mockResponse = { data: { results: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await productService.getProducts({ page: 1 });

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCTS, { params: { page: 1 } });
    });

    it('should get product by ID with correct endpoint', async () => {
      const mockResponse = { data: { id: 1, title: 'Test Product' } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await productService.getProduct(1);

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCT_DETAIL(1));
    });

    it('should create product with correct endpoint and data', async () => {
      const mockResponse = { data: { id: 1, title: 'New Product' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const productData = { title: 'New Product', description: 'Test description' };
      await productService.createProduct(productData);

      expect(mockedAxios.post).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCTS, productData);
    });

    it('should update product with correct endpoint and data', async () => {
      const mockResponse = { data: { id: 1, title: 'Updated Product' } };
      mockedAxios.put.mockResolvedValue(mockResponse);

      const productData = { title: 'Updated Product' };
      await productService.updateProduct(1, productData);

      expect(mockedAxios.put).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCT_DETAIL(1), productData);
    });

    it('should delete product with correct endpoint', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      await productService.deleteProduct(1);

      expect(mockedAxios.delete).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCT_DETAIL(1));
    });

    it('should upvote product with correct endpoint', async () => {
      const mockResponse = { data: { message: 'Upvoted' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await productService.upvoteProduct(1);

      expect(mockedAxios.post).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCT_UPVOTE(1));
    });

    it('should comment on product with correct endpoint and data', async () => {
      const mockResponse = { data: { id: 1, content: 'Test comment' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const commentData = { content: 'Test comment' };
      await productService.commentProduct(1, commentData);

      expect(mockedAxios.post).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCT_COMMENT(1), commentData);
    });

    it('should get trending products with correct endpoint', async () => {
      const mockResponse = { data: [] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await productService.getTrending();

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCT_TRENDING);
    });

    it('should get featured products with correct endpoint', async () => {
      const mockResponse = { data: [] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await productService.getFeatured();

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.PRODUCT_FEATURED);
    });

    it('should get categories with correct endpoint', async () => {
      const mockResponse = { data: [] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await productService.getCategories();

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.CATEGORIES);
    });
  });

  describe('userService', () => {
    it('should get user profile with correct endpoint', async () => {
      const mockResponse = { data: { id: 1, username: 'testuser' } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await userService.getProfile('testuser');

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.USER_PROFILE('testuser'));
    });

    it('should get user products with correct endpoint and params', async () => {
      const mockResponse = { data: { results: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await userService.getUserProducts('testuser', { page: 1 });

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.USER_PRODUCTS('testuser'), { params: { page: 1 } });
    });

    it('should get user activities with correct endpoint and params', async () => {
      const mockResponse = { data: { results: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await userService.getUserActivities('testuser', { page: 1 });

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.USER_ACTIVITIES('testuser'), { params: { page: 1 } });
    });

    it('should update profile with correct endpoint and data', async () => {
      const mockResponse = { data: { id: 1, bio: 'Updated bio' } };
      mockedAxios.patch.mockResolvedValue(mockResponse);

      const profileData = { bio: 'Updated bio' };
      await userService.updateProfile(profileData);

      expect(mockedAxios.patch).toHaveBeenCalledWith(API_ENDPOINTS.PROFILE_ME, profileData);
    });

    it('should get own profile with correct endpoint', async () => {
      const mockResponse = { data: { id: 1, username: 'testuser' } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await userService.getOwnProfile();

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.PROFILE_ME);
    });
  });

  describe('searchService', () => {
    it('should perform global search with correct endpoint and query', async () => {
      const mockResponse = { data: { products: [], users: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await searchService.globalSearch('test query');

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.SEARCH, { params: { q: 'test query' } });
    });

    it('should perform user search with correct endpoint and query', async () => {
      const mockResponse = { data: [] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await searchService.userSearch('test user');

      expect(mockedAxios.get).toHaveBeenCalledWith(API_ENDPOINTS.USER_SEARCH, { params: { q: 'test user' } });
    });
  });

  describe('API_ENDPOINTS', () => {
    it('should have correct product endpoints', () => {
      expect(API_ENDPOINTS.PRODUCTS).toBe('/products/products/');
      expect(API_ENDPOINTS.PRODUCT_DETAIL(1)).toBe('/products/products/1/');
      expect(API_ENDPOINTS.PRODUCT_UPVOTE(1)).toBe('/products/products/1/upvote/');
      expect(API_ENDPOINTS.PRODUCT_COMMENT(1)).toBe('/products/products/1/comment/');
      expect(API_ENDPOINTS.PRODUCT_TRENDING).toBe('/products/products/trending/');
      expect(API_ENDPOINTS.PRODUCT_FEATURED).toBe('/products/products/featured/');
    });

    it('should have correct category endpoints', () => {
      expect(API_ENDPOINTS.CATEGORIES).toBe('/products/categories/');
      expect(API_ENDPOINTS.CATEGORY_PRODUCTS('saas')).toBe('/products/categories/saas/products/');
    });

    it('should have correct tag endpoints', () => {
      expect(API_ENDPOINTS.TAGS).toBe('/products/tags/');
      expect(API_ENDPOINTS.TAG_PRODUCTS('analytics')).toBe('/products/tags/analytics/products/');
    });

    it('should have correct user endpoints', () => {
      expect(API_ENDPOINTS.USERS).toBe('/users/users/');
      expect(API_ENDPOINTS.USER_PROFILE('testuser')).toBe('/users/users/testuser/profile/');
      expect(API_ENDPOINTS.USER_PRODUCTS('testuser')).toBe('/users/users/testuser/products/');
      expect(API_ENDPOINTS.USER_ACTIVITIES('testuser')).toBe('/users/users/testuser/activities/');
    });

    it('should have correct authentication endpoints', () => {
      expect(API_ENDPOINTS.REGISTER).toBe('/users/auth/register/');
      expect(API_ENDPOINTS.LOGIN).toBe('/users/auth/login/');
      expect(API_ENDPOINTS.CHANGE_PASSWORD).toBe('/users/auth/change-password/');
    });

    it('should have correct profile endpoints', () => {
      expect(API_ENDPOINTS.PROFILE_ME).toBe('/users/profiles/me/');
      expect(API_ENDPOINTS.FOLLOWS).toBe('/users/follows/');
      expect(API_ENDPOINTS.FOLLOWERS).toBe('/users/follows/followers/');
      expect(API_ENDPOINTS.FOLLOWING).toBe('/users/follows/following/');
    });

    it('should have correct search endpoints', () => {
      expect(API_ENDPOINTS.SEARCH).toBe('/search/');
      expect(API_ENDPOINTS.USER_SEARCH).toBe('/users/search/');
    });

    it('should have correct core endpoints', () => {
      expect(API_ENDPOINTS.HEALTH).toBe('/health/');
      expect(API_ENDPOINTS.API_INFO).toBe('/info/');
      expect(API_ENDPOINTS.STATS).toBe('/stats/');
    });
  });
});
