import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { userService } from '../services/api';
import { authService } from '../services/auth';
import { 
  ArrowLeft, 
  ChevronUp, 
  MessageCircle, 
  Eye,
  ExternalLink,
  Edit,
  Share2,
  BarChart3,
  Calendar,
  Globe,
  Twitter,
  Github,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  Plus
} from 'lucide-react';

interface UserProfileProps {
  onNavigate: (screen: 'home' | 'product-detail' | 'add-product' | 'profile' | 'login') => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('products');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = authService.getUser();
      if (!currentUser) {
        setError('User not found');
        return;
      }

      // Fetch user profile and products in parallel
      const [profileResponse, productsResponse] = await Promise.all([
        userService.getOwnProfile(),
        userService.getUserProducts(currentUser.username)
      ]);

      setUserProfile(profileResponse);
      setUserProducts(productsResponse.data?.results || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Profile not found'}</p>
          <Button onClick={() => onNavigate('home')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
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

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 md:h-64 rounded-b-xl overflow-hidden bg-gradient-to-r from-primary/20 to-orange-500/20">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="relative px-4 pb-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20">
              {/* Avatar */}
              <Avatar className="w-32 h-32 border-4 border-background">
                <AvatarImage src={userProfile.avatar || ''} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {userProfile.user?.first_name?.[0] || userProfile.user?.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 md:ml-6 md:mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {userProfile.full_name || userProfile.user?.first_name || userProfile.user?.username}
                    </h1>
                    <p className="text-muted-foreground">@{userProfile.user?.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>

                <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">
                  {userProfile.bio || 'No bio available'}
                </p>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  {userProfile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {userProfile.location}
                    </div>
                  )}
                  {userProfile.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span className="text-primary cursor-pointer hover:underline">
                        {userProfile.website}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(userProfile.user?.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userProducts.length}</div>
                    <div className="text-sm text-muted-foreground">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userProfile.total_upvotes_received || 0}</div>
                    <div className="text-sm text-muted-foreground">Upvotes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userProfile.products_submitted || 0}</div>
                    <div className="text-sm text-muted-foreground">Submitted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userProfile.total_upvotes_given || 0}</div>
                    <div className="text-sm text-muted-foreground">Given</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mt-8 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="products" className="gap-2">
                Products ({userProducts.length})
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-2">
                About
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Products</h2>
                <Button onClick={() => onNavigate('add-product')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              </div>

              {userProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                  <p className="text-muted-foreground mb-4">Start building your portfolio by submitting your first product.</p>
                  <Button onClick={() => onNavigate('add-product')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Product
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover-lift cursor-pointer group">
                      <CardContent className="p-0">
                        <div className="relative">
                          <ImageWithFallback
                            src={product.image || ''}
                            alt={product.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onClick={() => onNavigate('product-detail')}
                          />
                          <Badge className={`absolute top-3 right-3 ${getStatusColor(product.status)}`}>
                            {product.status}
                          </Badge>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg line-clamp-1">
                              {product.title}
                            </h3>
                          </div>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {product.short_description}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary">{product.category?.name || product.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(product.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <ChevronUp className="w-3 h-3" />
                                {product.upvote_count || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {product.comment_count || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {product.view_count || 0}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <BarChart3 className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{userProfile.user?.email || 'Not provided'}</span>
                    </div>
                    {userProfile.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-primary cursor-pointer hover:underline">
                          {userProfile.website}
                        </span>
                      </div>
                    )}
                    {userProfile.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{userProfile.location}</span>
                      </div>
                    )}
                    {userProfile.company && (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 text-muted-foreground">🏢</div>
                        <span>{userProfile.company}</span>
                      </div>
                    )}
                    {userProfile.job_title && (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 text-muted-foreground">💼</div>
                        <span>{userProfile.job_title}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userProfile.twitter && (
                      <Button variant="outline" className="w-full justify-start gap-3" asChild>
                        <a href={userProfile.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="w-4 h-4 text-blue-500" />
                          Twitter Profile
                        </a>
                      </Button>
                    )}
                    {userProfile.github && (
                      <Button variant="outline" className="w-full justify-start gap-3" asChild>
                        <a href={userProfile.github} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4" />
                          GitHub Profile
                        </a>
                      </Button>
                    )}
                    {userProfile.linkedin && (
                      <Button variant="outline" className="w-full justify-start gap-3" asChild>
                        <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4 text-blue-600" />
                          LinkedIn Profile
                        </a>
                      </Button>
                    )}
                    {!userProfile.twitter && !userProfile.github && !userProfile.linkedin && (
                      <p className="text-muted-foreground text-sm">No social links provided</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Stats Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{userProfile.total_upvotes_received || 0}</div>
                        <div className="text-sm text-muted-foreground">Upvotes Received</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{userProfile.total_upvotes_given || 0}</div>
                        <div className="text-sm text-muted-foreground">Upvotes Given</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{userProfile.products_submitted || 0}</div>
                        <div className="text-sm text-muted-foreground">Products Submitted</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{userProducts.length}</div>
                        <div className="text-sm text-muted-foreground">Total Products</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Launched', item: 'TechFlow Analytics', time: '2 days ago', type: 'launch' },
                      { action: 'Received upvote on', item: 'MobileUI Kit Pro', time: '3 days ago', type: 'upvote' },
                      { action: 'Commented on', item: 'Dashboard Builder', time: '1 week ago', type: 'comment' },
                      { action: 'Updated', item: 'Profile information', time: '2 weeks ago', type: 'update' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.type === 'launch' && <ExternalLink className="w-4 h-4 text-primary" />}
                          {activity.type === 'upvote' && <ChevronUp className="w-4 h-4 text-primary" />}
                          {activity.type === 'comment' && <MessageCircle className="w-4 h-4 text-primary" />}
                          {activity.type === 'update' && <Edit className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.action}</span>{' '}
                            <span className="text-primary">{activity.item}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}