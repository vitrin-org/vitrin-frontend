import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/api';

interface Product {
  id: number;
  title: string;
  short_description: string;
  description?: string;
  category: { name: string } | string;
  author: {
    username: string;
    first_name?: string;
    last_name?: string;
  };
  image?: string;
  website_url?: string;
  demo_url?: string;
  upvote_count: number;
  view_count: number;
  comment_count: number;
  is_upvoted: boolean;
  created_at: string;
  tags?: Array<{ name: string }>;
  comments?: Array<any>;
}

interface UseProductsReturn {
  products: Product[];
  categories: Array<{ id: number; name: string; description: string }>;
  loading: boolean;
  error: string | null;
  fetchProducts: (params?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  upvoteProduct: (productId: number) => Promise<void>;
  commentProduct: (productId: number, content: string) => Promise<void>;
  createProduct: (productData: any) => Promise<Product>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; description: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(params);
      setProducts(response.data?.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  }, []);

  const upvoteProduct = useCallback(async (productId: number) => {
    try {
      await productService.upvoteProduct(productId);
      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { 
              ...product, 
              is_upvoted: !product.is_upvoted,
              upvote_count: product.is_upvoted ? product.upvote_count - 1 : product.upvote_count + 1
            }
          : product
      ));
    } catch (err) {
      throw err;
    }
  }, []);

  const commentProduct = useCallback(async (productId: number, content: string) => {
    try {
      const newComment = await productService.commentProduct(productId, { content });
      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { 
              ...product, 
              comments: [...(product.comments || []), newComment],
              comment_count: product.comment_count + 1
            }
          : product
      ));
      return newComment;
    } catch (err) {
      throw err;
    }
  }, []);

  const createProduct = useCallback(async (productData: any): Promise<Product> => {
    try {
      const newProduct = await productService.createProduct(productData);
      // Add to local state
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      throw err;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  return {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    upvoteProduct,
    commentProduct,
    createProduct,
  };
};
