import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Github,
  Twitter,
} from "lucide-react";
import { authService } from "../services/auth";

interface LoginSignupProps {
  onNavigate: (
    screen:
      | "home"
      | "product-detail"
      | "add-product"
      | "profile"
      | "login",
  ) => void;
  onLogin: (isLoggedIn: boolean) => void;
}

export function LoginSignup({
  onNavigate,
  onLogin,
}: LoginSignupProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load Google Identity Services
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).google) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: '1052509270501-8v6bho0mlmb4lq3n26e1i0cd7r5v0q0f.apps.googleusercontent.com', // Demo Google Client ID for testing
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          console.log('Google Identity Services initialized successfully');
        } catch (error) {
          console.error('Failed to initialize Google Identity Services:', error);
        }
      } else {
        console.error('Google Identity Services not loaded');
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleSignIn = async (response: any) => {
    setIsLoading(true);
    try {
      console.log('Google sign-in response received:', response);
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }
      
      const userData = await authService.googleLogin(response.credential);
      console.log('Google sign-in successful:', userData);
      onLogin(true);
      onNavigate("home");
    } catch (error) {
      console.error('Google sign-in error:', error);
      console.error('Error details:', error);
      
      let errorMessage = 'Please try again';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert('Google sign-in failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const fullName = formData.get('fullName') as string;
      const username = formData.get('username') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (isLogin) {
        // Login logic - use email field as username for login
        const loginUsername = email; // The email field contains username for login
        console.log('Login attempt:', { username: loginUsername, password });
        
        try {
          const userData = await authService.login(loginUsername, password);
          console.log('Login successful:', userData);
          onLogin(true);
          onNavigate("home");
        } catch (error) {
          console.error('Login failed:', error);
          alert('Login failed: ' + (error instanceof Error ? error.message : 'Please check your credentials'));
        }
      } else {
        // Signup logic
        console.log('Signup attempt:', { email, password, fullName, username });
        
        // Validate password confirmation
        if (password !== confirmPassword) {
          alert('Passwords do not match. Please try again.');
          setIsLoading(false);
          return;
        }
        
        // Create user in database
        const requestData = {
          username,
          email,
          password,
          password_confirm: password,
          first_name: fullName.split(' ')[0] || '',
          last_name: fullName.split(' ').slice(1).join(' ') || '',
        };
        
        console.log('Sending signup request:', requestData);
        
        try {
          const userData = await authService.register(requestData);
          console.log('User created successfully:', userData);
          onLogin(true);
          onNavigate("home");
        } catch (error) {
          console.error('Signup failed:', error);
          alert('Signup failed: ' + (error instanceof Error ? error.message : 'Please try again'));
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
      // Trigger Google Sign-In
      if ((window as any).google) {
        (window as any).google.accounts.id.prompt();
      } else {
        alert('Google Sign-In is not loaded. Please refresh the page and try again.');
      }
    } else {
      // For other providers, show not implemented message
      alert(`${provider} sign-in is not yet implemented. Please use email signup/login or Google Sign-In.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-orange-500/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate("home")}
          className="gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <Card className="shadow-xl border-0 gradient-border">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">
                  P
                </span>
              </div>
            </div>

            <div>
              <CardTitle className="text-2xl">
                {isLogin ? "Welcome back!" : "Join Vitrin"}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {isLogin
                  ? "Sign in to discover amazing products"
                  : "Create your account to start sharing products"}
              </p>
            </div>

            {/* Tab Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={isLogin ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsLogin(true)}
                className="flex-1 rounded-md"
              >
                Sign In
              </Button>
              <Button
                variant={!isLogin ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsLogin(false)}
                className="flex-1 rounded-md"
              >
                Sign Up
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login */}
            <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-3"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleSocialLogin("github")}
                  disabled={isLoading}
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleSocialLogin("twitter")}
                  disabled={isLoading}
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
              </div>
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-background px-4 text-muted-foreground text-sm">
                  or
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email/Username */}
              <div className="space-y-2">
                <Label htmlFor="email">{isLogin ? "Username" : "Email"}</Label>
                <div className="relative">
                  {isLogin ? (
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  ) : (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  )}
                  <Input
                    id="email"
                    name="email"
                    type={isLogin ? "text" : "email"}
                    placeholder={isLogin ? "Enter your username" : "Enter your email"}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              {/* Full Name (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-12"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Username (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                      @
                    </span>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Choose a username"
                      className="pl-8 h-12"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 h-12"
                      required={!isLogin}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword,
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Remember Me / Terms */}
              {isLogin ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label
                      htmlFor="remember"
                      className="text-sm cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Button
                    variant="link"
                    className="px-0 text-primary"
                  >
                    Forgot password?
                  </Button>
                </div>
              ) : (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    required
                    className="mt-1"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    I agree to the{" "}
                    <Button
                      variant="link"
                      className="px-0 h-auto text-primary"
                    >
                      Terms of Service
                    </Button>{" "}
                    and{" "}
                    <Button
                      variant="link"
                      className="px-0 h-auto text-primary"
                    >
                      Privacy Policy
                    </Button>
                  </Label>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    {isLogin
                      ? "Signing in..."
                      : "Creating account..."}
                  </div>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <Button
                  variant="link"
                  className="px-0 text-primary"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Notice */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and
          Privacy Policy
        </p>
      </div>
    </div>
  );
}