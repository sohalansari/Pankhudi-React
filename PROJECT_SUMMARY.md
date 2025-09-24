# Project Summary: Pankhudi-React

## 📋 Overview
Pankhudi-React is a comprehensive full-stack e-commerce web application featuring a React frontend and Express.js backend with MySQL database integration. The application includes user authentication, an AI-powered chatbot, product management with cart and orders, product reviews, and a complete admin panel for backend operations.

## 🏗️ Project Architecture

```
Pankhudi-React/
├── frontend/           # Main User Interface (React)
├── backend/            # Main API Server (Express.js + MySQL)
├── admin/              # Admin Panel
│   ├── frontend/       # Admin UI (React)
│   └── backend/        # Admin API Server (Express.js + MySQL)
└── RoadMap/            # Project planning documentation
```

## 🎯 Key Features

### User Features
- **🔐 Authentication System**: Registration, login, Google OAuth integration, password reset functionality
- **🤖 AI Chatbot**: Integration with Google Gemini for intelligent customer support
- **🛒 E-commerce Platform**: Product catalog, shopping cart, checkout process, order management
- **⭐ Review System**: Product ratings and customer reviews
- **📱 Responsive Design**: Mobile-friendly interface with modern UI/UX

### Admin Features
- **👥 User Management**: Complete user administration and monitoring
- **📊 Analytics Dashboard**: Data visualization with charts and reports
- **📈 Business Intelligence**: Excel export/import capabilities
- **🔧 System Management**: Real-time monitoring and control

## 🛠️ Technology Stack

### Frontend (Main Application)
- **Framework**: React 19.1.1
- **Routing**: React Router DOM 7.6.0
- **State Management**: Context API
- **HTTP Client**: Axios 1.11.0
- **Styling**: Styled Components 6.1.18, Framer Motion 12.23.6
- **Authentication**: Google OAuth 0.12.2
- **Icons**: FontAwesome, Bootstrap Icons, React Icons
- **File Handling**: React Dropzone, React Easy Crop
- **Notifications**: React Toastify
- **QR Codes**: QRCode React

### Backend (Main API)
- **Runtime**: Node.js
- **Framework**: Express.js 4.21.2
- **Database**: MySQL 2.18.1, MySQL2 3.14.1
- **Authentication**: JWT 9.0.2, bcrypt 5.1.1
- **Security**: Helmet 8.1.0, CORS 2.8.5, Rate Limiting, XSS Protection
- **File Upload**: Multer 1.4.5-lts.2
- **Email**: Nodemailer 6.10.1
- **AI Integration**: OpenAI 4.85.1, Google Auth Library
- **Payment**: Stripe 18.0.0, Razorpay 2.9.6

### Admin Frontend
- **Framework**: React 19.1.1
- **Charts**: Recharts 3.2.0
- **Real-time**: Socket.io Client 4.8.1
- **Data Processing**: PapaParse 5.5.3, XLSX 0.18.5
- **Port**: 3001

### Admin Backend
- **Framework**: Express.js 5.1.0
- **Database**: MySQL2 3.14.4
- **Port**: 5000 (assumed)

## 📂 Project Structure Details

### Main Frontend (`/frontend`)
```
src/
├── components/         # Reusable UI components
│   ├── common/        # Shared components
│   ├── Header/        # Navigation component
│   ├── Footer/        # Footer component
│   ├── ProductCard/   # Product display component
│   ├── LoadingSpinner/ # Loading states
│   └── chatbot/       # AI chat interface
├── pages/             # Application pages
│   ├── Home/          # Landing page
│   ├── Products/      # Product catalog
│   ├── ProductDetail/ # Individual product view
│   ├── Cart/          # Shopping cart
│   ├── Checkout/      # Checkout process
│   ├── Profile/       # User profile
│   ├── Login/         # Authentication
│   ├── Register/      # User registration
│   └── AIChatbot/     # AI chat interface
├── context/           # React contexts
│   ├── AuthContext.js # Authentication state
│   ├── CartContext.js # Shopping cart state
│   └── ScrollToTop.js # Navigation utilities
├── utils/             # Helper functions
│   ├── api.js         # API integration
│   └── helpers.js     # Utility functions
└── routes.js          # Route definitions
```

### Main Backend (`/backend`)
```
├── middleware/        # Express middleware
│   ├── auth.js       # Authentication middleware
│   └── verifyToken.js # Token verification
├── routes/           # API endpoints
│   ├── auth.js       # Authentication routes
│   ├── products.js   # Product management
│   ├── cart.js       # Shopping cart
│   ├── chat.js       # AI chat endpoints
│   └── profile.js    # User profile
├── sql/              # Database schema
│   ├── users_table.sql
│   ├── products.sql
│   ├── orders.sql
│   ├── cart_items.sql
│   └── reviews.sql
├── uploads/          # File storage
│   ├── avatars/      # User profile images
│   └── products/     # Product images
└── utils/            # Backend utilities
    ├── generateJWT.js
    └── transporter.js
```

### Admin Frontend (`/admin/frontend`)
```
src/
├── components/       # Admin UI components
├── pages/           # Admin pages
├── contexts/        # Admin contexts
├── hooks/           # Custom hooks
├── styles/          # Styling
└── utils/           # Admin utilities
```

### Admin Backend (`/admin/backend`)
```
src/
├── controllers/     # Request handlers
│   ├── authController.js
│   ├── userController.js
│   ├── dashboardController.js
│   └── ...
├── models/          # Data models
│   ├── User.js
│   └── index.js
├── routes/          # Admin API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── dashboardRoutes.js
│   └── adminReports.js
├── middlewares/     # Admin middleware
│   ├── authMiddleware.js
│   ├── validationMiddleware.js
│   └── errorMiddleware.js
├── config/          # Configuration
│   ├── db.js
│   └── constants.js
└── uploads/         # Admin file uploads
```

## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `name`, `email`, `password`
- `google_id` (for OAuth users)
- Timestamps

### Products Table
- `id` (Primary Key)
- `name`, `price`, `description`
- `category`, `image_url`
- `stock_quantity`

### Orders Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `total_amount`, `status`
- `shipping_address`

### Cart Items Table
- `id` (Primary Key)
- `user_id`, `product_id` (Foreign Keys)
- `quantity`

### Reviews Table
- `id` (Primary Key)
- `user_id`, `product_id` (Foreign Keys)
- `rating`, `comment`

## 🚀 Installation & Setup

### Main Application
```bash
# Backend Setup
cd backend
npm install
npm start

# Frontend Setup
cd frontend
npm install
npm start
```

### Admin Panel
```bash
# Admin Backend Setup
cd admin/backend
npm install
npm start

# Admin Frontend Setup
cd admin/frontend
npm install
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Password reset

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)

### Cart & Orders
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

### AI Chat
- `POST /api/chat` - AI chatbot interaction

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/reports` - Get analytics
- `POST /api/admin/export` - Export data

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- XSS protection
- CORS configuration
- Helmet security headers
- Input validation and sanitization

## 📊 Admin Features

- **User Management**: View, edit, delete users
- **Analytics Dashboard**: Sales, user activity, product performance
- **Data Export**: Excel/CSV export capabilities
- **Real-time Monitoring**: Live system status
- **Content Management**: Product and inventory management

## 🔄 Development Status

- ✅ User authentication system
- ✅ Product catalog and cart functionality
- ✅ AI chatbot integration
- ✅ Admin panel with analytics
- ✅ File upload capabilities
- ✅ Responsive design
- 🔄 Payment integration (Stripe/Razorpay configured)
- 🔄 Email notifications system

## 📈 Future Enhancements

- Payment gateway integration completion
- Advanced analytics and reporting
- Mobile application development
- Multi-language support
- Advanced search and filtering
- Real-time notifications

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Environment**: Development
