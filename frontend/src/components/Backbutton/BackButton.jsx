import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './BackButton.css';

const BackButton = ({ 
  text = "Back", 
  onClick, 
  className = "", 
  to, 
  replace = false,
  variant = "default",
  position = "relative", // relative, absolute, fixed, sticky
  align = "left" // left, center, right
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to, { replace });
    } else {
      // If we're on the home page, don't go back in history
      if (location.pathname === '/' || location.pathname === '/home') {
        navigate('/');
      } else {
        navigate(-1);
      }
    }
  };

  // Determine button text based on current page
  const getButtonText = () => {
    if (text !== "Back") return text;
    
    switch(location.pathname) {
      case '/login':
        return 'Back to Home';
      case '/register':
        return 'Back to Login';
      case '/profile':
        return 'Back to Dashboard';
      default:
        return 'Back';
    }
  };

  return (
    <div className={`back-button-container back-button-${position} back-button-${align}`}>
      <button 
        className={`back-button back-button-${variant} ${className}`}
        onClick={handleClick}
        aria-label="Go back"
      >
        <FaArrowLeft className="back-button-icon" />
        <span className="back-button-text">{getButtonText()}</span>
      </button>
    </div>
  );
};

export default BackButton;