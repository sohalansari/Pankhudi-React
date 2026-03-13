Pankhudi-React/
│
├── .gitignore
├── README.md
├── PROJECT_SUMMARY.md
├── TODO.md
├── RoadMap/
│   ├── adminMap
│   ├── FrontendMap
│   └── FullProjectStructure.md
│
├── backend/                         # Main E-commerce Backend API (Port 5000)
│
│   ├── server.js                    # Application entry point
│   ├── package.json
│   ├── .env
│
│   ├── config/                      # Configuration files
│   │   ├── database.js
│   │   └── environment.js
│
│   ├── controllers/                 # Business logic
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   └── profileController.js
│
│   ├── routes/                      # API endpoints
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── searchRoutes.js
│   │   ├── addressRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── promoRoutes.js
│   │   └── chatRoutes.js
│
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── verifyToken.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│
│   ├── models/                      # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Cart.js
│   │   └── PromoCode.js
│
│   ├── services/                    # External integrations
│   │   ├── emailService.js
│   │   ├── paymentService.js
│   │   └── chatbotService.js
│
│   ├── templates/                   # Email templates
│   │   └── emailTemplate.js
│
│   ├── uploads/                     # Static uploads
│   │   ├── avatars/
│   │   ├── products/
│   │   └── banners/
│
│   ├── sql/
│   │   └── PankhudiMain.sql
│
│   └── utils/
│       ├── generateJWT.js
│       ├── transporter.js
│       ├── helpers.js
│       └── constants.js
│
│
├── frontend/                        # Customer React Application (Port 3000)
│
│   ├── package.json
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── robots.txt
│   │   └── images/
│   │       ├── icons/
│   │       └── posters/
│
│   └── src/
│
│       ├── App.js
│       ├── index.js
│       ├── routes.js
│       ├── App.css
│       ├── index.css
│
│       ├── api/                     # API configuration
│       │   └── apiClient.js
│
│       ├── components/
│       │   ├── Header/
│       │   ├── Footer/
│       │   ├── BackButton/
│       │   ├── LoadingSpinner/
│       │   └── chatbot/
│
│       ├── context/
│       │   ├── AuthContext.js
│       │   ├── CartContext.js
│       │   ├── ProtectedRoute.js
│       │   ├── PublicRoute.js
│       │   └── ScrollToTop.js
│
│       ├── hooks/
│       │   ├── useAuth.js
│       │   └── useCart.js
│
│       ├── pages/
│       │
│       │   ├── Home/
│       │   ├── Products/
│       │   ├── ProductDetail/
│       │   ├── CategoryPage/
│       │   ├── Cart/
│       │   ├── Checkout/
│       │   ├── OrderHistory/
│       │   ├── OrderConfirmation/
│       │   ├── Profile/
│       │   ├── Login/
│       │   ├── Register/
│       │   ├── ForgetPassword/
│       │   ├── SearchResult/
│       │   ├── AIChatbot/
│       │   ├── About/
│       │   ├── Terms/
│       │   └── NotFound/
│
│       └── utils/
│           ├── debounce.js
│           └── helpers.js
│
│
├── admin/                           # Admin Panel
│
│   ├── backend/                     # Admin Backend (Port 5001)
│
│   │   ├── server.js
│   │   ├── package.json
│   │
│   │   └── src/
│   │
│   │       ├── app.js
│   │
│   │       ├── config/
│   │       │   └── db.js
│   │
│   │       ├── controllers/
│   │       │   ├── dashboardController.js
│   │       │   ├── userController.js
│   │       │   ├── categoryController.js
│   │       │   ├── orderAdminController.js
│   │       │   ├── paymentController.js
│   │       │   ├── promoController.js
│   │       │   └── reviewController.js
│   │
│   │       ├── routes/
│   │       │   ├── authRoutes.js
│   │       │   ├── dashboardRoutes.js
│   │       │   ├── products.js
│   │       │   ├── categories.js
│   │       │   ├── orders.js
│   │       │   ├── payments.js
│   │       │   └── users.js
│   │
│   │       ├── middleware/
│   │       │   ├── authMiddleware.js
│   │       │   ├── errorMiddleware.js
│   │       │   └── validationMiddleware.js
│   │
│   │       ├── models/
│   │       │   ├── User.js
│   │       │   ├── Product.js
│   │       │   ├── Category.js
│   │       │   ├── Order.js
│   │       │   ├── Payment.js
│   │       │   └── PromoCode.js
│   │
│   │       └── uploads/
│   │           ├── avatars/
│   │           ├── banners/
│   │           ├── categories/
│   │           └── products/
│
│   └── frontend/                    # Admin React Dashboard (Port 3001)
│
│       ├── package.json
│       ├── public/
│       │   ├── index.html
│       │   └── manifest.json
│
│       └── src/
│           ├── App.js
│           ├── index.js
│
│           ├── components/
│           │   ├── Sidebar/
│           │   ├── Navbar/
│           │   ├── Charts/
│           │   └── Tables/
│
│           ├── pages/
│           │   ├── Dashboard/
│           │   ├── Products/
│           │   ├── Orders/
│           │   ├── Users/
│           │   ├── Categories/
│           │   └── Reports/
│
│           ├── services/
│           │   └── adminApi.js
│
│           └── utils/
│               └── helpers.js
│





Customer Frontend (3000)
        │
        ▼
Main Backend API (5000)
        │
        ▼
MySQL Database (pankhudi)
        ▲
        │
Admin Backend (5001)
        ▲
        │
Admin Dashboard (3001)