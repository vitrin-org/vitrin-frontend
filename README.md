# Vitrin Frontend

React TypeScript frontend application for the Vitrin platform - a modern e-commerce and product showcase application.

## 🚀 Features

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Google OAuth** - Social authentication
- **Responsive Design** - Mobile-first approach

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Query + Context
- **Routing**: React Router v6
- **Testing**: Jest + React Testing Library

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/vitrin-org/vitrin-frontend.git
   cd vitrin-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=10000

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# App Configuration
VITE_APP_NAME=Vitrin
VITE_APP_VERSION=1.0.0
```

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking

# Formatting
npm run format       # Format code with Prettier
```

## 🏗️ Project Structure

```
vitrin-frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── AddProduct.tsx
│   │   ├── HomeFeed.tsx
│   │   ├── LoginSignup.tsx
│   │   ├── ProductDetail.tsx
│   │   └── UserProfile.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCategories.ts
│   │   └── useProducts.ts
│   ├── services/           # API services
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   ├── styles/             # Global styles
│   ├── App.tsx
│   └── main.tsx
├── public/                 # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🎨 UI Components

### Core Components

- **AddProduct** - Product creation form
- **HomeFeed** - Main product listing
- **LoginSignup** - Authentication forms
- **ProductDetail** - Product details view
- **UserProfile** - User profile management

### UI Library

Built with Radix UI primitives:
- Button, Input, Select
- Dialog, Dropdown, Toast
- Form, Label, Checkbox
- And many more...

## 🔐 Authentication

The app supports multiple authentication methods:

- **Email/Password** - Traditional login
- **Google OAuth** - Social authentication
- **JWT Tokens** - Secure API communication

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Breakpoints** - sm, md, lg, xl, 2xl
- **Touch Friendly** - Optimized for touch interactions

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Stack

- **Jest** - Test runner
- **React Testing Library** - Component testing
- **MSW** - API mocking
- **Testing Library User Events** - User interaction testing

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Docker

```bash
# Build image
docker build -t vitrin-frontend .

# Run container
docker run -p 3000:3000 vitrin-frontend
```

### Vercel/Netlify

The app is configured for easy deployment to Vercel or Netlify:

```bash
# Deploy to Vercel
npx vercel

# Deploy to Netlify
npm run build
# Upload dist/ folder to Netlify
```

## 🔗 API Integration

The frontend integrates with the Vitrin backend API:

- **Products API** - CRUD operations
- **Authentication API** - Login, register, OAuth
- **Users API** - Profile management
- **Categories API** - Product categorization

## 🎯 Performance

- **Code Splitting** - Automatic route-based splitting
- **Lazy Loading** - Components loaded on demand
- **Image Optimization** - Optimized image loading
- **Caching** - React Query for API caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Backend Repository**: https://github.com/vitrin-org/vitrin-backend
- **Documentation**: https://github.com/vitrin-org/vitrin-docs
- **Live Demo**: https://vitrin.vercel.app

## 📞 Support

For questions or issues:
- Create an issue in this repository
- Check the documentation in vitrin-docs
- Review the component documentation
