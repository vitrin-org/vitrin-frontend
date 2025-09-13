import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronUp, MessageCircle, ExternalLink, Search, Filter, TrendingUp, Plus } from 'lucide-react';
import { productService } from '../services/api';

interface HomeFeedProps {
  onNavigate: (screen: 'home' | 'product-detail' | 'add-product' | 'profile' | 'login') => void;
}

interface Product {
  id: number;
  title: string;
  short_description: string;
  category: { name: string };
  upvote_count: number;
  view_count: number;
  created_at: string;
  author: { username: string };
  images: Array<{
    id: number;
    image: string;
    alt_text: string;
    is_primary: boolean;
    position: number;
  }>;
  primary_image: {
    id: number;
    image: string;
    alt_text: string;
    is_primary: boolean;
    position: number;
  } | null;
  isNew?: boolean;
  featured?: boolean;
}

interface Category {
  name: string;
  count: number;
}

export function HomeFeed({ onNavigate }: HomeFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products and categories
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);
      
      setProducts(productsResponse.results || []);
      
      // Create categories with real counts
      const categoryCounts: { [key: string]: number } = {};
      productsResponse.results?.forEach((product: Product) => {
        categoryCounts[product.category.name] = (categoryCounts[product.category.name] || 0) + 1;
      });
      
      const allCount = productsResponse.results?.length || 0;
      const categoriesWithCounts = [
        { name: 'All', count: allCount },
        ...categoriesResponse.results.map((cat: any) => ({
          name: cat.name,
          count: categoryCounts[cat.name] || 0
        }))
      ];
      
      setCategories(categoriesWithCounts);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load products. Please try again.');
      // Set empty data on error
      setProducts([]);
      setCategories([
        { name: 'All', count: 0 },
        { name: 'AI Tools', count: 0 },
        { name: 'SaaS', count: 0 },
        { name: 'Mobile Apps', count: 0 },
        { name: 'Design Tools', count: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp className="w-6 h-6 text-primary mr-2" />
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {products.length > 0 ? 'Trending Today' : 'Welcome to Vitrin'}
          </Badge>
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
          {products.length > 0 ? 'Discover Amazing Products' : 'Start Your Product Journey'}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {products.length > 0 
            ? 'Find the best new products, apps, and tools launched today by the startup community'
            : 'Be the first to discover and share amazing products with the community'
          }
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            className="pl-10 h-12"
          />
        </div>
        <Button variant="outline" size="lg" className="sm:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category.name}
            variant={selectedCategory === category.name ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.name)}
            className="rounded-full"
          >
            {category.name}
            <Badge variant="secondary" className="ml-2 text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Featured Product */}
      {!error && products.length > 0 && selectedCategory === 'All' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">🔥 Featured Today</h2>
          <Card className="overflow-hidden gradient-border hover-lift cursor-pointer" onClick={() => onNavigate('product-detail')}>
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2">
                  <ImageWithFallback
                    src={products[0].image}
                    alt={products[0].title}
                    className="w-full h-64 lg:h-80 object-cover"
                  />
                </div>
                <div className="p-8 lg:w-1/2 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {products[0].category.name}
                  </Badge>
                    {products[0].isNew && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        New
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{products[0].title}</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    {products[0].short_description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="rounded-full px-4">
                          <ChevronUp className="w-4 h-4 mr-1" />
                          {products[0].upvote_count}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageCircle className="w-4 h-4" />
                        <span>{products[0].view_count}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!error && products.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share an amazing product with the community!
            </p>
            <Button onClick={() => onNavigate('add-product')} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Submit Your First Product
            </Button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!error && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.slice(selectedCategory === 'All' ? 1 : 0).map((product) => (
          <Card 
            key={product.id} 
            className="overflow-hidden hover-lift cursor-pointer group"
            onClick={() => onNavigate('product-detail')}
          >
            <CardContent className="p-0">
              <div className="relative">
                <ImageWithFallback
                  src={product.primary_image?.image || ''}
                  alt={product.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                    {product.category.name}
                  </Badge>
                  {product.isNew && (
                    <Badge className="bg-green-500 text-white">
                      New
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {product.short_description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-full px-3 py-1 h-8 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <ChevronUp className="w-3 h-3 mr-1" />
                      {product.upvote_count}
                    </Button>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MessageCircle className="w-3 h-3" />
                      <span>{product.view_count}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {!error && products.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="rounded-full px-8">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
}