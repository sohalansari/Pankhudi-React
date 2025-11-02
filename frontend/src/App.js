import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ScrollToTop from "./context/ScrollToTop";
import React from "react";

const AppContent = () => {
  const { token } = useAuth();
  return (
    // key changes when login/logout happens -> router re-renders
    <AppRoutes key={token ? "logged-in" : "logged-out"} />
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
