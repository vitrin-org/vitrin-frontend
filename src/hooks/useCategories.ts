import { useState, useEffect } from 'react';
import { productService } from '../services/api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await productService.getCategories();
        setCategories(response.results || response);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
        
        // Fallback to hardcoded categories if API fails
        setCategories([
          { id: 1, name: 'AI Tools', slug: 'ai-tools', description: 'Artificial Intelligence and Machine Learning tools' },
          { id: 2, name: 'SaaS', slug: 'saas', description: 'Software as a Service applications' },
          { id: 3, name: 'Mobile Apps', slug: 'mobile-apps', description: 'Mobile applications for iOS and Android' },
          { id: 4, name: 'Design Tools', slug: 'design-tools', description: 'Design and creative tools' },
          { id: 5, name: 'Productivity', slug: 'productivity', description: 'Productivity and workflow tools' },
          { id: 6, name: 'Developer Tools', slug: 'developer-tools', description: 'Tools for developers and programmers' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}
