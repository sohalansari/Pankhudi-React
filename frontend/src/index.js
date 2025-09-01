import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google'; // ✅ Import this

const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">  {/* ✅ Replace with your actual client ID */}
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Optional: For measuring performance
reportWebVitals();
