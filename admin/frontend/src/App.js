import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Users from "./pages/Users/Users";
import Settings from "./pages/Settings/Settings";
import Navbar from "./components/Navbar/Navbar";
import Layout from "./components/Layout/MainLayout";
import AddProduct from "./pages/Product/AddProduct";
import ManageProducts from "./pages/ManageProducts/ManageProducts";

import "./App.css";

function App() {
  const isLoggedIn = localStorage.getItem("auth");

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <Layout>
      <div className="app-content">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/products" element={<ManageProducts />} />
        </Routes>
      </div>
    </Layout>
  );
}

export default App;
