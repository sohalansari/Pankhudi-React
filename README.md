# Pankhudi-React
📌 Overview

A full-stack web app with React frontend and Express.js + MySQL backend.
Includes authentication, product/cart system, AI chat, and database integration.

🚀 Features

🔑 User Authentication (Register, Login, Google OAuth, Password Reset)

🤖 AI Chat (Google Gemini)

🛒 Cart & Orders

⭐ Product Reviews

🔐 Secure backend with auth & security libs

⚛️ React frontend with routing and contexts

🛠️ Tech Stack

Frontend: React, React Router, Context API, Icons, Animations
Backend: Node.js, Express.js, MySQL
Database: Users, Products, Orders, Cart Items, Reviews

📂 Project Structure
/frontend   -> React app  
/backend    -> Express.js + MySQL server  

⚡ Installation

Clone the repo and install dependencies:

git clone <repo-url>

Backend Setup
cd backend
npm install
npm start

Frontend Setup
cd frontend
npm install
npm start

🎯 Usage

Open app in browser

Create account / Login

Browse products & add to cart

Checkout (payment WIP)

Try AI chat

📡 API Endpoints (examples)
Method	Endpoint	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	Login user
GET	/api/products	Get all products
POST	/api/cart	Add to cart
🗄️ Database Schema

users (id, name, email, password, google_id)

products (id, name, price, description)

orders (id, user_id, total)

cart_items (id, user_id, product_id, qty)

reviews (id, user_id, product_id, rating, comment)

🤝 Contributing

Pull requests welcome!

