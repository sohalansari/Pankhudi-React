import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import "@fortawesome/fontawesome-free/css/all.min.css";


const initErrorHandling = () => {
  const originalError = console.error;
  console.error = (...args) => {
    if (args.length > 0) {
      const message = args[0];
      if (
        typeof message === 'string' &&
        message.includes('ResizeObserver') &&
        message.includes('loop')
      ) {
        return;
      }
    }
    originalError.apply(console, args);
  };
  window.addEventListener('error', (event) => {
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes('ResizeObserver') &&
      event.error.message.includes('loop')
    ) {
      event.preventDefault();
      console.warn('ResizeObserver loop error suppressed');
    }
  });
};

initErrorHandling();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="311061587151-ggc8p3u0v9rkjtnboq6ttic11glpd9rt.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();