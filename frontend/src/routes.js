// src/routes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Login from './pages/Login/Login';
import Register from './pages/Ragister/Register';
import ForgotPassword from './pages/Forget_Password/Forget';
import TermsAndConditions from './pages/Terms/Tearm';
import NotFound from './pages/404/NotFound';
import CheckoutPage from './pages/Checkout/Checkout';
import Profile from './pages/Profile/Profile';
import DummyPayment from './pages/Payment/DummyPayment';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import OrderHistory from './pages/OrderHistory/OrderHistory';
import AIChatbot from './pages/AIChatbot/AIChatbot'
import Collections from './pages/Collection/Collections';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/ProductDetail/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/dummy-payment" element={<DummyPayment />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/ai-chat" element={<AIChatbot />} />
            <Route path='/collections' element={<Collections />} />
        </Routes>
    );
};

export default AppRoutes;