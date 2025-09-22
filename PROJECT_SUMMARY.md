## Project Summary: Pankhudi-React

### Overview
Pankhudi-React is a full-stack web application featuring a React frontend and an Express.js backend with MySQL database integration. It includes user authentication, an AI chatbot, product management with cart and orders, product reviews, and secure backend operations.

### Project Structure
- **Root Directory**: Contains main README.md, .gitignore, and subdirectories for admin, backend, frontend, and RoadMap.
- **Frontend (/frontend)**: React application with components, pages, contexts, and utilities.
- **Backend (/backend)**: Express.js server with routes, middleware, database connections, and uploads.
- **Admin (/admin)**: Separate admin panel with its own backend (Node.js/Express) and frontend (React), including controllers, models, routes, and uploads.
- **RoadMap (/RoadMap)**: Contains adminMap and FrontendMap files (likely documentation or planning files).

### Key Features
- **User Authentication**: Registration, login, Google OAuth, password reset.
- **AI Chat**: Integration with Google Gemini for chatbot functionality.
- **Product Management**: Browse products, add to cart, checkout, orders, and reviews.
- **Admin Panel**: Separate interface for managing users, products, reports, etc.
- **Security**: Auth middleware, validation, and secure backend.

### Tech Stack
- **Frontend**: React, React Router, Context API, Axios, React Toastify, Styled Components, Framer Motion, Google OAuth, FontAwesome icons.
- **Backend**: Node.js, Express.js, MySQL, Body Parser, CORS, JWT Decode, File Saver.
- **Database**: MySQL with tables for users, products, orders, cart items, reviews.
- **Other**: Bootstrap Icons, QRCode React, React Dropzone, React Easy Crop.

### Main Entry Points
- **Frontend**: `src/index.js` (renders App with Google OAuth provider), `src/App.js` (main app with providers), `src/routes.js` (route definitions).
- **Backend**: `server.js` (Express server setup, routes, DB pool).
- **Admin Backend**: `src/server.js` (similar Express setup for admin).
- **Admin Frontend**: Standard Create React App structure.

### API Endpoints (Examples)
- POST /api/auth/register: Register user
- POST /api/auth/login: Login user
- GET /api/products: Get products
- POST /api/cart: Add to cart
- GET /api/chat: AI chat functionality

### Database Schema
- users: id, name, email, password, google_id
- products: id, name, price, description
- orders: id, user_id, total
- cart_items: id, user_id, product_id, qty
- reviews: id, user_id, product_id, rating, comment

### Installation and Usage
- **Backend**: `cd backend && npm install && npm start` (runs on port 5000)
- **Frontend**: `cd frontend && npm install && npm start` (runs on localhost:3000)
- **Admin Backend**: `cd admin/backend && npm install && npm start`
- **Admin Frontend**: `cd admin/frontend && npm install && npm start`

The frontend is currently running successfully on localhost:3000 after installation. The project appears well-structured for e-commerce with AI features and admin management.
