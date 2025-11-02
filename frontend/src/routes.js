import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import Cart from "./pages/Cart/Cart";
import Login from "./pages/Login/Login";
import Register from "./pages/Ragister/Register";
import ForgotPassword from "./pages/Forget_Password/Forget";
import TermsAndConditions from "./pages/Terms/Tearm";
import NotFound from "./pages/404/NotFound";
import CheckoutPage from "./pages/Checkout/Checkout";
import Profile from "./pages/Profile/Profile";
import DummyPayment from "./pages/Payment/DummyPayment";
import OrderConfirmation from "./pages/OrderConfirmation/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory/OrderHistory";
import AIChatbot from "./pages/AIChatbot/AIChatbot";
import Collections from "./pages/Collection/Collections";
import About from "./pages/About/About";
import ScrollToTop from "./context/ScrollToTop";
import ProtectedRoute from "./context/ProtectedRoute";
import PublicRoute from "./context/PublicRoute"; // ✅ new import
import ProductDetails from "./pages/ProductDetail/ProductDetail";
import SearchResults from "./pages/SearchResult/SearchResults";

const AppRoutes = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/forgot" element={<ForgotPassword />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/ai-chat" element={<AIChatbot />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/about" element={<About />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/ProductDetail/:id" element={<ProductDetails />} />

                {/* Login/Register ko PublicRoute se wrap kiya */}
                <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute>} />
                <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} />
                {/* Protected Routes */}
                <Route path="/checkout" element={<ProtectedRoute> <CheckoutPage /> </ProtectedRoute>} />
                <Route path="/profile/:id" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
                <Route path="/dummy-payment" element={<ProtectedRoute> <DummyPayment /> </ProtectedRoute>} />
                <Route path="/order-confirmation" element={<ProtectedRoute> <OrderConfirmation /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute> <OrderHistory /> </ProtectedRoute>} />
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

export default AppRoutes;
