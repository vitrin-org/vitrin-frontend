import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { productService } from '../services/api';
import { authService } from '../services/auth';
import { 
  ChevronUp, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  ArrowLeft,
  Heart,
  Eye,
  Calendar,
  Globe,
  Twitter,
  Github,
  Linkedin
} from 'lucide-react';

interface ProductDetailProps {
  onNavigate: (screen: 'home' | 'product-detail' | 'add-product' | 'profile' | 'login') => void;
}

export function ProductDetail({ onNavigate }: ProductDetailProps) {
  const [product, setProduct] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // For demo purposes, we'll use a hardcoded product ID
  // In a real app, this would come from URL params or navigation state
  const productId = 9; // The published product we created earlier

  useEffect(() => {
    fetchProductData();
  }, []);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      const productResponse = await productService.getProduct(productId);
      setProduct(productResponse);
      setComments(productResponse.comments || []);
      setIsUpvoted(productResponse.is_upvoted || false);
    } catch (error) {
      console.error('Error fetching product data:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!authService.isAuthenticated()) {
      onNavigate('login');
      return;
    }

    try {
      await productService.upvoteProduct(productId);
      setIsUpvoted(!isUpvoted);
      setProduct(prev => ({
        ...prev,
        upvote_count: isUpvoted ? prev.upvote_count - 1 : prev.upvote_count + 1
      }));
    } catch (error) {
      console.error('Error upvoting product:', error);
      alert('Failed to upvote product');
    }
  };

  const handleComment = async () => {
    if (!authService.isAuthenticated()) {
      onNavigate('login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const commentData = await productService.commentProduct(productId, {
        content: newComment
      });
      setComments(prev => [...prev, commentData]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
          <Button onClick={() => onNavigate('home')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Back Button */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Header */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{product.category?.name || product.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold leading-tight">{product.title}</h1>
                  <p className="text-xl text-muted-foreground">{product.short_description}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={isUpvoted ? "default" : "outline"}
                    onClick={handleUpvote}
                    className="gap-2"
                  >
                    <ChevronUp className="w-4 h-4" />
                    {product.upvote_count || 0}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Product Image */}
              {product.image && (
                <div className="rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-4">
                {product.website_url && (
                  <Button asChild>
                    <a href={product.website_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </a>
                  </Button>
                )}
                {product.demo_url && (
                  <Button variant="outline" asChild>
                    <a href={product.demo_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      View Demo
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment */}
                {authService.isAuthenticated() ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Share your thoughts about this product..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleComment} disabled={!newComment.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Sign in to leave a comment</p>
                    <Button onClick={() => onNavigate('login')}>
                      Sign In
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={comment.author?.avatar || ''} />
                          <AvatarFallback>
                            {comment.author?.first_name?.[0] || comment.author?.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {comment.author?.first_name || comment.author?.username}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Maker Info */}
            <Card>
              <CardHeader>
                <CardTitle>Made by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={product.author?.avatar || ''} />
                    <AvatarFallback>
                      {product.author?.first_name?.[0] || product.author?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {product.author?.first_name || product.author?.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{product.author?.username}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => onNavigate('profile')}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Product Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Product Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    <span>Upvotes</span>
                  </div>
                  <span className="font-semibold">{product.upvote_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <span>Comments</span>
                  </div>
                  <span className="font-semibold">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span>Views</span>
                  </div>
                  <span className="font-semibold">{product.view_count || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: any) => (
                      <Badge key={tag.id || tag} variant="secondary">
                        {tag.name || tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}