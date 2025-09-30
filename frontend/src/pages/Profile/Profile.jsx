import React, { useEffect, useState, useRef } from "react";
import {
  FaArrowLeft,
  FaSignOutAlt,
  FaCrown,
  FaEdit,
  FaSave,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
  FaBell,
  FaPalette,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaInstagram,
  FaQrcode,
  FaShareAlt,
  FaDownload
} from "react-icons/fa";
import { FaCopy } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible, AiFillSetting } from "react-icons/ai";
import { MdPrivacyTip, MdSecurity } from "react-icons/md";
import { RiVipCrownFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import QRCode from 'qrcode.react';
import { QRCodeSVG } from 'qrcode.react';
import "./Profile.css";

const API_BASE = "http://localhost:5000/api/profile";
const UPLOADS_BASE = "http://localhost:5000/";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("english");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  // ✅ Format date function
  const formatDate = (dateString) => {
    try {
      // Handle different date formats from API
      let dateValue = dateString;

      // If it's a Firebase timestamp or similar format
      if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
        dateValue = dateValue.seconds * 1000; // Convert to milliseconds
      }

      const date = new Date(dateValue);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Date formatting error:", error, dateString);
      return "Unknown date";
    }
  };

  // Add these new state variables for QR code
  const [qrValue, setQrValue] = useState('');
  const qrRef = useRef();

  // Update the QR value when user data is available
  useEffect(() => {
    if (user) {
      // Create a URL for the user's profile
      const profileUrl = `${window.location.origin}/user/${user.id}`;
      setQrValue(profileUrl);
    }
  }, [user]);

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    try {
      // Get SVG element
      const svgElement = qrRef.current.querySelector('svg');
      if (!svgElement) return;

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `${user.name || 'user'}_profile_qr.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up
      setTimeout(() => URL.revokeObjectURL(svgUrl), 100);
    } catch (err) {
      console.error('Error downloading QR code:', err);

      // Fallback: Create canvas from SVG for PNG download
      try {
        const svgElement = qrRef.current.querySelector('svg');
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const pngUrl = canvas.toDataURL('image/png');

          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `${user.name || 'user'}_profile_qr.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          // Clean up
          URL.revokeObjectURL(svgUrl);
        };
        img.src = svgUrl;
      } catch (fallbackErr) {
        console.error('Fallback QR download also failed:', fallbackErr);
      }
    }
  };

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setSessionExpired(true); // ✅ token missing
          return;
        }

        const res = await axios.get(API_BASE, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setUser(res.data.user);
          setFormData(res.data.user);

          if (res.data.user.avatar) {
            let avatarUrl = res.data.user.avatar;
            if (!avatarUrl.startsWith("http")) {
              avatarUrl = UPLOADS_BASE + avatarUrl.replace(/^\/+/, "");
            }
            setAvatarPreview(avatarUrl);
          }
        } else {
          // ✅ API responded but not success (session expired)
          setSessionExpired(true);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setSessionExpired(true); // ✅ handle errors like 401
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // ✅ Dropzone (upload image)
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setAvatarFile(acceptedFiles[0]);
        setAvatarPreview(URL.createObjectURL(acceptedFiles[0]));
      }
    },
  });

  // ✅ Save profile
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      ["name", "email", "phone", "address", "password", "is_premium", "bio", "website", "socialLinks"].forEach(
        (field) => {
          if (formData[field] !== undefined) {
            if (field === "socialLinks") {
              data.append(field, JSON.stringify(formData[field]));
            } else {
              data.append(field, formData[field]);
            }
          }
        }
      );

      if (avatarFile) {
        data.append("avatar", avatarFile, `avatar_${user.id}.jpg`);
      }

      const res = await axios.put(API_BASE, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setUser(res.data.user);
        setFormData(res.data.user);

        if (res.data.user.avatar) {
          let avatarUrl = res.data.user.avatar;
          if (!avatarUrl.startsWith("http")) {
            avatarUrl = UPLOADS_BASE + avatarUrl.replace(/^\/+/, "");
          }
          setAvatarPreview(avatarUrl);
        }

        setAvatarFile(null);
        setEditMode(false);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setSaveStatus("error");
    }
  };

  // ✅ Cancel edit
  const handleCancel = () => {
    setFormData(user);
    setAvatarFile(null);
    if (user?.avatar) {
      let avatarUrl = user.avatar;
      if (!avatarUrl.startsWith("http")) {
        avatarUrl = UPLOADS_BASE + avatarUrl.replace(/^\/+/, "");
      }
      setAvatarPreview(avatarUrl);
    }
    setEditMode(false);
  };

  useEffect(() => {
    if (sessionExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [sessionExpired]);
  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ Password strength
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthColor = (strength) =>
    ["#ccc", "red", "orange", "yellowgreen", "green"][strength];
  const passwordStrength = getPasswordStrength(formData.password || "");

  // ✅ Toggle premium status
  const togglePremium = () => {
    if (user.is_premium) {
      setFormData({
        ...formData,
        is_premium: 0
      });
    } else {
      // In a real app, this would redirect to a payment page
      alert("Redirecting to premium subscription page...");
    }
  };

  // ✅ Download profile as PDF/JSON
  const downloadProfile = (format) => {
    alert(`Downloading profile as ${format.toUpperCase()}...`);
    // Implementation would generate and download the file
  };

  // ✅ Share profile
  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s Profile`,
        text: `Check out ${user.name}'s profile on Pankhudi`,
        url: window.location.href,
      })
        .catch(error => console.log('Error sharing:', error));
    } else {
      alert("Web Share API not supported in your browser");
    }
  };

  // Enhanced copy function with better feedback
  const copyToClipboard = async (text, fieldName) => {
    if (!text || text === "Not provided") return;

    try {
      await navigator.clipboard.writeText(text);

      // Create a custom notification instead of using saveStatus
      const notification = document.createElement('div');
      notification.className = 'copy-notification';
      notification.innerHTML = `
      <div class="copy-notification-content">
        <span>✓</span>
        <p>${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} copied to clipboard!</p>
      </div>
    `;

      document.body.appendChild(notification);

      // Animate in
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);

      // Remove after delay
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 2000);

    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  // ✅ Show session expired message
  if (sessionExpired) {
    return (
      <div className="session-expired">
        <h2>Session Expired</h2>
        <p>Your session has expired. Please login again.</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }
  if (!user) return <div className="loading">Loading profile...</div>;

  return (
    <div className={`profile-page ${theme}`}>
      <div className="profile-header">
        <button className="back-bt" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2 className="brand-name">Pankhudi</h2>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading...
        </div>
      ) : (
        <div className="profile-container">
          {saveStatus === "success" && (
            <div className="status-message success">
              <p>Profile updated successfully!</p>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="status-message error">
              <p>Failed to update profile.</p>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="profile-tabs">
            <button
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              <FaUser /> Profile
            </button>
            <button
              className={activeTab === "settings" ? "active" : ""}
              onClick={() => setActiveTab("settings")}
            >
              <AiFillSetting /> Settings
            </button>
            <button
              className={activeTab === "privacy" ? "active" : ""}
              onClick={() => setActiveTab("privacy")}
            >
              <MdPrivacyTip /> Privacy
            </button>
          </div>

          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <div className="tab-content">
              {/* ✅ Avatar */}
              <div className="avatar-section">
                <div
                  className={`profile-avatar ${editMode ? "editable" : ""}`}
                  {...(editMode ? getRootProps() : {})}
                >
                  <input {...getInputProps()} />
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="avatar-image" />
                  ) : (
                    <div className="avatar-fallback">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  {editMode && (
                    <div className="avatar-overlay">
                      <FaEdit className="edit-icon" />
                      <p>Change Photo</p>
                    </div>
                  )}
                </div>

                <div className="profile-badges">
                  {user.is_premium === 1 && (
                    <div className="premium-badge">
                      <RiVipCrownFill /> Premium Member
                    </div>
                  )}
                  <div className="member-since">
                    {user.createdAt
                      ? `Member since ${formatDate(user.createdAt)}`
                      : user.registrationDate
                        ? `Member since ${formatDate(user.registrationDate)}`
                        : "Active member"
                    }
                  </div>
                </div>
              </div>

              {/* ✅ Quick Actions */}
              <div className="quick-actions">
                <button className="action-btn" onClick={shareProfile}>
                  <FaShareAlt /> Share Profile
                </button>
                <button className="action-btn" onClick={() => downloadProfile('pdf')}>
                  <FaDownload /> Download PDF
                </button>
                {user.is_premium === 1 ? (
                  <button className="action-btn premium" onClick={togglePremium}>
                    <FaCrown /> Manage Premium
                  </button>
                ) : (
                  <button className="action-btn upgrade" onClick={togglePremium}>
                    <FaCrown /> Upgrade to Premium
                  </button>
                )}
              </div>

              {/* ✅ Fields */}

// Update your field mapping code with copy functionality
              {["name", "email", "phone", "address"].map((field) => (
                <div className="profile-item" key={field}>
                  <div className="field-header">
                    <label>
                      {field === "name" && <FaUser />}
                      {field === "email" && <FaEnvelope />}
                      {field === "phone" && <FaPhone />}
                      {field === "address" && <FaMapMarkerAlt />}
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    {!editMode && user[field] && user[field] !== "Not provided" && (
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(user[field], field)}
                        title={`Copy ${field}`}
                      >
                        <FaCopy />
                      </button>
                    )}
                  </div>
                  {editMode ? (
                    field === "address" ? (
                      <textarea
                        value={formData[field] || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                      />
                    ) : (
                      <input
                        type={field === "email" ? "email" : "text"}
                        value={formData[field] || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                      />
                    )
                  ) : (
                    <p>{user[field] || "Not provided"}</p>
                  )}
                </div>
              ))}
              {/* ✅ Password */}
              <div className="profile-item">
                <label><FaLock /> New Password</label>
                {editMode ? (
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Enter new password"
                    />
                    <span
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                    </span>
                  </div>
                ) : (
                  <p>********</p>
                )}
                {editMode && formData.password && (
                  <div className="password-strength-container">
                    <div
                      className="password-strength"
                      style={{
                        width: `${(passwordStrength / 4) * 100}%`,
                        background: strengthColor(passwordStrength),
                      }}
                    ></div>
                    <div className="password-strength-labels">
                      <span
                        style={{
                          color: strengthColor(
                            passwordStrength >= 1 ? passwordStrength : 0
                          ),
                        }}
                      >
                        Weak
                      </span>
                      <span
                        style={{
                          color: strengthColor(
                            passwordStrength >= 3 ? passwordStrength : 0
                          ),
                        }}
                      >
                        Strong
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ Premium */}
              <div className="profile-item premium-item">
                <label><RiVipCrownFill /> Premium Status</label>
                {editMode ? (
                  <select
                    value={formData.is_premium || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_premium: Number(e.target.value),
                      })
                    }
                  >
                    <option value={0}>Standard</option>
                    <option value={1}>Premium</option>
                  </select>
                ) : user.is_premium === 1 ? (
                  <p className="premium-badge">
                    <FaCrown /> Premium User
                  </p>
                ) : (
                  <p>Standard User</p>
                )}
              </div>

              {/* ✅ Actions */}
              <div className="profile-actions">
                {editMode ? (
                  <>
                    <button className="save-btn" onClick={handleSave}>
                      <FaSave /> Save Changes
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="edit-btn" onClick={() => setEditMode(true)}>
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab Content */}
          {activeTab === "settings" && (
            <div className="tab-content">
              <h3>Account Settings</h3>

              <div className="settings-group">
                <h4><FaPalette /> Appearance</h4>
                <div className="setting-item">
                  <label>Theme</label>
                  <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">System Default</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                  </select>
                </div>
              </div>

              <div className="settings-group">
                <h4><FaBell /> Notifications</h4>
                <div className="setting-item toggle">
                  <label>Email Notifications</label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={() => setNotifications({ ...notifications, email: !notifications.email })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label>Push Notifications</label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={() => setNotifications({ ...notifications, push: !notifications.push })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item toggle">
                  <label>SMS Notifications</label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h4><FaQrcode /> QR Code</h4>
                <div className="qrcode-section">
                  <div className="qrcode-placeholder">
                    <p>Your Profile QR Code</p>
                    <div className="qrcode-image" ref={qrRef}>
                      {qrValue ? (
                        <QRCodeSVG
                          value={qrValue}
                          size={150}
                          level="H"
                          includeMargin
                        />
                      ) : (
                        <span>Loading QR Code...</span>
                      )}
                    </div>
                  </div>
                  <button className="download-qr" onClick={downloadQRCode}>
                    <FaDownload /> Download QR Code
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Privacy Tab Content */}
          {activeTab === "privacy" && (
            <div className="tab-content">
              <h3>Privacy & Security</h3>

              <div className="settings-group">
                <h4><MdSecurity /> Security</h4>
                <div className="setting-item">
                  <label>Two-Factor Authentication</label>
                  <button className="action-btn">Enable 2FA</button>
                </div>

                <div className="setting-item">
                  <label>Login Activity</label>
                  <button className="action-btn">View Recent Activity</button>
                </div>

                <div className="setting-item">
                  <label>Active Sessions</label>
                  <button className="action-btn">Manage Sessions</button>
                </div>
              </div>

              <div className="settings-group">
                <h4>Data & Privacy</h4>
                <div className="setting-item">
                  <label>Download Your Data</label>
                  <button className="action-btn" onClick={() => downloadProfile('json')}>
                    Request Data Download
                  </button>
                </div>

                <div className="setting-item">
                  <label>Delete Account</label>
                  <button className="action-btn danger">Delete My Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;