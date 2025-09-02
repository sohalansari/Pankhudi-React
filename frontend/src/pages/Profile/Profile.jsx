import React, { useEffect, useState } from "react";
import {
  FaArrowLeft, FaCopy, FaEdit, FaSave, FaUser, FaCrown,
  FaCheck, FaTimes, FaEye, FaEyeSlash, FaUpload, FaSignOutAlt,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaUserTag
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

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (currentUser && currentUser.email) {
        setUser(currentUser);
        setFormData(currentUser);
        calculateProfileCompletion(currentUser);
      } else {
        // If "user" key not found, check registeredUsers
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
        const rememberedEmail = localStorage.getItem("rememberedEmail");

        const foundUser = registeredUsers.find((u) => u.email === rememberedEmail);
        if (foundUser) {
          setUser(foundUser);
          setFormData(foundUser);
          calculateProfileCompletion(foundUser);
        }
      }
    };

    loadUserData();
  }, []);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData) => {
    const fields = ['name', 'email', 'phone', 'address'];
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
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Input change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedUser = { ...formData, profileImage: event.target.result };
        setFormData(updatedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save updated profile
  const handleSave = () => {
    const updatedUser = { ...formData, lastUpdated: new Date().toISOString() };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Update registeredUsers as well
    let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
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
    navigate("/");
  };

  // Upgrade to premium
  const handleUpgrade = () => {
    const updatedUser = { ...user, isPremium: true };
    setUser(updatedUser);
    setFormData(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    registeredUsers = registeredUsers.map((u) =>
      u.email === user.email ? updatedUser : u
    );
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    setSaveStatus("upgraded");
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
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="site-name">Pankhudi</h2>
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
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" />
                ) : (
                  <FaUser />
                )}
                {editMode && (
                  <label className="avatar-upload">
                    <FaUpload />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
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
              <FaUserTag /> Preferences
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {/* Save Status Notification */}
          {saveStatus === "success" && (
            <div className="save-notification success">
              Profile updated successfully!
            </div>
          )}

          {saveStatus === "upgraded" && (
            <div className="save-notification success">
              <FaCrown /> Congratulations! You've upgraded to Premium!
            </div>
          )}

          {/* Profile Content */}
          <div className="profile-content-card">
            <div className="card-header">
              <h2>
                {activeTab === "profile" && "Personal Information"}
                {activeTab === "security" && "Security Settings"}
                {activeTab === "preferences" && "Preferences"}
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
                  <h3><FaLock /> Password</h3>

                  <div className="detail-item">
                    <label>Current Password</label>
                    <div className="password-field">
                      <input
                        type={showPassword ? "text" : "password"}
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
                        className="profile-input"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <button className="save-btn">
                    Update Password
                  </button>
                </div>

                <div className="detail-group">
                  <h3>Two-Factor Authentication</h3>
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
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="preferences-settings">
                <div className="detail-group">
                  <h3>Notification Preferences</h3>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Email Notifications</label>
                      <p>Receive important updates via email</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Promotional Emails</label>
                      <p>Receive offers and promotions</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>SMS Notifications</label>
                      <p>Receive important updates via SMS</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="detail-group">
                  <h3>Privacy Settings</h3>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Profile Visibility</label>
                      <p>Make your profile visible to other users</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Data Sharing</label>
                      <p>Allow usage data to improve our services</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <button className="save-btn">
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;