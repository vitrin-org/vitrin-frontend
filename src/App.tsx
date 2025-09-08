import React, { useState, useEffect } from 'react';
import { HomeFeed } from './components/HomeFeed';
import { ProductDetail } from './components/ProductDetail';
import { AddProduct } from './components/AddProduct';
import { UserProfile } from './components/UserProfile';
import { LoginSignup } from './components/LoginSignup';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { Search, Plus, User, LogIn, LogOut, Settings } from 'lucide-react';
import { authService } from './services/auth';

type Screen = 'home' | 'product-detail' | 'add-product' | 'profile' | 'login';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getUser();
      setIsLoggedIn(authenticated);
      setUser(currentUser);
    };

    checkAuth();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogin = (loggedIn: boolean) => {
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      setUser(authService.getUser());
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeFeed onNavigate={setCurrentScreen} />;
      case 'product-detail':
        return <ProductDetail onNavigate={setCurrentScreen} />;
      case 'add-product':
        if (!isLoggedIn) {
          setCurrentScreen('login');
          return null;
        }
        return <AddProduct onNavigate={setCurrentScreen} isLoggedIn={isLoggedIn} />;
      case 'profile':
        if (!isLoggedIn) {
          setCurrentScreen('login');
          return null;
        }
        return <UserProfile onNavigate={setCurrentScreen} />;
      case 'login':
        return <LoginSignup onNavigate={setCurrentScreen} onLogin={handleLogin} />;
      default:
        return <HomeFeed onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentScreen('home')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">Vitrin</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            <Button
              variant={currentScreen === 'home' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentScreen('home')}
              className="hidden sm:flex"
            >
              <Search className="w-4 h-4 mr-2" />
              Discover
            </Button>
            
            <Button
              variant={currentScreen === 'add-product' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentScreen('add-product')}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Submit</span>
            </Button>
            
            {isLoggedIn ? (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
                
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setCurrentScreen('profile');
                          setShowUserMenu(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentScreen('login')}
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {renderScreen()}
      </main>
    </div>
  );
}