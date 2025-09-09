import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaSignOutAlt,
  FaCrown,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "./Profile.css";

const API_BASE = "http://localhost:5000/api/profile";
const UPLOADS_BASE = "http://localhost:5000/"; // avatar images ka prefix

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

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

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
          console.error("Profile fetch failed:", res.data.message);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
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

      ["name", "email", "phone", "address", "password", "is_premium"].forEach(
        (field) => {
          if (formData[field] !== undefined) data.append(field, formData[field]);
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

  if (!user) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h2>Pankhudi</h2>
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
            <p className="success-msg">Profile updated successfully!</p>
          )}
          {saveStatus === "error" && (
            <p className="error-msg">Failed to update profile.</p>
          )}

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
          </div>

          {/* ✅ Fields */}
          {["name", "email", "phone", "address"].map((field) => (
            <div className="profile-item" key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
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
            <label>New Password</label>
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
            <label>Premium Status</label>
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
                  <FaSave /> Save
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
    </div>
  );
};

export default Profile;
