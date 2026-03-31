// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/Login/Login";
// import Dashboard from "./pages/Dashboard/Dashboard";
// import Users from "./pages/Users/Users";
// import Settings from "./pages/Settings/Settings";
// import Navbar from "./components/Navbar/Navbar";
// import Layout from "./components/Layout/MainLayout";
// import AddProduct from "./pages/Product/AddProduct";
// import ManageProducts from "./pages/ManageProducts/ManageProducts";
// import AdminReports from "./pages/Reports/Reports";
// import Cart from "./pages/userCart/cart";
// import CategoryManagement from "./pages/Category/category";
// import BannerManagement from "./pages/AdminBanners/Banners"; // ✅ Import Banner Management
// import PromoCodes from "./pages/PromoCodes/PromoCodes"; // ✅ Import Promo Codes Management
// import Orders from "./pages/Orders/Orders";
// import Reviews from "./pages/Reviews/Reviews";
// import "./App.css";

// function App() {
//   const isLoggedIn = localStorage.getItem("auth");

//   if (!isLoggedIn) {
//     return <Login />;
//   }

//   return (
//     <Layout>
//       <div className="app-content">
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<Navigate to="/dashboard" />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/users" element={<Users />} />
//           <Route path="/settings" element={<Settings />} />
//           <Route path="/add-product" element={<AddProduct />} />
//           <Route path="/products" element={<ManageProducts />} />
//           <Route path="/reports" element={<AdminReports />} />
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/categories" element={<CategoryManagement />} />

//           {/* ✅ Banner Management Routes */}
//           <Route path="/banners" element={<BannerManagement />} />

//           {/* 404 Page - Add at the end */}
//           <Route path="*" element={<Navigate to="/dashboard" />} />
//           <Route path="/promocodes" element={<PromoCodes />} />
//           <Route path="/orders" element={<Orders />} />
//           <Route path="/reviews" element={<Reviews />} />
//         </Routes>
//       </div>
//     </Layout>
//   );
// }

// export default App;
















import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Users from "./pages/Users/Users";
import Settings from "./pages/Settings/Settings";
// import Navbar from "./components/Navbar/Navbar";
import Layout from "./components/Layout/MainLayout";
import AddProduct from "./pages/Product/AddProduct";
import ManageProducts from "./pages/ManageProducts/ManageProducts";
import AdminReports from "./pages/Reports/Reports";
import Cart from "./pages/userCart/cart";
import CategoryManagement from "./pages/Category/category";
import BannerManagement from "./pages/AdminBanners/Banners";
import PromoCodes from "./pages/PromoCodes/PromoCodes";
import Orders from "./pages/Orders/Orders";
import Reviews from "./pages/Reviews/Reviews";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("adminToken") || localStorage.getItem("auth");
    const userData = localStorage.getItem("adminData");

    if (token && userData) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  // Handle logout function
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("auth");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("tokenExpiry");
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Layout>
      <div className="app-content">
        {/* <Navbar onLogout={handleLogout} /> */}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/products" element={<ManageProducts />} />
          <Route path="/reports" element={<AdminReports />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/banners" element={<BannerManagement />} />
          <Route path="/promocodes" element={<PromoCodes />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Layout>
  );
}

export default App;