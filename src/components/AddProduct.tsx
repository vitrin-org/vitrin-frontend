import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { productService } from '../services/api';
import { authService } from '../services/auth';
import { useCategories } from '../hooks/useCategories';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Calendar,
  Tag
} from 'lucide-react';

interface AddProductProps {
  onNavigate: (screen: 'home' | 'product-detail' | 'add-product' | 'profile' | 'login') => void;
  isLoggedIn?: boolean;
}

export function AddProduct({ onNavigate, isLoggedIn = false }: AddProductProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const [formData, setFormData] = useState({
    productName: '',
    tagline: '',
    description: '',
    category: '',
    website: '',
    launchDate: '',
    twitter: '',
    github: '',
    linkedin: ''
  });

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not supported. Please use JPG, PNG, or GIF files.`);
        return;
      }

      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Please use files smaller than 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    // Reset the input
    event.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(uploadedImages.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!authService.isAuthenticated()) {
      onNavigate('login');
      return;
    }

    // Basic validation
    if (!formData.productName || !formData.tagline || !formData.description || !formData.category || !formData.website) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare product data
      const productPayload = new FormData();
      productPayload.append('title', formData.productName);
      productPayload.append('short_description', formData.tagline);
      productPayload.append('description', formData.description);
      productPayload.append('category', formData.category);
      productPayload.append('website_url', formData.website);
      productPayload.append('status', isDraft ? 'draft' : 'published');
      
      // Add tags
      tags.forEach(tag => {
        productPayload.append('tags', tag);
      });
      
      // Add images if uploaded
      if (uploadedImages.length > 0) {
        uploadedImages.forEach((imageData, index) => {
          // Convert base64 to blob and append to FormData
          const base64Data = imageData.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });
          productPayload.append('images', blob, `product-image-${index}.jpg`);
        });
      }
      
      console.log('Sending product data:', productPayload);
      
      // Submit to API using the product service
      const productData = await productService.createProduct(productPayload);

      console.log('Product submitted successfully:', productData);
      
      // Show success message
      alert(isDraft ? 'Product saved as draft!' : 'Product submitted successfully!');
      
      // Navigate back to home
      onNavigate('home');
    } catch (error) {
      console.error('Error submitting product:', error);
      
      // Try to get more detailed error information
      let errorMessage = 'Please try again';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // If it's an axios error, try to get the response data
        if ((error as any).response) {
          const responseError = (error as any).response;
          console.error('Response error:', responseError.data);
          if (responseError.data) {
            errorMessage = JSON.stringify(responseError.data);
          }
        }
      }
      
      alert('Failed to submit product: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Submit Your Product</h1>
          <p className="text-muted-foreground text-lg">
            Share your amazing product with the community and get valuable feedback
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="Enter your product name..."
                    className="h-12"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline *</Label>
                  <Input
                    id="tagline"
                    placeholder="Describe your product in one line..."
                    className="h-12"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Keep it short and compelling (max 80 characters)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us more about your product, its features, and what makes it special..."
                    className="min-h-[150px] resize-none"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum 200 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL *</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="website"
                        placeholder="https://yourproduct.com"
                        className="pl-10 h-12"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Main Image Upload */}
                <div className="space-y-4">
                  <Label>Product Images *</Label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif"
                      multiple
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Click to upload images</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, GIF up to 10MB each. You can upload multiple images.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Images Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <ImageWithFallback
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <div className="relative">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif"
                          multiple
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button
                          variant="outline"
                          className="h-24 border-dashed flex flex-col items-center justify-center gap-2 w-full"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-xs">Add More</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="tags"
                        placeholder="Add tags (press Enter)"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="pl-10"
                      />
                    </div>
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-2">
                          {tag}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Add relevant tags to help users discover your product
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="launchDate">Launch Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="launchDate"
                      type="date"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <Label>Social Links</Label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="https://twitter.com/yourproduct"
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="https://github.com/yourproduct"
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="https://linkedin.com/company/yourproduct"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">Product Image</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Your Product Name</h3>
                    <p className="text-sm text-muted-foreground">Your tagline will appear here</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button size="sm" variant="outline" className="rounded-full">
                      <span className="text-xs">👍 0</span>
                    </Button>
                    <Badge variant="secondary">Category</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>• Use high-quality screenshots</p>
                  <p>• Write a compelling tagline</p>
                  <p>• Add relevant tags</p>
                  <p>• Include social links</p>
                  <p>• Respond to comments quickly</p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full rounded-full"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Product'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save as Draft'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}