import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaPhone, FaAddressCard, FaEdit, 
  FaArrowLeft, FaSave, FaTimes, FaCopy, FaCheck, FaCrown,
  FaShieldAlt, FaTrash, FaKey, FaLock, FaBell, FaPalette,
  FaCreditCard, FaStar, FaHistory, FaDownload, FaUpload
} from 'react-icons/fa';
import './Profile.css';
import BackButton from '../../components/Backbutton';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isPremium, setIsPremium] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Get user data from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // If no user data, try to get from registered users
    if (!currentUser || Object.keys(currentUser).length === 0) {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (registeredUsers.length > 0) {
        const user = registeredUsers[registeredUsers.length - 1];
        setUserData(user);
        setEditedData(user);
        setIsPremium(user.isPremium || false);
      } else {
        // Redirect to register if no user data found
        navigate('/register');
      }
    } else {
      setUserData(currentUser);
      setEditedData(currentUser);
      setIsPremium(currentUser.isPremium || false);
    }

    // Get theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, [navigate]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedData(userData);
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value
    });
  };

  const handleSave = () => {
    // Update localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = registeredUsers.map(user => 
      user.email === userData.email ? {...editedData, isPremium} : user
    );
    
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify({...editedData, isPremium}));
    
    // Update state
    setUserData({...editedData, isPremium});
    setEditMode(false);
    
    // Show success message
    setSaveStatus('Profile updated successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePremium = () => {
    const newPremiumStatus = !isPremium;
    setIsPremium(newPremiumStatus);
    
    // Update user data with premium status
    const updatedUserData = {...userData, isPremium: newPremiumStatus};
    setUserData(updatedUserData);
    
    // Update localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = registeredUsers.map(user => 
      user.email === userData.email ? updatedUserData : user
    );
    
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
    
    setSaveStatus(newPremiumStatus ? 'Premium activated!' : 'Premium deactivated');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `user-data-${userData.name}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
        {/* <BackButton text="Back to Dashboard" /> */}
      <div className="profile-header">
        {/* <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button> */}
        
        <div className="header-title">
          <h1>User Profile</h1>
          {isPremium && (
            <span className="premium-badge">
              <FaCrown /> PREMIUM
            </span>
          )}
        </div>
        
        {!editMode ? (
          <button className="edit-button" onClick={handleEdit}>
            <FaEdit /> Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-button" onClick={handleCancel}>
              <FaTimes /> Cancel
            </button>
            <button className="save-button" onClick={handleSave}>
              <FaSave /> Save
            </button>
          </div>
        )}
      </div>

      {saveStatus && (
        <div className="save-status success">
          {saveStatus}
        </div>
      )}

      <div className="profile-tabs">
        <button 
          className={activeTab === 'profile' ? 'tab-active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Profile
        </button>
        <button 
          className={activeTab === 'security' ? 'tab-active' : ''}
          onClick={() => setActiveTab('security')}
        >
          <FaLock /> Security
        </button>
        <button 
          className={activeTab === 'preferences' ? 'tab-active' : ''}
          onClick={() => setActiveTab('preferences')}
        >
          <FaPalette /> Preferences
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <>
            <div className="profile-card">
              <h2>
                <FaUser /> Personal Information
                {isPremium && <FaStar className="premium-icon" />}
              </h2>
              
              <div className="profile-field">
                <label>
                  <FaUser /> Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={editedData.name || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="field-value">
                    <span>{userData.name}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(userData.name, 'name')}
                      title="Copy to clipboard"
                    >
                      {copiedField === 'name' ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <FaEnvelope /> Email Address
                </label>
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={editedData.email || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="field-value">
                    <span>{userData.email}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(userData.email, 'email')}
                      title="Copy to clipboard"
                    >
                      {copiedField === 'email' ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <FaPhone /> Phone Number
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editedData.phone || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="field-value">
                    <span>{userData.phone || 'Not provided'}</span>
                    {userData.phone && (
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(userData.phone, 'phone')}
                        title="Copy to clipboard"
                      >
                        {copiedField === 'phone' ? <FaCheck /> : <FaCopy />}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <FaAddressCard /> Address
                </label>
                {editMode ? (
                  <textarea
                    name="address"
                    value={editedData.address || ''}
                    onChange={handleChange}
                    rows="3"
                    maxLength="200"
                    placeholder="Enter your full address (max 200 characters)"
                  />
                ) : (
                  <div className="field-value address-field">
                    <span className="address-text">{userData.address || 'Not provided'}</span>
                    {userData.address && (
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(userData.address, 'address')}
                        title="Copy to clipboard"
                      >
                        {copiedField === 'address' ? <FaCheck /> : <FaCopy />}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {userData.registeredAt && (
                <div className="profile-field">
                  <label>Registered On</label>
                  <div className="field-value">
                    <span>{new Date(userData.registeredAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-actions">
              <h3><FaHistory /> Account Actions</h3>
              <div className="action-buttons">
                <button className="action-btn primary">
                  <FaKey /> Change Password
                </button>
                <button className="action-btn secondary">
                  <FaShieldAlt /> Privacy Settings
                </button>
                <button className="action-btn warning">
                  <FaTrash /> Delete Account
                </button>
                <button className="action-btn special" onClick={exportData}>
                  <FaDownload /> Export Data
                </button>
                <button 
                  className={`action-btn premium ${isPremium ? 'active' : ''}`}
                  onClick={togglePremium}
                >
                  <FaCrown /> {isPremium ? 'Premium Active' : 'Go Premium'}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'security' && (
          <div className="profile-card">
            <h2><FaLock /> Security Settings</h2>
            
            <div className="security-item">
              <div className="security-info">
                <h4><FaKey /> Two-Factor Authentication</h4>
                <p>Add an extra layer of security to your account</p>
              </div>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h4><FaBell /> Login Notifications</h4>
                <p>Get alerted when someone logs into your account</p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h4><FaShieldAlt /> Security Questions</h4>
                <p>Set up security questions for account recovery</p>
              </div>
              <button className="action-btn outline">Set Up</button>
            </div>

            {isPremium && (
              <div className="security-item premium-feature">
                <div className="security-info">
                  <h4><FaCrown /> Advanced Security Logs</h4>
                  <p>Access detailed security history and login attempts (Premium Only)</p>
                </div>
                <button className="action-btn outline">View Logs</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="profile-card">
            <h2><FaPalette /> Preferences</h2>
            
            <div className="preference-item">
              <h4>Theme</h4>
              <p>Choose between light and dark mode</p>
              <div className="theme-switcher">
                <button 
                  className={theme === 'light' ? 'active' : ''}
                  onClick={() => setTheme('light')}
                >
                  Light
                </button>
                <button 
                  className={theme === 'dark' ? 'active' : ''}
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </button>
              </div>
            </div>

            <div className="preference-item">
              <h4>Language</h4>
              <p>Select your preferred language</p>
              <select className="preference-select">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <div className="preference-item">
              <h4>Email Notifications</h4>
              <p>Choose what emails you want to receive</p>
              <div className="checkbox-group">
                <label>
                  <input type="checkbox" defaultChecked />
                  <span>Product updates</span>
                </label>
                <label>
                  <input type="checkbox" defaultChecked />
                  <span>Security alerts</span>
                </label>
                <label>
                  <input type="checkbox" />
                  <span>Promotional offers</span>
                </label>
              </div>
            </div>

            {isPremium && (
              <div className="preference-item premium-feature">
                <h4><FaCrown /> Custom Themes</h4>
                <p>Access exclusive color themes (Premium Only)</p>
                <div className="theme-previews">
                  <div className="theme-preview blue"></div>
                  <div className="theme-preview green"></div>
                  <div className="theme-preview purple"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;