import React, { useEffect, useState } from "react";
import {
  FaArrowLeft, FaCopy, FaEdit, FaSave, FaUser, FaCrown,
  FaCheck, FaTimes, FaEye, FaEyeSlash, FaUpload, FaSignOutAlt,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaUserTag,
  FaBell, FaShieldAlt, FaPalette, FaGlobe, FaTrash, FaDownload,
  FaCreditCard, FaHistory, FaQrcode, FaKey, FaDatabase, FaGem
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: "What was your first pet's name?", answer: "" },
    { question: "What city were you born in?", answer: "" },
    { question: "What is your mother's maiden name?", answer: "" }
  ]);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    promotions: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (currentUser && currentUser.email) {
        setUser(currentUser);
        setFormData(currentUser);
        calculateProfileCompletion(currentUser);

        // Load additional settings if they exist
        if (currentUser.theme) setTheme(currentUser.theme);
        if (currentUser.language) setLanguage(currentUser.language);
        if (currentUser.notifications) setNotifications(currentUser.notifications);
        if (currentUser.securityQuestions) setSecurityQuestions(currentUser.securityQuestions);
      } else {
        // If "user" key not found, check registeredUsers
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        const rememberedEmail = localStorage.getItem("rememberedEmail");

        const foundUser = registeredUsers.find((u) => u.email === rememberedEmail);
        if (foundUser) {
          setUser(foundUser);
          setFormData(foundUser);
          calculateProfileCompletion(foundUser);
        } else {
          // If no user found, redirect to login
          navigate("/login");
        }
      }
    };

    loadUserData();
  }, [navigate]);

  // Apply theme on change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (user) {
      const updatedUser = { ...user, theme };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [theme, user]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData) => {
    const fields = ['name', 'email', 'phone', 'address', 'profileImage'];
    let completedFields = 0;

    fields.forEach(field => {
      if (userData[field] && userData[field].trim() !== '') {
        completedFields++;
      }
    });

    setProfileCompletion(Math.round((completedFields / fields.length) * 100));
  };

  // Copy function with visual feedback
  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Input change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password change handler
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Handle security question change
  const handleSecurityQuestionChange = (index, value) => {
    const updatedQuestions = [...securityQuestions];
    updatedQuestions[index].answer = value;
    setSecurityQuestions(updatedQuestions);
  };

  // Handle notification toggle
  const handleNotificationToggle = (type) => {
    setNotifications({
      ...notifications,
      [type]: !notifications[type]
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(""), 3000);
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSaveStatus("size_error");
        setTimeout(() => setSaveStatus(""), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedUser = { ...formData, profileImage: event.target.result };
        setFormData(updatedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile image
  const handleRemoveImage = () => {
    const updatedUser = { ...formData, profileImage: "" };
    setFormData(updatedUser);
  };

  // Save updated profile
  const handleSave = () => {
    const updatedUser = {
      ...formData,
      lastUpdated: new Date().toISOString(),
      theme,
      language,
      notifications,
      securityQuestions
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Update registeredUsers as well
    let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    registeredUsers = registeredUsers.map((u) =>
      u.email === formData.email ? updatedUser : u
    );
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    setEditMode(false);
    setSaveStatus("success");
    calculateProfileCompletion(updatedUser);
    setTimeout(() => setSaveStatus(""), 3000);
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData(user);
    setEditMode(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    navigate("/");
  };

  // Upgrade to premium
  const handleUpgrade = () => {
    const updatedUser = { ...user, isPremium: true };
    setUser(updatedUser);
    setFormData(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    registeredUsers = registeredUsers.map((u) =>
      u.email === user.email ? updatedUser : u
    );
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    setSaveStatus("upgraded");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  // Export user data
  const handleExportData = () => {
    const dataStr = JSON.stringify(user, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `${user.name || 'user'}-data.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Delete account
  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Remove from registeredUsers
      let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      registeredUsers = registeredUsers.filter((u) => u.email !== user.email);
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

      // Remove user data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('rememberedEmail');

      navigate("/register");
    }
  };

  // Update password
  const handleUpdatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveStatus("password_mismatch");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }

    // In a real app, you would verify the current password and update it
    setSaveStatus("password_updated");
    setTimeout(() => setSaveStatus(""), 3000);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  // Save security questions
  const handleSaveSecurityQuestions = () => {
    const updatedUser = { ...user, securityQuestions };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    registeredUsers = registeredUsers.map((u) =>
      u.email === user.email ? updatedUser : u
    );
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    setSaveStatus("security_questions_saved");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  // Save preferences
  const handleSavePreferences = () => {
    const updatedUser = {
      ...user,
      theme,
      language,
      notifications
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    registeredUsers = registeredUsers.map((u) =>
      u.email === user.email ? updatedUser : u
    );
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    setSaveStatus("preferences_saved");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Animated Background Elements */}
      <div className="bg-pattern"></div>
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="site-name">
          <FaGem className="logo-icon" /> Pankhudi
        </h2>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Profile Container */}
      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="user-card">
            <div className="avatar-container">
              <div className="profile-avatar">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    <FaUser />
                  </div>
                )}
                {editMode && (
                  <div className="avatar-actions">
                    <label className="avatar-upload">
                      <FaUpload />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {formData.profileImage && (
                      <button className="avatar-remove" onClick={handleRemoveImage}>
                        <FaTrash />
                      </button>
                    )}
                  </div>
                )}
              </div>
              {user.isPremium && (
                <div className="premium-badge">
                  <FaCrown /> Premium
                </div>
              )}
            </div>

            <h2 className="user-name">{user.name || "User"}</h2>
            <p className="user-email">{user.email}</p>

            {!user.isPremium && (
              <button className="upgrade-btn" onClick={handleUpgrade}>
                <FaCrown /> Upgrade to Premium
              </button>
            )}

            <div className="profile-completion">
              <div className="completion-header">
                <span>Profile Completion</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="completion-bar">
                <div
                  className="completion-progress"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              {profileCompletion < 100 && (
                <p className="completion-tip">Complete your profile to unlock all features</p>
              )}
            </div>
          </div>

          <div className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <FaUser /> Personal Info
            </button>
            <button
              className={`nav-item ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <FaLock /> Security
            </button>
            <button
              className={`nav-item ${activeTab === "preferences" ? "active" : ""}`}
              onClick={() => setActiveTab("preferences")}
            >
              <FaPalette /> Preferences
            </button>
            <button
              className={`nav-item ${activeTab === "billing" ? "active" : ""}`}
              onClick={() => setActiveTab("billing")}
            >
              <FaCreditCard /> Billing
            </button>
            <button
              className={`nav-item ${activeTab === "data" ? "active" : ""}`}
              onClick={() => setActiveTab("data")}
            >
              <FaDatabase /> Data
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {/* Save Status Notification */}
          {saveStatus === "success" && (
            <div className="save-notification success">
              <FaCheck /> Profile updated successfully!
            </div>
          )}

          {saveStatus === "upgraded" && (
            <div className="save-notification success">
              <FaCrown /> Congratulations! You've upgraded to Premium!
            </div>
          )}

          {saveStatus === "error" && (
            <div className="save-notification error">
              <FaTimes /> Please select a valid image file
            </div>
          )}

          {saveStatus === "size_error" && (
            <div className="save-notification error">
              <FaTimes /> Image size must be less than 5MB
            </div>
          )}

          {saveStatus === "password_mismatch" && (
            <div className="save-notification error">
              <FaTimes /> New passwords don't match
            </div>
          )}

          {saveStatus === "password_updated" && (
            <div className="save-notification success">
              <FaCheck /> Password updated successfully!
            </div>
          )}

          {saveStatus === "security_questions_saved" && (
            <div className="save-notification success">
              <FaCheck /> Security questions saved!
            </div>
          )}

          {saveStatus === "preferences_saved" && (
            <div className="save-notification success">
              <FaCheck /> Preferences saved successfully!
            </div>
          )}

          {/* Profile Content */}
          <div className="profile-content-card">
            <div className="card-header">
              <h2>
                {activeTab === "profile" && "Personal Information"}
                {activeTab === "security" && "Security Settings"}
                {activeTab === "preferences" && "Preferences"}
                {activeTab === "billing" && "Billing & Payments"}
                {activeTab === "data" && "Data Management"}
              </h2>

              {activeTab === "profile" && !editMode && (
                <button className="edit-btn" onClick={() => setEditMode(true)}>
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>

            {activeTab === "profile" && (
              <div className="profile-details">
                <div className="detail-group">
                  <h3><FaUserTag /> Basic Information</h3>

                  <div className="detail-item">
                    <label>Full Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        className="profile-input"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="field-value-container">
                        <span className="field-value">{user.name || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  <div className="detail-item">
                    <label><FaEnvelope /> Email Address</label>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        className="profile-input"
                      />
                    ) : (
                      <div className="field-value-container">
                        <span className="field-value">{user.email}</span>
                        <button
                          className={`copy-btn ${copiedField === "email" ? "copied" : ""}`}
                          onClick={() => handleCopy(user.email, "email")}
                          aria-label="Copy email"
                        >
                          <FaCopy />
                          {copiedField === "email" && <span className="copy-tooltip">Copied!</span>}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="detail-item">
                    <label><FaPhone /> Phone Number</label>
                    {editMode ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        className="profile-input"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="field-value-container">
                        <span className="field-value">{user.phone || "Not provided"}</span>
                        {user.phone && (
                          <button
                            className={`copy-btn ${copiedField === "phone" ? "copied" : ""}`}
                            onClick={() => handleCopy(user.phone, "phone")}
                            aria-label="Copy phone number"
                          >
                            <FaCopy />
                            {copiedField === "phone" && <span className="copy-tooltip">Copied!</span>}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-group">
                  <h3><FaMapMarkerAlt /> Address</h3>

                  <div className="detail-item">
                    <label>Full Address</label>
                    {editMode ? (
                      <textarea
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        className="profile-textarea"
                        placeholder="Enter your full address"
                        rows="3"
                      />
                    ) : (
                      <div className="field-value-container">
                        <span className="field-value">{user.address || "Not provided"}</span>
                        {user.address && (
                          <button
                            className={`copy-btn ${copiedField === "address" ? "copied" : ""}`}
                            onClick={() => handleCopy(user.address, "address")}
                            aria-label="Copy address"
                          >
                            <FaCopy />
                            {copiedField === "address" && <span className="copy-tooltip">Copied!</span>}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-group">
                  <h3>Account Status</h3>

                  <div className="status-items">
                    <div className="status-item">
                      <label>Terms Agreement</label>
                      <span className={`status-badge ${user.terms ? "accepted" : "rejected"}`}>
                        {user.terms ? <><FaCheck /> Accepted</> : <><FaTimes /> Not Accepted</>}
                      </span>
                    </div>

                    <div className="status-item">
                      <label>Premium Status</label>
                      <span className={`status-badge ${user.isPremium ? "premium" : "standard"}`}>
                        {user.isPremium ? <><FaCrown /> Premium</> : "Standard"}
                      </span>
                    </div>

                    <div className="status-item">
                      <label>Member Since</label>
                      <span className="status-value">
                        {user.joinDate || "Recent"}
                      </span>
                    </div>

                    <div className="status-item">
                      <label>Last Updated</label>
                      <span className="status-value">
                        {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : "Never"}
                      </span>
                    </div>
                  </div>
                </div>

                {editMode && (
                  <div className="action-buttons">
                    <button className="save-btn" onClick={handleSave}>
                      <FaSave /> Save Changes
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="security-settings">
                <div className="detail-group">
                  <h3><FaKey /> Password</h3>

                  <div className="detail-item">
                    <label>Current Password</label>
                    <div className="password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="profile-input"
                        placeholder="Enter current password"
                      />
                      <button
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="detail-item">
                    <label>New Password</label>
                    <div className="password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="profile-input"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <div className="detail-item">
                    <label>Confirm New Password</label>
                    <div className="password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="profile-input"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <button className="save-btn" onClick={handleUpdatePassword}>
                    Update Password
                  </button>
                </div>

                <div className="detail-group">
                  <h3><FaShieldAlt /> Two-Factor Authentication</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Two-Factor Authentication</label>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Authenticator App</label>
                      <p>Use an authenticator app for 2FA codes</p>
                    </div>
                    <button className="action-btn outline">
                      <FaQrcode /> Setup
                    </button>
                  </div>
                </div>

                <div className="detail-group">
                  <h3>Security Questions</h3>
                  {securityQuestions.map((q, index) => (
                    <div className="detail-item" key={index}>
                      <label>{q.question}</label>
                      <input
                        type="password"
                        value={q.answer}
                        onChange={(e) => handleSecurityQuestionChange(index, e.target.value)}
                        className="profile-input"
                        placeholder="Enter your answer"
                      />
                    </div>
                  ))}
                  <button className="save-btn" onClick={handleSaveSecurityQuestions}>
                    Save Security Questions
                  </button>
                </div>

                <div className="detail-group">
                  <h3>Active Sessions</h3>
                  <div className="sessions-list">
                    <div className="session-item">
                      <div className="session-info">
                        <h4>Current Session</h4>
                        <p>Chrome on Windows • {new Date().toLocaleDateString()}</p>
                      </div>
                      <button className="action-btn danger">Logout</button>
                    </div>
                    <div className="session-item">
                      <div className="session-info">
                        <h4>Mobile Session</h4>
                        <p>Safari on iPhone • 2 days ago</p>
                      </div>
                      <button className="action-btn danger">Logout</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="preferences-settings">
                <div className="detail-group">
                  <h3><FaBell /> Notification Preferences</h3>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Email Notifications</label>
                      <p>Receive important updates via email</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={() => handleNotificationToggle('email')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Promotional Emails</label>
                      <p>Receive offers and promotions</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notifications.promotions}
                        onChange={() => handleNotificationToggle('promotions')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>SMS Notifications</label>
                      <p>Receive important updates via SMS</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={() => handleNotificationToggle('sms')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Push Notifications</label>
                      <p>Receive browser notifications</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={() => handleNotificationToggle('push')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="detail-group">
                  <h3><FaPalette /> Appearance</h3>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Theme</label>
                      <p>Choose how Pankhudi looks</p>
                    </div>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="theme-select"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>
                </div>

                <div className="detail-group">
                  <h3><FaGlobe /> Language & Region</h3>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Language</label>
                      <p>Choose your preferred language</p>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="language-select"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="hi">हिंदी</option>
                    </select>
                  </div>
                </div>

                <button className="save-btn" onClick={handleSavePreferences}>
                  Save Preferences
                </button>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="billing-settings">
                <div className="detail-group">
                  <h3><FaCreditCard /> Payment Methods</h3>

                  <div className="payment-method">
                    <div className="payment-method">
                      <div className="payment-info">
                        <h4>Visa ending in 4321</h4>
                        <p>Expires 12/2024</p>
                      </div>
                      <button className="action-btn">Edit</button>
                    </div>

                    <button className="add-payment-btn">
                      + Add Payment Method
                    </button>
                  </div>
                </div>

                <div className="detail-group">
                  <h3><FaCrown /> Subscription</h3>

                  <div className="subscription-info">
                    {user.isPremium ? (
                      <>
                        <div className="premium-status">
                          <FaCrown /> <span>Premium Plan</span>
                        </div>
                        <p>Your subscription will renew on January 15, 2024</p>
                        <button className="action-btn outline">Manage Subscription</button>
                      </>
                    ) : (
                      <>
                        <div className="standard-status">
                          <span>Free Plan</span>
                        </div>
                        <p>Upgrade to Premium for exclusive features</p>
                        <button className="upgrade-btn" onClick={handleUpgrade}>
                          <FaCrown /> Upgrade to Premium
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="detail-group">
                  <h3><FaHistory /> Billing History</h3>

                  <div className="billing-history">
                    <div className="billing-item">
                      <div className="billing-info">
                        <h4>Premium Subscription</h4>
                        <p>December 15, 2023</p>
                      </div>
                      <div className="billing-amount">₹250</div>
                    </div>

                    <div className="billing-item">
                      <div className="billing-info">
                        <h4>Premium Subscription</h4>
                        <p>November 15, 2023</p>
                      </div>
                      <div className="billing-amount">₹250</div>
                    </div>

                    <button className="action-btn outline">
                      View All Invoices
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="data-settings">
                <div className="detail-group">
                  <h3><FaDownload /> Export Data</h3>
                  <p>Download a copy of your personal data stored on Pankhudi</p>
                  <button className="action-btn" onClick={handleExportData}>
                    <FaDownload /> Export Data
                  </button>
                </div>

                <div className="detail-group">
                  <h3><FaTrash /> Delete Account</h3>
                  <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <button className="action-btn danger" onClick={handleDeleteAccount}>
                    <FaTrash /> Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;