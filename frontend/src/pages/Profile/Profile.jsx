// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import {
//   FaArrowLeft,
//   FaCrown,
//   FaEdit,
//   FaSave,
//   FaUser,
//   FaEnvelope,
//   FaPhone,
//   FaMapMarkerAlt,
//   FaLock,
//   FaBell,
//   FaPalette,
//   FaQrcode,
//   FaShareAlt,
//   FaDownload,
//   FaPlus,
//   FaTrash,
//   FaHome,
//   FaBriefcase,
//   FaMapPin,
//   FaCheck,
//   FaCopy,
//   FaRegEdit,
//   FaTimes,
//   FaExclamationTriangle,
//   FaHistory,
//   FaShieldAlt,
//   FaPowerOff,
//   FaKey,
//   FaClock,
//   FaDesktop,
//   FaMobileAlt,
//   FaGlobe,
//   FaLanguage,
//   FaEye,
//   FaEyeSlash,
//   FaMap,
//   FaDatabase,
//   FaSync,
//   FaRedo,
//   FaExclamationCircle,
//   FaInfoCircle,
//   FaSpinner
// } from "react-icons/fa";
// import { AiFillEye, AiFillEyeInvisible, AiFillSetting } from "react-icons/ai";
// import { MdPrivacyTip, MdSecurity, MdLocationOn } from "react-icons/md";
// import { RiVipCrownFill } from "react-icons/ri";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useDropzone } from "react-dropzone";
// import { QRCodeSVG } from 'qrcode.react';
// import "./Profile.css";

// // ============================================
// // API CONFIGURATION
// // ============================================
// const API_CONFIG = {
//   BASE: "http://localhost:5000/api",
//   PROFILE: "http://localhost:5000/api/profile",
//   PROFILE_AVATAR: "http://localhost:5000/api/profile/avatar",
//   PROFILE_PASSWORD: "http://localhost:5000/api/profile/password",

//   // Address endpoints
//   ADDRESS_LIST: "http://localhost:5000/api/address",
//   ADDRESS_CREATE: "http://localhost:5000/api/address",
//   ADDRESS_UPDATE: "http://localhost:5000/api/address",
//   ADDRESS_DELETE: "http://localhost:5000/api/address",
//   ADDRESS_DEFAULT: "http://localhost:5000/api/address",

//   UPLOADS: "http://localhost:5000/",

//   // Settings endpoints
//   SETTINGS_GET: "http://localhost:5000/api/settings/get",
//   SETTINGS_UPDATE: "http://localhost:5000/api/settings/update",

//   // Security endpoints
//   LOGIN_ACTIVITY: "http://localhost:5000/api/security/login-activity",
//   SESSIONS: "http://localhost:5000/api/security/sessions",
//   TWO_FA_STATUS: "http://localhost:5000/api/security/two-fa/status",
//   TWO_FA_SETUP: "http://localhost:5000/api/security/two-fa/setup",
//   TWO_FA_VERIFY: "http://localhost:5000/api/security/two-fa/verify",
//   TWO_FA_DISABLE: "http://localhost:5000/api/security/two-fa/disable",
//   TWO_FA_BACKUP_CODES: "http://localhost:5000/api/security/two-fa/backup-codes",
//   ACCOUNT_DELETE: "http://localhost:5000/api/account"
// };

// // ============================================
// // TAB CONFIGURATION
// // ============================================
// const PROFILE_TABS = [
//   { id: "profile", label: "Profile", icon: FaUser },
//   { id: "settings", label: "Settings", icon: AiFillSetting },
//   { id: "privacy", label: "Privacy & Security", icon: MdPrivacyTip },
//   { id: "addresses", label: "Addresses", icon: FaMapMarkerAlt }
// ];

// // ============================================
// // ADDRESS FORM MODAL COMPONENT
// // ============================================
// const AddressFormModal = ({ isOpen, editingAddress, addressForm, onInputChange, onSave, onClose, loading }) => {
//   const modalRef = useRef(null);

//   useEffect(() => {
//     const handleEscape = (e) => {
//       if (e.key === 'Escape') onClose();
//     };

//     if (isOpen) {
//       document.addEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'hidden';
//     }

//     return () => {
//       document.removeEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   return (
//     <div className="profile-modal-overlay active" onClick={onClose}>
//       <div className="profile-modal-content active" ref={modalRef} onClick={(e) => e.stopPropagation()}>
//         <div className="profile-modal-header">
//           <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
//           <button className="profile-close-modal" onClick={onClose}>
//             <FaTimes />
//           </button>
//         </div>

//         <div className="profile-modal-body">
//           <div className="profile-address-form">
//             <div className="profile-form-row">
//               <div className="profile-form-group">
//                 <label>Address Type *</label>
//                 <select
//                   name="address_type"
//                   className="profile-form-control"
//                   value={addressForm.address_type}
//                   onChange={onInputChange}
//                   disabled={loading}
//                 >
//                   <option value="home">Home</option>
//                   <option value="work">Work</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               <div className="profile-form-group">
//                 <label>Set as Default</label>
//                 <div className="profile-checkbox-container">
//                   <input
//                     type="checkbox"
//                     name="is_default"
//                     id="profile_is_default"
//                     checked={addressForm.is_default === 1 || addressForm.is_default === true}
//                     onChange={(e) => onInputChange({
//                       target: {
//                         name: 'is_default',
//                         type: 'checkbox',
//                         checked: e.target.checked
//                       }
//                     })}
//                     disabled={loading}
//                   />
//                   <label htmlFor="profile_is_default">Make this my default address</label>
//                 </div>
//               </div>
//             </div>

//             <div className="profile-form-row">
//               <div className="profile-form-group">
//                 <label htmlFor="profile_full_name">Full Name *</label>
//                 <input
//                   type="text"
//                   name="full_name"
//                   id="profile_full_name"
//                   className="profile-form-control"
//                   value={addressForm.full_name}
//                   onChange={onInputChange}
//                   placeholder="Enter full name"
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               <div className="profile-form-group">
//                 <label htmlFor="profile_phone">Phone Number *</label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   id="profile_phone"
//                   className="profile-form-control"
//                   value={addressForm.phone}
//                   onChange={onInputChange}
//                   placeholder="Enter phone number"
//                   required
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             <div className="profile-form-group">
//               <label htmlFor="profile_address_line">Address Line *</label>
//               <textarea
//                 name="address_line"
//                 id="profile_address_line"
//                 className="profile-form-control"
//                 value={addressForm.address_line}
//                 onChange={onInputChange}
//                 placeholder="House no., Building, Street, Area"
//                 rows="3"
//                 required
//                 disabled={loading}
//               />
//             </div>

//             <div className="profile-form-row">
//               <div className="profile-form-group">
//                 <label htmlFor="profile_city">City *</label>
//                 <input
//                   type="text"
//                   name="city"
//                   id="profile_city"
//                   className="profile-form-control"
//                   value={addressForm.city}
//                   onChange={onInputChange}
//                   placeholder="Enter city"
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               <div className="profile-form-group">
//                 <label htmlFor="profile_state">State *</label>
//                 <input
//                   type="text"
//                   name="state"
//                   id="profile_state"
//                   className="profile-form-control"
//                   value={addressForm.state}
//                   onChange={onInputChange}
//                   placeholder="Enter state"
//                   required
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             <div className="profile-form-row">
//               <div className="profile-form-group">
//                 <label htmlFor="profile_postal_code">Postal Code *</label>
//                 <input
//                   type="text"
//                   name="postal_code"
//                   id="profile_postal_code"
//                   className="profile-form-control"
//                   value={addressForm.postal_code}
//                   onChange={onInputChange}
//                   placeholder="Enter postal code"
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               <div className="profile-form-group">
//                 <label htmlFor="profile_country">Country</label>
//                 <input
//                   type="text"
//                   name="country"
//                   id="profile_country"
//                   className="profile-form-control"
//                   value={addressForm.country}
//                   onChange={onInputChange}
//                   placeholder="Enter country"
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             <div className="profile-form-actions">
//               <button
//                 className="profile-btn profile-btn-secondary"
//                 onClick={onClose}
//                 disabled={loading}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="profile-btn profile-btn-success"
//                 onClick={onSave}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <FaSpinner className="profile-spin" /> Saving...
//                   </>
//                 ) : (
//                   <>
//                     <FaSave /> {editingAddress ? 'Update Address' : 'Save Address'}
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // 2FA MODAL COMPONENT
// // ============================================
// const TwoFAModal = ({ isOpen, onClose, onEnable2FA, user }) => {
//   const [step, setStep] = useState(1);
//   const [qrCode, setQrCode] = useState('');
//   const [secret, setSecret] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [backupCodes, setBackupCodes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [verificationError, setVerificationError] = useState('');

//   const getAuthHeaders = () => ({
//     Authorization: `Bearer ${localStorage.getItem("token")}`,
//     'Content-Type': 'application/json'
//   });

//   useEffect(() => {
//     if (isOpen) {
//       setStep(1);
//       setVerificationCode('');
//       setVerificationError('');
//       generate2FAQRCode();
//     } else {
//       setStep(1);
//       setQrCode('');
//       setSecret('');
//       setVerificationCode('');
//       setBackupCodes([]);
//       setVerificationError('');
//     }
//   }, [isOpen]);

//   const generate2FAQRCode = async () => {
//     try {
//       setLoading(true);
//       setVerificationError('');
//       const response = await axios.get(API_CONFIG.TWO_FA_SETUP, {
//         headers: getAuthHeaders()
//       });

//       if (response.data.success) {
//         const qrData = `otpauth://totp/Pankhudi:${user?.email || 'user'}?secret=${response.data.secret}&issuer=Pankhudi`;
//         setQrCode(qrData);
//         setSecret(response.data.secret);
//       }
//     } catch (error) {
//       console.error('2FA Setup Error:', error);
//       const mockSecret = generateRandomSecret();
//       const qrData = `otpauth://totp/Pankhudi:${user?.email || 'user'}?secret=${mockSecret}&issuer=Pankhudi`;
//       setQrCode(qrData);
//       setSecret(mockSecret);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateRandomSecret = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
//     let secret = '';
//     for (let i = 0; i < 16; i++) {
//       secret += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return secret;
//   };

//   const verify2FA = async () => {
//     if (!verificationCode || verificationCode.length !== 6) {
//       setVerificationError('Please enter a valid 6-digit code');
//       return;
//     }

//     try {
//       setLoading(true);
//       setVerificationError('');

//       const response = await axios.post(API_CONFIG.TWO_FA_VERIFY, {
//         code: verificationCode
//       }, {
//         headers: getAuthHeaders()
//       });

//       if (response.data.success) {
//         const codes = response.data.backupCodes || generateBackupCodes();
//         setBackupCodes(codes);

//         try {
//           await axios.post(API_CONFIG.TWO_FA_BACKUP_CODES, {
//             backupCodes: codes
//           }, {
//             headers: getAuthHeaders()
//           });
//         } catch (saveError) {
//           console.warn('Failed to save backup codes:', saveError);
//         }

//         setStep(3);
//         onEnable2FA();
//       } else {
//         setVerificationError('Invalid verification code. Please try again.');
//       }
//     } catch (error) {
//       console.error('2FA Verification Error:', error);
//       setVerificationError(
//         error.response?.data?.message || 'Verification failed. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateBackupCodes = () => {
//     const codes = [];
//     for (let i = 0; i < 8; i++) {
//       const code = Math.random().toString(36).substring(2, 10).toUpperCase();
//       codes.push(code);
//     }
//     return codes;
//   };

//   const copyBackupCodes = () => {
//     navigator.clipboard.writeText(backupCodes.join('\n'))
//       .then(() => alert('Backup codes copied to clipboard!'))
//       .catch(() => alert('Failed to copy codes'));
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="profile-modal-overlay active" onClick={onClose}>
//       <div className="profile-modal-content active profile-security-modal" onClick={e => e.stopPropagation()}>
//         <div className="profile-modal-header">
//           <h3><FaShieldAlt /> Two-Factor Authentication</h3>
//           <button className="profile-close-modal" onClick={onClose}>
//             <FaTimes />
//           </button>
//         </div>

//         <div className="profile-modal-body">
//           {step === 1 && (
//             <div className="profile-security-step">
//               <h4>Step 1: Scan QR Code</h4>
//               <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>

//               {loading ? (
//                 <div className="profile-loading-qr">
//                   <FaSpinner className="profile-spin" /> Generating QR Code...
//                 </div>
//               ) : (
//                 <>
//                   <div className="profile-qrcode-container">
//                     {qrCode ? (
//                       <QRCodeSVG value={qrCode} size={200} />
//                     ) : (
//                       <div className="profile-loading-qr">Failed to generate QR code</div>
//                     )}
//                   </div>
//                   <div className="profile-secret-key">
//                     <p>Or enter this secret key manually:</p>
//                     <code className="profile-secret-code">{secret}</code>
//                     <button
//                       className="profile-btn profile-btn-sm profile-btn-secondary"
//                       onClick={() => {
//                         navigator.clipboard.writeText(secret);
//                         alert('Secret key copied to clipboard!');
//                       }}
//                     >
//                       <FaCopy /> Copy Secret
//                     </button>
//                   </div>
//                 </>
//               )}

//               <div className="profile-modal-actions">
//                 <button
//                   className="profile-btn profile-btn-primary"
//                   onClick={() => setStep(2)}
//                   disabled={loading || !qrCode}
//                 >
//                   Next: Verify Code
//                 </button>
//               </div>
//             </div>
//           )}

//           {step === 2 && (
//             <div className="profile-security-step">
//               <h4>Step 2: Verify Code</h4>
//               <p>Enter the 6-digit code from your authenticator app:</p>

//               {verificationError && (
//                 <div className="profile-error-message">
//                   <FaExclamationCircle /> {verificationError}
//                 </div>
//               )}

//               <input
//                 type="text"
//                 className="profile-form-control"
//                 placeholder="000000"
//                 value={verificationCode}
//                 onChange={(e) => {
//                   setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
//                   setVerificationError('');
//                 }}
//                 maxLength={6}
//                 disabled={loading}
//                 autoFocus
//               />

//               <div className="profile-modal-actions">
//                 <button
//                   className="profile-btn profile-btn-secondary"
//                   onClick={() => setStep(1)}
//                   disabled={loading}
//                 >
//                   Back
//                 </button>
//                 <button
//                   className="profile-btn profile-btn-primary"
//                   onClick={verify2FA}
//                   disabled={loading || verificationCode.length !== 6}
//                 >
//                   {loading ? (
//                     <>
//                       <FaSpinner className="profile-spin" /> Verifying...
//                     </>
//                   ) : (
//                     'Verify & Enable'
//                   )}
//                 </button>
//               </div>

//               <p className="profile-help-text">
//                 <FaInfoCircle /> Can't scan the code? Make sure your authenticator app
//                 shows a 6-digit code that changes every 30 seconds.
//               </p>
//             </div>
//           )}

//           {step === 3 && (
//             <div className="profile-security-step">
//               <h4>Step 3: Save Backup Codes</h4>
//               <p className="profile-warning-text">
//                 <FaExclamationTriangle /> Save these backup codes in a secure place.
//                 Each code can be used only once to access your account if you lose your phone.
//               </p>

//               <div className="profile-backup-codes">
//                 {backupCodes.map((code, index) => (
//                   <div className="profile-backup-code" key={index}>
//                     {code}
//                   </div>
//                 ))}
//               </div>

//               <div className="profile-modal-actions">
//                 <button
//                   className="profile-btn profile-btn-secondary"
//                   onClick={copyBackupCodes}
//                 >
//                   <FaCopy /> Copy All Codes
//                 </button>
//                 <button
//                   className="profile-btn profile-btn-success"
//                   onClick={onClose}
//                 >
//                   Done
//                 </button>
//               </div>

//               <p className="profile-success-message">
//                 <FaCheck /> Two-factor authentication has been successfully enabled!
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // ACTIVITY LOG MODAL COMPONENT
// // ============================================
// const ActivityLogModal = ({ isOpen, onClose, activities, loading }) => {
//   if (!isOpen) return null;

//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return 'Unknown date';
//     const date = new Date(timestamp);
//     return date.toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'success':
//         return 'profile-status-success';
//       case 'failed':
//         return 'profile-status-failed';
//       default:
//         return 'profile-status-unknown';
//     }
//   };

//   return (
//     <div className="profile-modal-overlay active" onClick={onClose}>
//       <div className="profile-modal-content active profile-activity-modal" onClick={e => e.stopPropagation()}>
//         <div className="profile-modal-header">
//           <h3><FaHistory /> Login Activity</h3>
//           <button className="profile-close-modal" onClick={onClose}>
//             <FaTimes />
//           </button>
//         </div>

//         <div className="profile-modal-body">
//           {loading ? (
//             <div className="profile-loading-addresses">
//               <div className="profile-spinner"></div>
//               <p>Loading login activity...</p>
//             </div>
//           ) : activities.length === 0 ? (
//             <div className="profile-no-activity">
//               <p>No login activity found</p>
//             </div>
//           ) : (
//             <div className="profile-activity-list">
//               {activities.map((activity, index) => (
//                 <div className="profile-activity-item" key={activity.id || index}>
//                   <div className="profile-activity-icon">
//                     {activity.device_type === 'mobile' ? <FaMobileAlt /> : <FaDesktop />}
//                   </div>
//                   <div className="profile-activity-details">
//                     <h4>{activity.action || 'Login'} from {activity.browser || 'Unknown Browser'}</h4>
//                     <p>{activity.os || 'Unknown OS'} • {activity.location || 'Unknown Location'}</p>
//                     <div className="profile-activity-meta">
//                       <span className="profile-activity-time">
//                         <FaClock /> {formatTimestamp(activity.timestamp)}
//                       </span>
//                       <span className="profile-activity-ip">
//                         <FaDatabase /> IP: {activity.ip_address || 'Unknown'}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="profile-activity-status">
//                     <span className={`profile-status-badge ${getStatusColor(activity.status)}`}>
//                       {activity.status || 'Unknown'}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // SESSIONS MODAL COMPONENT
// // ============================================
// const SessionsModal = ({ isOpen, onClose, sessions, onRevokeSession, loading }) => {
//   if (!isOpen) return null;

//   const formatLastActive = (timestamp) => {
//     if (!timestamp) return 'Never';
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);

//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins} minutes ago`;
//     if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
//     return `${Math.floor(diffMins / 1440)} days ago`;
//   };

//   return (
//     <div className="profile-modal-overlay active" onClick={onClose}>
//       <div className="profile-modal-content active profile-sessions-modal" onClick={e => e.stopPropagation()}>
//         <div className="profile-modal-header">
//           <h3><FaDesktop /> Active Sessions</h3>
//           <button className="profile-close-modal" onClick={onClose}>
//             <FaTimes />
//           </button>
//         </div>

//         <div className="profile-modal-body">
//           {loading ? (
//             <div className="profile-loading-addresses">
//               <div className="profile-spinner"></div>
//               <p>Loading active sessions...</p>
//             </div>
//           ) : sessions.length === 0 ? (
//             <div className="profile-no-sessions">
//               <p>No active sessions found</p>
//             </div>
//           ) : (
//             <div className="profile-sessions-list">
//               {sessions.map((session, index) => (
//                 <div
//                   className={`profile-session-item ${session.current ? 'profile-current-session' : ''}`}
//                   key={session.id || index}
//                 >
//                   <div className="profile-session-icon">
//                     {session.device_type === 'mobile' ? <FaMobileAlt /> : <FaDesktop />}
//                   </div>
//                   <div className="profile-session-details">
//                     <h4>{session.browser || 'Unknown Browser'} on {session.os || 'Unknown OS'}</h4>
//                     <div className="profile-session-meta">
//                       <p className="profile-session-location">
//                         <MdLocationOn /> IP: {session.ip_address || 'Unknown'}
//                       </p>
//                       <p className="profile-session-time">
//                         <FaClock /> Last active: {formatLastActive(session.last_active)}
//                       </p>
//                     </div>
//                     {session.current && (
//                       <span className="profile-current-badge">Current Session</span>
//                     )}
//                   </div>
//                   <div className="profile-session-actions">
//                     {!session.current && (
//                       <button
//                         className="profile-btn profile-btn-danger profile-btn-sm"
//                         onClick={() => onRevokeSession(session.id)}
//                         title="Revoke this session"
//                       >
//                         <FaPowerOff /> Revoke
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // DELETE ACCOUNT MODAL COMPONENT
// // ============================================
// const DeleteAccountModal = ({ isOpen, onClose, onDeleteAccount }) => {
//   const [confirmationText, setConfirmationText] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);

//   const handleDelete = async () => {
//     if (confirmationText !== 'DELETE MY ACCOUNT') {
//       alert('Please type "DELETE MY ACCOUNT" to confirm');
//       return;
//     }

//     if (!password) {
//       alert('Please enter your password');
//       return;
//     }

//     try {
//       setLoading(true);
//       await onDeleteAccount(password);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="profile-modal-overlay active" onClick={onClose}>
//       <div className="profile-modal-content active profile-delete-modal" onClick={e => e.stopPropagation()}>
//         <div className="profile-modal-header">
//           <h3><FaExclamationTriangle /> Delete Account</h3>
//           <button className="profile-close-modal" onClick={onClose}>
//             <FaTimes />
//           </button>
//         </div>

//         <div className="profile-modal-body">
//           {step === 1 && (
//             <>
//               <div className="profile-warning-section">
//                 <div className="profile-warning-icon">
//                   <FaExclamationTriangle />
//                 </div>
//                 <h4>Warning: This action is irreversible!</h4>
//                 <p>Deleting your account will:</p>
//                 <ul className="profile-delete-consequences">
//                   <li>Deactivate your account (soft delete)</li>
//                   <li>Deactivate all your addresses</li>
//                   <li>Remove your personal data</li>
//                   <li>Cancel any active subscriptions</li>
//                   <li>Remove your access to the platform</li>
//                 </ul>
//               </div>

//               <div className="profile-confirmation-input">
//                 <p>Type <strong>DELETE MY ACCOUNT</strong> to confirm:</p>
//                 <input
//                   type="text"
//                   className="profile-form-control"
//                   value={confirmationText}
//                   onChange={(e) => setConfirmationText(e.target.value)}
//                   placeholder="DELETE MY ACCOUNT"
//                 />
//               </div>

//               <div className="profile-modal-actions">
//                 <button className="profile-btn profile-btn-secondary" onClick={onClose}>
//                   Cancel
//                 </button>
//                 <button
//                   className="profile-btn profile-btn-danger"
//                   onClick={() => setStep(2)}
//                   disabled={confirmationText !== 'DELETE MY ACCOUNT'}
//                 >
//                   Continue to Security Check
//                 </button>
//               </div>
//             </>
//           )}

//           {step === 2 && (
//             <>
//               <div className="profile-security-check">
//                 <h4>Security Verification</h4>
//                 <p>For security, please enter your password:</p>
//                 <div className="profile-password-input">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     className="profile-form-control"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your current password"
//                     disabled={loading}
//                   />
//                   <button
//                     className="profile-toggle-password"
//                     onClick={() => setShowPassword(!showPassword)}
//                     type="button"
//                   >
//                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </button>
//                 </div>
//               </div>

//               <div className="profile-modal-actions">
//                 <button
//                   className="profile-btn profile-btn-secondary"
//                   onClick={() => setStep(1)}
//                   disabled={loading}
//                 >
//                   Back
//                 </button>
//                 <button
//                   className="profile-btn profile-btn-danger"
//                   onClick={handleDelete}
//                   disabled={!password || loading}
//                 >
//                   {loading ? 'Deleting...' : 'Permanently Delete Account'}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================
// // ADDRESS CARD COMPONENT
// // ============================================
// const AddressCard = ({ address, getAddressTypeIcon, onEdit, onDelete, onSetDefault, onCopy }) => (
//   <div className={`profile-address-card ${address.is_default ? 'profile-default-address' : ''}`}>
//     <div className="profile-address-header">
//       <div className="profile-address-type">
//         {getAddressTypeIcon(address.address_type)}
//         <span className="profile-type-text">
//           {address.address_type ? address.address_type.charAt(0).toUpperCase() + address.address_type.slice(1) : 'Home'}
//           {address.is_default && <span className="profile-default-badge">Default</span>}
//         </span>
//       </div>
//       <div className="profile-address-actions">
//         <button
//           className="profile-action-icon-btn profile-copy-btn"
//           onClick={() => onCopy(address)}
//           title="Copy address"
//         >
//           <FaCopy />
//         </button>
//         <button
//           className="profile-action-icon-btn profile-edit-btn"
//           onClick={() => onEdit(address)}
//           title="Edit address"
//         >
//           <FaRegEdit />
//         </button>
//         <button
//           className="profile-action-icon-btn profile-delete-btn"
//           onClick={() => onDelete(address.id)}
//           title="Delete address"
//         >
//           <FaTrash />
//         </button>
//       </div>
//     </div>

//     <div className="profile-address-body">
//       <div className="profile-address-name-phone">
//         <h4>{address.full_name}</h4>
//         <p className="profile-phone">{address.phone}</p>
//       </div>

//       <div className="profile-address-details">
//         <p>{address.address_line}</p>
//         <p className="profile-city-state">
//           {address.city}, {address.state} - {address.postal_code}
//         </p>
//         <p className="profile-country">{address.country || 'India'}</p>
//       </div>

//       {!address.is_default && (
//         <button
//           className="profile-btn profile-btn-outline profile-btn-sm"
//           onClick={() => onSetDefault(address.id)}
//         >
//           <FaCheck /> Set as Default
//         </button>
//       )}
//     </div>

//     <div className="profile-address-footer">
//       <span className="profile-address-date">
//         Added: {new Date(address.created_at || Date.now()).toLocaleDateString()}
//       </span>
//       {address.is_default && (
//         <span className="profile-default-indicator">
//           <FaCheck /> Default Shipping Address
//         </span>
//       )}
//     </div>
//   </div>
// );

// // ============================================
// // MAIN PROFILE COMPONENT
// // ============================================
// const Profile = () => {
//   const navigate = useNavigate();

//   // User and Profile State
//   const [user, setUser] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [formData, setFormData] = useState({});
//   const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [avatarFile, setAvatarFile] = useState(null);
//   const [avatarPreview, setAvatarPreview] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [sessionExpired, setSessionExpired] = useState(false);

//   // Settings State
//   const [settings, setSettings] = useState({
//     theme: "light",
//     language: "english",
//     notifications: {
//       email: true,
//       push: true,
//       sms: false,
//       marketing: false,
//       updates: true
//     },
//     privacy: {
//       profile_visibility: "public",
//       show_online_status: true,
//       allow_tagging: true,
//       search_visibility: true,
//       data_sharing: false
//     }
//   });

//   // Security State
//   const [twoFAEnabled, setTwoFAEnabled] = useState(false);
//   const [show2FAModal, setShow2FAModal] = useState(false);
//   const [showActivityModal, setShowActivityModal] = useState(false);
//   const [showSessionsModal, setShowSessionsModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [loginActivities, setLoginActivities] = useState([]);
//   const [activeSessions, setActiveSessions] = useState([]);
//   const [securityLoading, setSecurityLoading] = useState(false);

//   // Address State
//   const [userAddresses, setUserAddresses] = useState([]);
//   const [addressLoading, setAddressLoading] = useState(false);
//   const [addressSaving, setAddressSaving] = useState(false);
//   const [showAddressForm, setShowAddressForm] = useState(false);
//   const [editingAddress, setEditingAddress] = useState(null);
//   const [addressForm, setAddressForm] = useState({
//     address_type: "home",
//     full_name: "",
//     phone: "",
//     address_line: "",
//     city: "",
//     state: "",
//     postal_code: "",
//     country: "India",
//     is_default: false
//   });

//   // QR Code State
//   const [qrValue, setQrValue] = useState('');
//   const qrRef = useRef();

//   // ============================================
//   // HELPER FUNCTIONS
//   // ============================================
//   const getAuthToken = () => {
//     return localStorage.getItem("token");
//   };

//   const getAuthHeaders = () => {
//     const token = getAuthToken();
//     return {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     };
//   };

//   const getMultipartHeaders = () => ({
//     Authorization: `Bearer ${getAuthToken()}`,
//   });

//   const showStatusMessage = (type, message, duration = 3000) => {
//     setSaveStatus({ type, message });
//     setTimeout(() => setSaveStatus({ type: '', message: '' }), duration);
//   };

//   // ============================================
//   // DATA FETCHING FUNCTIONS
//   // ============================================
//   const fetchUserAddresses = async () => {
//     try {
//       setAddressLoading(true);
//       const response = await axios.get(API_CONFIG.ADDRESS_LIST, {
//         headers: getAuthHeaders()
//       });

//       if (response.data.success) {
//         const addresses = response.data.addresses || [];
//         setUserAddresses(addresses);
//       }
//     } catch (error) {
//       console.error('Error fetching addresses:', error);
//     } finally {
//       setAddressLoading(false);
//     }
//   };

//   const fetchSettings = async () => {
//     try {
//       const response = await axios.get(API_CONFIG.SETTINGS_GET, {
//         headers: getAuthHeaders()
//       });

//       if (response.data.success) {
//         const settingsData = response.data.settings;
//         setSettings({
//           theme: settingsData.theme || "light",
//           language: settingsData.language || "english",
//           notifications: settingsData.notifications || {
//             email: true, push: true, sms: false, marketing: false, updates: true
//           },
//           privacy: settingsData.privacy || {
//             profile_visibility: "public", show_online_status: true,
//             allow_tagging: true, search_visibility: true, data_sharing: false
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching settings:', error);
//     }
//   };

//   const fetchSecurityData = async () => {
//     try {
//       setSecurityLoading(true);

//       // Fetch 2FA status
//       try {
//         const twoFAResponse = await axios.get(API_CONFIG.TWO_FA_STATUS, {
//           headers: getAuthHeaders()
//         });
//         if (twoFAResponse.data.success) {
//           setTwoFAEnabled(twoFAResponse.data.enabled);
//         }
//       } catch (error) {
//         console.error('Error fetching 2FA status:', error);
//       }

//       // Fetch login activities
//       try {
//         const activityResponse = await axios.get(API_CONFIG.LOGIN_ACTIVITY, {
//           headers: getAuthHeaders(),
//           params: { limit: 50 }
//         });
//         if (activityResponse.data.success) {
//           setLoginActivities(activityResponse.data.activities || []);
//         }
//       } catch (error) {
//         console.error('Error fetching login activities:', error);
//       }

//       // Fetch active sessions
//       try {
//         const sessionsResponse = await axios.get(API_CONFIG.SESSIONS, {
//           headers: getAuthHeaders()
//         });
//         if (sessionsResponse.data.success) {
//           // Mark current session (you'll need to implement logic to identify current session)
//           const sessions = (sessionsResponse.data.sessions || []).map(session => ({
//             ...session,
//             current: false // You'll need to set this based on some logic
//           }));
//           setActiveSessions(sessions);
//         }
//       } catch (error) {
//         console.error('Error fetching sessions:', error);
//         setActiveSessions([]);
//       }
//     } catch (error) {
//       console.error('Error in fetchSecurityData:', error);
//     } finally {
//       setSecurityLoading(false);
//     }
//   };

//   // ============================================
//   // PROFILE FETCH
//   // ============================================
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const token = getAuthToken();
//         if (!token) {
//           setSessionExpired(true);
//           return;
//         }

//         const response = await axios.get(API_CONFIG.PROFILE, {
//           headers: getAuthHeaders(),
//         });

//         if (response.data.success) {
//           const userData = response.data.user;
//           setUser(userData);
//           setFormData({
//             name: userData.name || '',
//             email: userData.email || '',
//             phone: userData.phone || '',
//             password: '',
//             is_premium: userData.is_premium || 0
//           });

//           if (userData.avatar) {
//             let avatarUrl = userData.avatar;
//             if (!avatarUrl.startsWith("http")) {
//               avatarUrl = API_CONFIG.UPLOADS + avatarUrl.replace(/^\/+/, "");
//             }
//             setAvatarPreview(avatarUrl);
//           }
//         } else {
//           setSessionExpired(true);
//         }
//       } catch (err) {
//         if (err.response?.status === 401) {
//           setSessionExpired(true);
//         } else {
//           console.error('Error fetching profile:', err);
//           showStatusMessage('error', 'Failed to load profile');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   // Fetch additional data when user is loaded
//   useEffect(() => {
//     if (user?.id) {
//       const profileUrl = `${window.location.origin}/user/${user.id}`;
//       setQrValue(profileUrl);

//       const fetchAllData = async () => {
//         try {
//           await Promise.all([
//             fetchUserAddresses(),
//             fetchSettings(),
//             fetchSecurityData()
//           ]);
//         } catch (error) {
//           console.error('Error fetching additional data:', error);
//         }
//       };

//       fetchAllData();
//     }
//   }, [user]);

//   // ============================================
//   // PROFILE UPDATE FUNCTIONS
//   // ============================================
//   const handleSave = async () => {
//     try {
//       const data = new FormData();

//       if (formData.name) data.append("name", formData.name);
//       if (formData.email) data.append("email", formData.email);
//       if (formData.phone) data.append("phone", formData.phone);
//       if (formData.password) data.append("password", formData.password);
//       if (formData.is_premium !== undefined) data.append("is_premium", formData.is_premium);

//       if (avatarFile) {
//         data.append("avatar", avatarFile);
//       }

//       const response = await axios.put(API_CONFIG.PROFILE, data, {
//         headers: getMultipartHeaders()
//       });

//       if (response.data.success) {
//         const updatedUser = response.data.user;
//         setUser(updatedUser);
//         setFormData(prev => ({
//           ...prev,
//           name: updatedUser.name,
//           email: updatedUser.email,
//           phone: updatedUser.phone,
//           password: '',
//           is_premium: updatedUser.is_premium
//         }));

//         if (updatedUser.avatar) {
//           let avatarUrl = updatedUser.avatar;
//           if (!avatarUrl.startsWith("http")) {
//             avatarUrl = API_CONFIG.UPLOADS + avatarUrl.replace(/^\/+/, "");
//           }
//           setAvatarPreview(avatarUrl);
//         }

//         setAvatarFile(null);
//         setEditMode(false);
//         showStatusMessage('success', 'Profile updated successfully!');
//       }
//     } catch (err) {
//       showStatusMessage('error', err.response?.data?.message || 'Failed to update profile');
//     }
//   };

//   const handleCancel = () => {
//     setFormData({
//       name: user?.name || '',
//       email: user?.email || '',
//       phone: user?.phone || '',
//       password: '',
//       is_premium: user?.is_premium || 0
//     });
//     setAvatarFile(null);
//     if (user?.avatar) {
//       let avatarUrl = user.avatar;
//       if (!avatarUrl.startsWith("http")) {
//         avatarUrl = API_CONFIG.UPLOADS + avatarUrl.replace(/^\/+/, "");
//       }
//       setAvatarPreview(avatarUrl);
//     }
//     setEditMode(false);
//   };

//   const handleDeleteAvatar = async () => {
//     if (!window.confirm("Are you sure you want to delete your profile picture?")) return;

//     try {
//       const response = await axios.delete(API_CONFIG.PROFILE_AVATAR, {
//         headers: getAuthHeaders(),
//       });

//       if (response.data.success) {
//         setAvatarPreview(null);
//         setUser(prev => ({ ...prev, avatar: null }));
//         setAvatarFile(null);
//         showStatusMessage('success', "Profile picture deleted successfully!");
//       }
//     } catch (err) {
//       showStatusMessage('error', err.response?.data?.message || 'Failed to delete profile picture');
//     }
//   };

//   // ============================================
//   // 2FA FUNCTIONS
//   // ============================================
//   const handle2FAToggle = async () => {
//     if (twoFAEnabled) {
//       if (!window.confirm('Are you sure you want to disable two-factor authentication?')) return;

//       try {
//         const response = await axios.post(API_CONFIG.TWO_FA_DISABLE, {}, {
//           headers: getAuthHeaders()
//         });

//         if (response.data.success) {
//           setTwoFAEnabled(false);
//           showStatusMessage('success', 'Two-factor authentication disabled');
//           fetchSecurityData();
//         }
//       } catch (error) {
//         showStatusMessage('error', error.response?.data?.message || 'Failed to disable 2FA');
//       }
//     } else {
//       setShow2FAModal(true);
//     }
//   };

//   const handleEnable2FA = async () => {
//     setTwoFAEnabled(true);
//     showStatusMessage('success', 'Two-factor authentication enabled successfully!');
//     fetchSecurityData();
//   };

//   // ============================================
//   // SESSION FUNCTIONS
//   // ============================================
//   const revokeSession = async (sessionId) => {
//     if (!window.confirm('Are you sure you want to revoke this session?')) return;

//     try {
//       const response = await axios.delete(`${API_CONFIG.SESSIONS}/${sessionId}`, {
//         headers: getAuthHeaders()
//       });

//       if (response.data.success) {
//         showStatusMessage('success', 'Session revoked successfully');
//         fetchSecurityData();
//       }
//     } catch (error) {
//       showStatusMessage('error', error.response?.data?.message || 'Failed to revoke session');
//     }
//   };

//   // ============================================
//   // ACCOUNT FUNCTIONS
//   // ============================================
//   const deleteAccount = async (password) => {
//     try {
//       const response = await axios.delete(API_CONFIG.ACCOUNT_DELETE, {
//         headers: getAuthHeaders(),
//         data: { password }
//       });

//       if (response.data.success) {
//         showStatusMessage('success', 'Account deleted successfully');
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         setTimeout(() => navigate('/login'), 2000);
//       }
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Failed to delete account';
//       showStatusMessage('error', errorMsg);
//       throw error;
//     }
//   };

//   // ============================================
//   // ADDRESS FUNCTIONS
//   // ============================================
//   const handleAddressInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setAddressForm(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const saveAddress = async () => {
//     try {
//       setAddressSaving(true);

//       const requiredFields = ['full_name', 'phone', 'address_line', 'city', 'state', 'postal_code'];
//       const missingFields = requiredFields.filter(field => !addressForm[field]?.trim());

//       if (missingFields.length > 0) {
//         showStatusMessage('error', `Please fill all required fields: ${missingFields.join(', ')}`);
//         setAddressSaving(false);
//         return;
//       }

//       const phoneDigits = addressForm.phone.replace(/\D/g, '');
//       if (phoneDigits.length < 10) {
//         showStatusMessage('error', 'Phone number must be at least 10 digits');
//         setAddressSaving(false);
//         return;
//       }

//       let response;
//       const addressData = {
//         ...addressForm,
//         phone: phoneDigits,
//         is_default: addressForm.is_default ? 1 : 0,
//         country: addressForm.country || 'India'
//       };

//       if (editingAddress) {
//         response = await axios.put(
//           `${API_CONFIG.ADDRESS_UPDATE}/${editingAddress.id}`,
//           addressData,
//           { headers: getAuthHeaders() }
//         );
//       } else {
//         response = await axios.post(
//           API_CONFIG.ADDRESS_CREATE,
//           addressData,
//           { headers: getAuthHeaders() }
//         );
//       }

//       if (response.data.success) {
//         showStatusMessage('success', `Address ${editingAddress ? 'updated' : 'saved'} successfully!`);
//         fetchUserAddresses();
//         resetAddressForm();
//         setShowAddressForm(false);
//       }
//     } catch (error) {
//       showStatusMessage('error', error.response?.data?.message || 'Failed to save address');
//     } finally {
//       setAddressSaving(false);
//     }
//   };

//   const editAddress = (address) => {
//     setEditingAddress(address);
//     setAddressForm({
//       address_type: address.address_type || "home",
//       full_name: address.full_name || "",
//       phone: address.phone || "",
//       address_line: address.address_line || "",
//       city: address.city || "",
//       state: address.state || "",
//       postal_code: address.postal_code || "",
//       country: address.country || "India",
//       is_default: address.is_default === 1 || address.is_default === true
//     });
//     setShowAddressForm(true);
//   };

//   const deleteAddress = async (addressId) => {
//     if (!window.confirm("Are you sure you want to delete this address?")) return;

//     try {
//       const response = await axios.delete(
//         `${API_CONFIG.ADDRESS_DELETE}/${addressId}`,
//         { headers: getAuthHeaders() }
//       );

//       if (response.data.success) {
//         showStatusMessage('success', "Address deleted successfully!");
//         fetchUserAddresses();
//       }
//     } catch (error) {
//       showStatusMessage('error', error.response?.data?.message || 'Failed to delete address');
//     }
//   };

//   const setDefaultAddress = async (addressId) => {
//     try {
//       const response = await axios.put(
//         `${API_CONFIG.ADDRESS_DEFAULT}/${addressId}/default`,
//         {},
//         { headers: getAuthHeaders() }
//       );

//       if (response.data.success) {
//         showStatusMessage('success', "Default address updated!");
//         fetchUserAddresses();
//       }
//     } catch (error) {
//       showStatusMessage('error', error.response?.data?.message || 'Failed to set default address');
//     }
//   };

//   const resetAddressForm = () => {
//     setAddressForm({
//       address_type: "home",
//       full_name: "",
//       phone: "",
//       address_line: "",
//       city: "",
//       state: "",
//       postal_code: "",
//       country: "India",
//       is_default: false
//     });
//     setEditingAddress(null);
//   };

//   const copyAddressToClipboard = (address) => {
//     const addressText = `${address.full_name}\n${address.phone}\n${address.address_line}\n${address.city}, ${address.state} - ${address.postal_code}\n${address.country || 'India'}`;

//     navigator.clipboard.writeText(addressText)
//       .then(() => showStatusMessage('success', 'Address copied to clipboard!'))
//       .catch(() => showStatusMessage('error', 'Failed to copy address'));
//   };

//   const getAddressTypeIcon = (type) => {
//     const icons = {
//       'home': <FaHome />,
//       'work': <FaBriefcase />,
//       'other': <FaMapPin />
//     };
//     return icons[type] || <FaHome />;
//   };

//   // ============================================
//   // SETTINGS FUNCTIONS
//   // ============================================
//   const saveSettings = async () => {
//     try {
//       const response = await axios.put(API_CONFIG.SETTINGS_UPDATE, settings, {
//         headers: getAuthHeaders()
//       });

//       if (response.data.success) {
//         showStatusMessage('success', 'Settings updated successfully!');
//         if (settings.theme) {
//           document.documentElement.setAttribute('data-theme', settings.theme);
//           localStorage.setItem('theme', settings.theme);
//         }
//       }
//     } catch (error) {
//       showStatusMessage('error', error.response?.data?.message || 'Failed to save settings');
//     }
//   };

//   const updateSettings = (key, value) => {
//     setSettings(prev => {
//       const newSettings = { ...prev };
//       const keys = key.split('.');
//       let current = newSettings;

//       for (let i = 0; i < keys.length - 1; i++) {
//         if (!current[keys[i]]) {
//           current[keys[i]] = {};
//         }
//         current = current[keys[i]];
//       }

//       current[keys[keys.length - 1]] = value;
//       return newSettings;
//     });
//   };

//   const handleThemeChange = (newTheme) => {
//     updateSettings('theme', newTheme);
//     document.documentElement.setAttribute('data-theme', newTheme);
//     localStorage.setItem('theme', newTheme);
//   };

//   // ============================================
//   // UTILITY FUNCTIONS
//   // ============================================
//   const getPasswordStrength = useCallback((password) => {
//     if (!password) return 0;
//     let strength = 0;
//     if (password.length >= 8) strength++;
//     if (/[A-Z]/.test(password)) strength++;
//     if (/[0-9]/.test(password)) strength++;
//     if (/[^A-Za-z0-9]/.test(password)) strength++;
//     return strength;
//   }, []);

//   const passwordStrength = useMemo(() =>
//     getPasswordStrength(formData.password || ""),
//     [formData.password, getPasswordStrength]
//   );

//   const strengthColor = (strength) => {
//     const colors = ["#ff4444", "#ff7744", "#ffaa44", "#44aa44", "#22aa22"];
//     return colors[strength] || "#ccc";
//   };

//   const togglePremium = () => {
//     if (user.is_premium) {
//       setFormData({ ...formData, is_premium: 0 });
//     } else {
//       navigate("/premium");
//     }
//   };

//   const downloadProfile = async (format) => {
//     try {
//       if (format === 'json') {
//         const dataStr = JSON.stringify({
//           user: user,
//           settings: settings,
//           addresses: userAddresses,
//           lastUpdated: new Date().toISOString()
//         }, null, 2);
//         const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
//         const link = document.createElement('a');
//         link.href = dataUri;
//         link.download = `pankhudi-profile-${user.name?.replace(/\s+/g, '-') || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         showStatusMessage('success', 'Profile data downloaded!');
//       }
//     } catch (error) {
//       showStatusMessage('error', 'Failed to download profile data');
//     }
//   };

//   const shareProfile = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: `${user.name}'s Profile`,
//         text: `Check out ${user.name}'s profile on Pankhudi`,
//         url: window.location.href,
//       }).catch(() => { });
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       showStatusMessage('success', 'Profile URL copied to clipboard!');
//     }
//   };

//   const copyToClipboard = async (text, fieldName) => {
//     if (!text || text === "Not provided") return;
//     try {
//       await navigator.clipboard.writeText(text);
//       showStatusMessage('success', `${fieldName} copied to clipboard!`);
//     } catch (err) {
//       showStatusMessage('error', 'Failed to copy to clipboard');
//     }
//   };

//   const downloadQRCode = () => {
//     if (!qrRef.current) return;
//     try {
//       const svgElement = qrRef.current.querySelector('svg');
//       if (!svgElement) {
//         showStatusMessage('error', 'QR code not available');
//         return;
//       }

//       const svgData = new XMLSerializer().serializeToString(svgElement);
//       const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
//       const svgUrl = URL.createObjectURL(svgBlob);

//       const downloadLink = document.createElement('a');
//       downloadLink.href = svgUrl;
//       downloadLink.download = `pankhudi-profile-${user.name?.replace(/\s+/g, '-') || 'user'}-qr.svg`;
//       document.body.appendChild(downloadLink);
//       downloadLink.click();
//       document.body.removeChild(downloadLink);

//       setTimeout(() => URL.revokeObjectURL(svgUrl), 100);
//       showStatusMessage('success', 'QR code downloaded!');
//     } catch (err) {
//       showStatusMessage('error', 'Failed to download QR code');
//     }
//   };

//   // ============================================
//   // DROPZONE SETUP
//   // ============================================
//   const { getRootProps, getInputProps } = useDropzone({
//     accept: { "image/*": ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
//     maxFiles: 1,
//     maxSize: 5242880,
//     onDrop: (acceptedFiles) => {
//       if (acceptedFiles.length > 0) {
//         const file = acceptedFiles[0];
//         setAvatarFile(file);
//         setAvatarPreview(URL.createObjectURL(file));
//       }
//     },
//     onDropRejected: (rejectedFiles) => {
//       const error = rejectedFiles[0]?.errors[0];
//       if (error?.code === 'file-too-large') {
//         showStatusMessage('error', 'File size must be less than 5MB');
//       } else if (error?.code === 'file-invalid-type') {
//         showStatusMessage('error', 'Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
//       }
//     }
//   });

//   // ============================================
//   // SESSION EXPIRY HANDLER
//   // ============================================
//   useEffect(() => {
//     if (sessionExpired) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       localStorage.removeItem("theme");
//     }
//   }, [sessionExpired]);

//   // ============================================
//   // PROFILE FIELDS CONFIGURATION
//   // ============================================
//   const profileFields = useMemo(() => [
//     { key: "name", label: "Full Name", icon: FaUser, type: "text" },
//     { key: "email", label: "Email Address", icon: FaEnvelope, type: "email" },
//     { key: "phone", label: "Phone Number", icon: FaPhone, type: "tel" }
//   ], []);

//   // ============================================
//   // RENDER CONDITIONS
//   // ============================================
//   if (sessionExpired) {
//     return (
//       <div className="profile-session-expired">
//         <div className="profile-expired-card">
//           <h2><FaExclamationTriangle /> Session Expired</h2>
//           <p>Your session has expired. Please login again to continue.</p>
//           <button className="profile-btn profile-btn-primary" onClick={() => navigate("/login")}>
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="profile-loading-overlay">
//         <div className="profile-loading">
//           <div className="profile-spinner"></div>
//           <p>Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) return null;

//   // ============================================
//   // MAIN RENDER
//   // ============================================
//   return (
//     <>
//       <div className={`profile-page ${settings.theme}`}>
//         <div className="profile-header">
//           <button className="profile-btn profile-btn-outline" onClick={() => navigate(-1)}>
//             <FaArrowLeft /> Back
//           </button>
//           <h2 className="brand-name">Pankhudi</h2>
//         </div>

//         {saveStatus.message && (
//           <div className={`profile-status-message profile-status-${saveStatus.type}`}>
//             <p>{saveStatus.message}</p>
//           </div>
//         )}

//         <div className="profile-container">
//           {/* Navigation Tabs */}
//           <div className="profile-tabs">
//             {PROFILE_TABS.map(tab => (
//               <button
//                 key={tab.id}
//                 className={`profile-tab-btn ${activeTab === tab.id ? "profile-tab-active" : ""}`}
//                 onClick={() => setActiveTab(tab.id)}
//               >
//                 {React.createElement(tab.icon)} {tab.label}
//               </button>
//             ))}
//           </div>

//           {/* Profile Tab Content */}
//           {activeTab === "profile" && (
//             <div className="profile-tab-content">
//               {/* Avatar Section */}
//               <div className="profile-avatar-section">
//                 <div
//                   className={`profile-avatar ${editMode ? "profile-avatar-editable" : ""}`}
//                   {...(editMode ? getRootProps() : {})}
//                 >
//                   <input {...getInputProps()} />
//                   {avatarPreview ? (
//                     <img src={avatarPreview} alt="Profile" className="profile-avatar-image" />
//                   ) : (
//                     <div className="profile-avatar-fallback">
//                       {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
//                     </div>
//                   )}
//                   {editMode && (
//                     <div className="profile-avatar-overlay">
//                       <FaEdit className="profile-edit-icon" />
//                       <p>Change Photo</p>
//                     </div>
//                   )}
//                 </div>
//                 {editMode && avatarPreview && (
//                   <button className="profile-btn profile-btn-danger profile-btn-sm" onClick={handleDeleteAvatar}>
//                     <FaTrash /> Remove Photo
//                   </button>
//                 )}
//                 <div className="profile-badges">
//                   {user.is_premium === 1 && (
//                     <div className="profile-badge profile-badge-premium">
//                       <RiVipCrownFill /> Premium Member
//                     </div>
//                   )}
//                   <div className="profile-badge profile-badge-default">
//                     Member since {new Date(user.createdAt || user.registrationDate).toLocaleDateString()}
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Actions */}
//               <div className="profile-quick-actions">
//                 <button className="profile-btn profile-btn-secondary" onClick={shareProfile}>
//                   <FaShareAlt /> Share Profile
//                 </button>
//                 <button className="profile-btn profile-btn-secondary" onClick={() => downloadProfile('json')}>
//                   <FaDownload /> Export Data
//                 </button>
//                 {user.is_premium === 1 ? (
//                   <button className="profile-btn profile-btn-premium" onClick={togglePremium}>
//                     <FaCrown /> Manage Premium
//                   </button>
//                 ) : (
//                   <button className="profile-btn profile-btn-outline" onClick={togglePremium}>
//                     <FaCrown /> Upgrade to Premium
//                   </button>
//                 )}
//               </div>

//               {/* Addresses Quick View */}
//               <div className="profile-addresses-quick-view">
//                 <h3><FaMapMarkerAlt /> Saved Addresses ({userAddresses.length})</h3>
//                 <button
//                   className="profile-btn profile-btn-secondary"
//                   onClick={() => setActiveTab("addresses")}
//                 >
//                   View All Addresses →
//                 </button>
//               </div>

//               {/* Profile Info Note */}
//               <div className="profile-info-note">
//                 <p><FaExclamationTriangle /> <strong>Important:</strong> After updating your profile, you may need to logout and login again to see all changes.</p>
//               </div>

//               {/* Profile Fields */}
//               {profileFields.map(({ key, label, icon: Icon, type }) => (
//                 <div className="profile-item profile-card" key={key}>
//                   <div className="profile-field-header">
//                     <label>
//                       <Icon /> {label}
//                     </label>
//                     {!editMode && formData[key] && (
//                       <button
//                         className="profile-btn profile-btn-sm"
//                         onClick={() => copyToClipboard(formData[key], label)}
//                         title={`Copy ${label}`}
//                       >
//                         <FaCopy />
//                       </button>
//                     )}
//                   </div>
//                   {editMode ? (
//                     <input
//                       type={type}
//                       className="profile-form-control"
//                       value={formData[key] || ""}
//                       onChange={(e) =>
//                         setFormData({ ...formData, [key]: e.target.value })
//                       }
//                       placeholder={`Enter your ${label.toLowerCase()}`}
//                     />
//                   ) : (
//                     <p className="profile-value">{formData[key] || "Not provided"}</p>
//                   )}
//                 </div>
//               ))}

//               {/* Password Field */}
//               <div className="profile-item profile-card">
//                 <label><FaLock /> New Password</label>
//                 {editMode ? (
//                   <div className="profile-password-wrapper">
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       className="profile-form-control"
//                       value={formData.password || ""}
//                       onChange={(e) =>
//                         setFormData({ ...formData, password: e.target.value })
//                       }
//                       placeholder="Enter new password (optional)"
//                     />
//                     <button
//                       type="button"
//                       className="profile-toggle-password"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
//                     </button>
//                   </div>
//                 ) : (
//                   <p>••••••••</p>
//                 )}
//                 {editMode && formData.password && (
//                   <div className="profile-password-strength-container">
//                     <div
//                       className="profile-password-strength"
//                       style={{
//                         width: `${(passwordStrength / 4) * 100}%`,
//                         backgroundColor: strengthColor(passwordStrength),
//                       }}
//                     ></div>
//                     <div className="profile-password-strength-labels">
//                       <span>Weak</span>
//                       <span>Strong</span>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Premium Status */}
//               <div className="profile-item profile-card profile-premium-item">
//                 <label><RiVipCrownFill /> Account Type</label>
//                 {editMode ? (
//                   <select
//                     className="profile-form-control"
//                     value={formData.is_premium || 0}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         is_premium: Number(e.target.value),
//                       })
//                     }
//                   >
//                     <option value={0}>Standard User</option>
//                     <option value={1}>Premium User</option>
//                   </select>
//                 ) : user.is_premium === 1 ? (
//                   <p className="profile-badge profile-badge-premium">
//                     <FaCrown /> Premium Account
//                   </p>
//                 ) : (
//                   <p>Standard Account</p>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="profile-actions">
//                 {editMode ? (
//                   <>
//                     <button className="profile-btn profile-btn-success" onClick={handleSave}>
//                       <FaSave /> Save Changes
//                     </button>
//                     <button className="profile-btn profile-btn-secondary" onClick={handleCancel}>
//                       Cancel
//                     </button>
//                   </>
//                 ) : (
//                   <button className="profile-btn profile-btn-primary" onClick={() => setEditMode(true)}>
//                     <FaEdit /> Edit Profile
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Addresses Tab Content */}
//           {activeTab === "addresses" && (
//             <div className="profile-tab-content">
//               <div className="profile-addresses-header">
//                 <h3><FaMapMarkerAlt /> Your Saved Addresses</h3>
//                 <p>Manage your delivery addresses for faster checkout</p>
//               </div>

//               <div className="profile-addresses-actions">
//                 <button
//                   className="profile-btn profile-btn-success"
//                   onClick={() => {
//                     resetAddressForm();
//                     setShowAddressForm(true);
//                   }}
//                 >
//                   <FaPlus /> Add New Address
//                 </button>

//                 <button
//                   className="profile-btn profile-btn-secondary"
//                   onClick={fetchUserAddresses}
//                   disabled={addressLoading}
//                 >
//                   <FaSync /> {addressLoading ? 'Loading...' : 'Refresh'}
//                 </button>
//               </div>

//               {addressLoading ? (
//                 <div className="profile-loading-addresses">
//                   <div className="profile-spinner"></div>
//                   <p>Loading addresses...</p>
//                 </div>
//               ) : userAddresses.length === 0 ? (
//                 <div className="profile-no-addresses">
//                   <FaMapMarkerAlt className="profile-empty-icon" />
//                   <h4>No Saved Addresses</h4>
//                   <p>Add your first address to get started</p>
//                   <button
//                     className="profile-btn profile-btn-primary"
//                     onClick={() => {
//                       resetAddressForm();
//                       setShowAddressForm(true);
//                     }}
//                   >
//                     <FaPlus /> Add First Address
//                   </button>
//                 </div>
//               ) : (
//                 <>
//                   <div className="profile-addresses-count">
//                     <p><strong>{userAddresses.length}</strong> address(es) found</p>
//                   </div>
//                   <div className="profile-addresses-list">
//                     {userAddresses.map((address) => (
//                       <AddressCard
//                         key={address.id}
//                         address={address}
//                         getAddressTypeIcon={getAddressTypeIcon}
//                         onEdit={editAddress}
//                         onDelete={deleteAddress}
//                         onSetDefault={setDefaultAddress}
//                         onCopy={copyAddressToClipboard}
//                       />
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           )}

//           {/* Settings Tab Content */}
//           {activeTab === "settings" && (
//             <div className="profile-tab-content">
//               <h3><AiFillSetting /> Account Settings</h3>

//               {/* Appearance Settings */}
//               <div className="profile-settings-group profile-card">
//                 <h4><FaPalette /> Appearance</h4>
//                 <div className="profile-setting-item">
//                   <label>Theme</label>
//                   <select
//                     className="profile-form-control"
//                     value={settings.theme}
//                     onChange={(e) => handleThemeChange(e.target.value)}
//                   >
//                     <option value="light">Light</option>
//                     <option value="dark">Dark</option>
//                     <option value="auto">System Default</option>
//                   </select>
//                 </div>

//                 <div className="profile-setting-item">
//                   <label><FaLanguage /> Language</label>
//                   <select
//                     className="profile-form-control"
//                     value={settings.language}
//                     onChange={(e) => updateSettings('language', e.target.value)}
//                   >
//                     <option value="english">English</option>
//                     <option value="hindi">Hindi</option>
//                     <option value="spanish">Spanish</option>
//                     <option value="french">French</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Notification Settings */}
//               <div className="profile-settings-group profile-card">
//                 <h4><FaBell /> Notifications</h4>
//                 {Object.entries(settings.notifications || {}).map(([key, value]) => (
//                   <div className="profile-setting-item profile-toggle" key={key}>
//                     <label>{key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}</label>
//                     <label className="profile-switch">
//                       <input
//                         type="checkbox"
//                         checked={value}
//                         onChange={() => updateSettings(`notifications.${key}`, !value)}
//                       />
//                       <span className="profile-slider"></span>
//                     </label>
//                   </div>
//                 ))}
//               </div>

//               {/* Privacy Settings */}
//               <div className="profile-settings-group profile-card">
//                 <h4><MdPrivacyTip /> Privacy Settings</h4>
//                 <div className="profile-setting-item">
//                   <label>Profile Visibility</label>
//                   <select
//                     className="profile-form-control"
//                     value={settings.privacy?.profile_visibility}
//                     onChange={(e) => updateSettings('privacy.profile_visibility', e.target.value)}
//                   >
//                     <option value="public">Public</option>
//                     <option value="friends">Friends Only</option>
//                     <option value="private">Private</option>
//                   </select>
//                 </div>

//                 <div className="profile-setting-item profile-toggle">
//                   <label>Show Online Status</label>
//                   <label className="profile-switch">
//                     <input
//                       type="checkbox"
//                       checked={settings.privacy?.show_online_status}
//                       onChange={() => updateSettings('privacy.show_online_status', !settings.privacy?.show_online_status)}
//                     />
//                     <span className="profile-slider"></span>
//                   </label>
//                 </div>

//                 <div className="profile-setting-item profile-toggle">
//                   <label>Allow Tagging</label>
//                   <label className="profile-switch">
//                     <input
//                       type="checkbox"
//                       checked={settings.privacy?.allow_tagging}
//                       onChange={() => updateSettings('privacy.allow_tagging', !settings.privacy?.allow_tagging)}
//                     />
//                     <span className="profile-slider"></span>
//                   </label>
//                 </div>
//               </div>

//               {/* QR Code Section */}
//               <div className="profile-settings-group profile-card">
//                 <h4><FaQrcode /> Profile QR Code</h4>
//                 <div className="profile-qrcode-section">
//                   <div className="profile-qrcode-placeholder">
//                     <p>Scan to view profile</p>
//                     <div className="profile-qrcode-image" ref={qrRef}>
//                       {qrValue ? (
//                         <QRCodeSVG
//                           value={qrValue}
//                           size={150}
//                           level="H"
//                           includeMargin
//                           bgColor="#ffffff"
//                           fgColor="#000000"
//                         />
//                       ) : (
//                         <span>Generating QR Code...</span>
//                       )}
//                     </div>
//                   </div>
//                   <button className="profile-btn profile-btn-primary" onClick={downloadQRCode}>
//                     <FaDownload /> Download QR Code
//                   </button>
//                 </div>
//               </div>

//               {/* Settings Actions */}
//               <div className="profile-settings-actions">
//                 <button className="profile-btn profile-btn-success" onClick={saveSettings}>
//                   <FaSave /> Save Settings
//                 </button>
//                 <button className="profile-btn profile-btn-secondary" onClick={fetchSettings}>
//                   Reset to Defaults
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Privacy & Security Tab Content */}
//           {activeTab === "privacy" && (
//             <div className="profile-tab-content">
//               <h3><MdSecurity /> Privacy & Security</h3>

//               {/* Security Settings */}
//               <div className="profile-settings-group profile-card">
//                 <h4><FaShieldAlt /> Security</h4>
//                 <div className="profile-setting-item">
//                   <label>Two-Factor Authentication</label>
//                   <div className="profile-security-status">
//                     <span className={`profile-status-indicator ${twoFAEnabled ? 'profile-status-enabled' : 'profile-status-disabled'}`}>
//                       {twoFAEnabled ? 'Enabled' : 'Disabled'}
//                     </span>
//                     <button
//                       className={`profile-btn ${twoFAEnabled ? 'profile-btn-danger' : 'profile-btn-primary'}`}
//                       onClick={handle2FAToggle}
//                       disabled={securityLoading}
//                     >
//                       {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="profile-setting-item">
//                   <label>Login Activity</label>
//                   <button
//                     className="profile-btn profile-btn-secondary"
//                     onClick={() => setShowActivityModal(true)}
//                     disabled={securityLoading}
//                   >
//                     <FaHistory /> View Recent Activity ({loginActivities.length})
//                   </button>
//                 </div>

//                 <div className="profile-setting-item">
//                   <label>Active Sessions</label>
//                   <button
//                     className="profile-btn profile-btn-secondary"
//                     onClick={() => setShowSessionsModal(true)}
//                     disabled={securityLoading}
//                   >
//                     <FaDesktop /> Manage Sessions ({activeSessions.length})
//                   </button>
//                 </div>
//               </div>

//               {/* Data & Privacy */}
//               <div className="profile-settings-group profile-card">
//                 <h4>Data & Privacy</h4>
//                 <div className="profile-setting-item">
//                   <label>Export Your Data</label>
//                   <button className="profile-btn profile-btn-secondary" onClick={() => downloadProfile('json')}>
//                     <FaDownload /> Download Data Archive
//                   </button>
//                 </div>

//                 <div className="profile-setting-item profile-danger-zone">
//                   <label>Account Deletion</label>
//                   <div className="profile-danger-zone-content">
//                     <p className="profile-danger-text">
//                       <FaExclamationTriangle /> Permanently delete your account and all associated data
//                     </p>
//                     <button
//                       className="profile-btn profile-btn-danger"
//                       onClick={() => setShowDeleteModal(true)}
//                     >
//                       <FaTrash /> Delete My Account
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modals */}
//       <AddressFormModal
//         isOpen={showAddressForm}
//         editingAddress={editingAddress}
//         addressForm={addressForm}
//         onInputChange={handleAddressInputChange}
//         onSave={saveAddress}
//         onClose={() => {
//           setShowAddressForm(false);
//           resetAddressForm();
//         }}
//         loading={addressSaving}
//       />

//       <TwoFAModal
//         isOpen={show2FAModal}
//         onClose={() => setShow2FAModal(false)}
//         onEnable2FA={handleEnable2FA}
//         user={user}
//       />

//       <ActivityLogModal
//         isOpen={showActivityModal}
//         onClose={() => setShowActivityModal(false)}
//         activities={loginActivities}
//         loading={securityLoading}
//       />

//       <SessionsModal
//         isOpen={showSessionsModal}
//         onClose={() => setShowSessionsModal(false)}
//         sessions={activeSessions}
//         onRevokeSession={revokeSession}
//         loading={securityLoading}
//       />

//       <DeleteAccountModal
//         isOpen={showDeleteModal}
//         onClose={() => setShowDeleteModal(false)}
//         onDeleteAccount={deleteAccount}
//       />
//     </>
//   );
// };

// export default Profile;








import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  FaArrowLeft,
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
  FaQrcode,
  FaShareAlt,
  FaDownload,
  FaPlus,
  FaTrash,
  FaHome,
  FaBriefcase,
  FaMapPin,
  FaCheck,
  FaCopy,
  FaRegEdit,
  FaTimes,
  FaExclamationTriangle,
  FaHistory,
  FaShieldAlt,
  FaPowerOff,
  FaKey,
  FaClock,
  FaDesktop,
  FaMobileAlt,
  FaGlobe,
  FaLanguage,
  FaEye,
  FaEyeSlash,
  FaMap,
  FaDatabase,
  FaSync,
  FaRedo,
  FaExclamationCircle,
  FaInfoCircle,
  FaSpinner
} from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible, AiFillSetting } from "react-icons/ai";
import { MdPrivacyTip, MdSecurity, MdLocationOn } from "react-icons/md";
import { RiVipCrownFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { QRCodeSVG } from 'qrcode.react';
import "./Profile.css";

// ============================================
// API CONFIGURATION
// ============================================
const API_CONFIG = {
  BASE: "http://localhost:5000/api",
  PROFILE: "http://localhost:5000/api/profile",
  PROFILE_AVATAR: "http://localhost:5000/api/profile/avatar",
  PROFILE_PASSWORD: "http://localhost:5000/api/profile/password",

  // Address endpoints
  ADDRESS_LIST: "http://localhost:5000/api/address",
  ADDRESS_CREATE: "http://localhost:5000/api/address",
  ADDRESS_UPDATE: "http://localhost:5000/api/address",
  ADDRESS_DELETE: "http://localhost:5000/api/address",
  ADDRESS_DEFAULT: "http://localhost:5000/api/address",

  UPLOADS: "http://localhost:5000/",

  // Settings endpoints
  SETTINGS_GET: "http://localhost:5000/api/settings/get",
  SETTINGS_UPDATE: "http://localhost:5000/api/settings/update",

  // Security endpoints
  LOGIN_ACTIVITY: "http://localhost:5000/api/security/login-activity",
  SESSIONS: "http://localhost:5000/api/security/sessions",
  TWO_FA_STATUS: "http://localhost:5000/api/security/two-fa/status",
  TWO_FA_SETUP: "http://localhost:5000/api/security/two-fa/setup",
  TWO_FA_VERIFY: "http://localhost:5000/api/security/two-fa/verify",
  TWO_FA_DISABLE: "http://localhost:5000/api/security/two-fa/disable",
  TWO_FA_BACKUP_CODES: "http://localhost:5000/api/security/two-fa/backup-codes",
  ACCOUNT_DELETE: "http://localhost:5000/api/account"
};

// ============================================
// TAB CONFIGURATION
// ============================================
const PROFILE_TABS = [
  { id: "profile", label: "Profile", icon: FaUser },
  { id: "settings", label: "Settings", icon: AiFillSetting },
  { id: "privacy", label: "Privacy & Security", icon: MdPrivacyTip },
  { id: "addresses", label: "Addresses", icon: FaMapMarkerAlt }
];

// ============================================
// ADDRESS FORM MODAL COMPONENT
// ============================================
const AddressFormModal = ({ isOpen, editingAddress, addressForm, onInputChange, onSave, onClose, loading }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay active" onClick={onClose}>
      <div className="profile-modal-content active" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <button className="profile-close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body">
          <div className="profile-address-form">
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Address Type *</label>
                <select
                  name="address_type"
                  className="profile-form-control"
                  value={addressForm.address_type}
                  onChange={onInputChange}
                  disabled={loading}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label>Set as Default</label>
                <div className="profile-checkbox-container">
                  <input
                    type="checkbox"
                    name="is_default"
                    id="profile_is_default"
                    checked={addressForm.is_default === 1 || addressForm.is_default === true}
                    onChange={(e) => onInputChange({
                      target: {
                        name: 'is_default',
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    })}
                    disabled={loading}
                  />
                  <label htmlFor="profile_is_default">Make this my default address</label>
                </div>
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label htmlFor="profile_full_name">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  id="profile_full_name"
                  className="profile-form-control"
                  value={addressForm.full_name}
                  onChange={onInputChange}
                  placeholder="Enter full name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile_phone">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  id="profile_phone"
                  className="profile-form-control"
                  value={addressForm.phone}
                  onChange={onInputChange}
                  placeholder="Enter phone number"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile_address_line">Address Line *</label>
              <textarea
                name="address_line"
                id="profile_address_line"
                className="profile-form-control"
                value={addressForm.address_line}
                onChange={onInputChange}
                placeholder="House no., Building, Street, Area"
                rows="3"
                required
                disabled={loading}
              />
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label htmlFor="profile_city">City *</label>
                <input
                  type="text"
                  name="city"
                  id="profile_city"
                  className="profile-form-control"
                  value={addressForm.city}
                  onChange={onInputChange}
                  placeholder="Enter city"
                  required
                  disabled={loading}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile_state">State *</label>
                <input
                  type="text"
                  name="state"
                  id="profile_state"
                  className="profile-form-control"
                  value={addressForm.state}
                  onChange={onInputChange}
                  placeholder="Enter state"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label htmlFor="profile_postal_code">Postal Code *</label>
                <input
                  type="text"
                  name="postal_code"
                  id="profile_postal_code"
                  className="profile-form-control"
                  value={addressForm.postal_code}
                  onChange={onInputChange}
                  placeholder="Enter postal code"
                  required
                  disabled={loading}
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile_country">Country</label>
                <input
                  type="text"
                  name="country"
                  id="profile_country"
                  className="profile-form-control"
                  value={addressForm.country}
                  onChange={onInputChange}
                  placeholder="Enter country"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="profile-form-actions">
              <button
                className="profile-btn profile-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="profile-btn profile-btn-success"
                onClick={onSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="profile-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> {editingAddress ? 'Update Address' : 'Save Address'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 2FA MODAL COMPONENT - COMPLETE USER GUIDE
// ============================================
/**
 * TWO-FACTOR AUTHENTICATION (2FA) SETUP GUIDE
 * --------------------------------------------
 * 
 * STEP 1: SCAN QR CODE
 * ---------------------
 * What to do:
 * 1. Download Google Authenticator app on your phone (iOS/Android)
 * 2. Open the app and tap "+" to add a new account
 * 3. Select "Scan QR code" and scan the QR code shown below
 * 4. If you can't scan, click "Copy Secret" and enter manually in the app
 * 
 * What happens:
 * - The app will now show a 6-digit code that changes every 30 seconds
 * - This code is synchronized with our server
 * 
 * 
 * STEP 2: VERIFY CODE
 * --------------------
 * What to do:
 * 1. Open Google Authenticator app on your phone
 * 2. Look for "Pankhudi" entry
 * 3. Enter the current 6-digit code shown in the app
 * 4. Click "Verify & Enable"
 * 
 * Important:
 * - Code changes every 30 seconds, enter it quickly
 * - If code expires, wait for new one
 * 
 * 
 * STEP 3: SAVE BACKUP CODES
 * --------------------------
 * What to do:
 * 1. You will see 8 backup codes on screen
 * 2. COPY THESE CODES and save them SAFELY:
 *    - Write them on paper and keep in safe place
 *    - Save in password manager (LastPass, 1Password)
 *    - Take a screenshot and store securely
 * 3. Click "Copy All Codes" to copy to clipboard
 * 4. Click "Done" to finish setup
 * 
 * Why backup codes are important:
 * - If you lose your phone, you CANNOT login without these
 * - Each code can be used ONLY ONCE
 * - Keep them safe and accessible
 * 
 * 
 * LOGIN WITH 2FA (After Setup)
 * ------------------------------
 * When you login next time:
 * 1. Enter email/phone and password normally
 * 2. You'll see a screen asking for 6-digit code
 * 3. Open Google Authenticator on your phone
 * 4. Enter the current code shown
 * 5. If you lost your phone, click "Use Backup Code"
 * 6. Enter one of your saved backup codes
 */
const TwoFAModal = ({ isOpen, onClose, onEnable2FA, user }) => {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setVerificationCode('');
      setVerificationError('');
      generate2FAQRCode();
    } else {
      setStep(1);
      setQrCode('');
      setSecret('');
      setVerificationCode('');
      setBackupCodes([]);
      setVerificationError('');
    }
  }, [isOpen]);

  const generate2FAQRCode = async () => {
    try {
      setLoading(true);
      setVerificationError('');
      const response = await axios.get(API_CONFIG.TWO_FA_SETUP, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        const qrData = `otpauth://totp/Pankhudi:${user?.email || 'user'}?secret=${response.data.secret}&issuer=Pankhudi`;
        setQrCode(qrData);
        setSecret(response.data.secret);
      }
    } catch (error) {
      console.error('2FA Setup Error:', error);
      const mockSecret = generateRandomSecret();
      const qrData = `otpauth://totp/Pankhudi:${user?.email || 'user'}?secret=${mockSecret}&issuer=Pankhudi`;
      setQrCode(qrData);
      setSecret(mockSecret);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setVerificationError('');

      const response = await axios.post(API_CONFIG.TWO_FA_VERIFY, {
        code: verificationCode
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        const codes = response.data.backupCodes || generateBackupCodes();
        setBackupCodes(codes);

        try {
          await axios.post(API_CONFIG.TWO_FA_BACKUP_CODES, {
            backupCodes: codes
          }, {
            headers: getAuthHeaders()
          });
        } catch (saveError) {
          console.warn('Failed to save backup codes:', saveError);
        }

        setStep(3);
        onEnable2FA();
      } else {
        setVerificationError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('2FA Verification Error:', error);
      setVerificationError(
        error.response?.data?.message || 'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
      .then(() => alert('✅ Backup codes copied to clipboard! Store them safely.'))
      .catch(() => alert('❌ Failed to copy codes. Please copy manually.'));
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay active" onClick={onClose}>
      <div className="profile-modal-content active profile-security-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3><FaShieldAlt /> Two-Factor Authentication Setup</h3>
          <button className="profile-close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body">
          {/* STEP 1: QR CODE SCAN */}
          {step === 1 && (
            <div className="profile-security-step">
              <div className="step-indicator">
                <span className="step-badge active">Step 1 of 3</span>
              </div>

              <h4>📱 Scan QR Code with Google Authenticator</h4>

              <div className="instruction-box">
                <p><strong>What to do:</strong></p>
                <ol>
                  <li>Download <strong>Google Authenticator</strong> app from Play Store/App Store</li>
                  <li>Open the app and tap <strong>"+"</strong> to add new account</li>
                  <li>Select <strong>"Scan QR code"</strong> and scan the code below</li>
                  <li>If you can't scan, use the secret key below</li>
                </ol>
              </div>

              {loading ? (
                <div className="profile-loading-qr">
                  <FaSpinner className="profile-spin" /> Generating QR Code...
                </div>
              ) : (
                <>
                  <div className="profile-qrcode-container">
                    {qrCode ? (
                      <QRCodeSVG value={qrCode} size={200} />
                    ) : (
                      <div className="profile-loading-qr">Failed to generate QR code</div>
                    )}
                  </div>

                  <div className="profile-secret-key">
                    <p><strong>🔑 Manual entry secret key:</strong></p>
                    <code className="profile-secret-code">{secret}</code>
                    <button
                      className="profile-btn profile-btn-sm profile-btn-secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(secret);
                        alert('✅ Secret key copied to clipboard!');
                      }}
                    >
                      <FaCopy /> Copy Secret
                    </button>
                    <p className="hint-text">Use this if you can't scan the QR code</p>
                  </div>
                </>
              )}

              <div className="profile-modal-actions">
                <button
                  className="profile-btn profile-btn-primary"
                  onClick={() => setStep(2)}
                  disabled={loading || !qrCode}
                >
                  Next: I've Scanned the Code →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFY CODE */}
          {step === 2 && (
            <div className="profile-security-step">
              <div className="step-indicator">
                <span className="step-badge active">Step 2 of 3</span>
              </div>

              <h4>🔢 Enter the 6-digit Code from Authenticator</h4>

              <div className="instruction-box">
                <p><strong>What to do:</strong></p>
                <ol>
                  <li>Open <strong>Google Authenticator</strong> app on your phone</li>
                  <li>Find the <strong>"Pankhudi"</strong> entry</li>
                  <li>Enter the <strong>6-digit code</strong> shown below</li>
                  <li>Code changes every 30 seconds - enter it quickly!</li>
                </ol>
              </div>

              {verificationError && (
                <div className="profile-error-message">
                  <FaExclamationCircle /> {verificationError}
                </div>
              )}

              <div className="verification-code-input">
                <input
                  type="text"
                  className="profile-form-control large-input"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setVerificationError('');
                  }}
                  maxLength={6}
                  disabled={loading}
                  autoFocus
                />
                <p className="hint-text">Code from Google Authenticator app</p>
              </div>

              <div className="profile-modal-actions">
                <button
                  className="profile-btn profile-btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  className="profile-btn profile-btn-primary"
                  onClick={verify2FA}
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="profile-spin" /> Verifying...
                    </>
                  ) : (
                    'Verify & Continue →'
                  )}
                </button>
              </div>

              <p className="profile-help-text">
                <FaInfoCircle /> <strong>Can't see the code?</strong> Make sure your phone's time is set to automatic (Settings → Date & Time)
              </p>
            </div>
          )}

          {/* STEP 3: BACKUP CODES */}
          {step === 3 && (
            <div className="profile-security-step">
              <div className="step-indicator">
                <span className="step-badge active">Step 3 of 3 - CRITICAL!</span>
              </div>

              <h4>⚠️ SAVE THESE BACKUP CODES</h4>

              <div className="warning-box">
                <FaExclamationTriangle className="warning-icon" />
                <div>
                  <strong>If you lose your phone, you CANNOT login without these codes!</strong>
                  <p>Each code can be used ONLY ONCE. Store them safely.</p>
                </div>
              </div>

              <div className="backup-codes-container">
                <p><strong>Your 8 backup codes:</strong></p>
                <div className="profile-backup-codes">
                  {backupCodes.map((code, index) => (
                    <div className="profile-backup-code" key={index}>
                      <span className="code-number">{index + 1}.</span> {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="storage-options">
                <p><strong>📌 Recommended ways to store:</strong></p>
                <ul>
                  <li>✍️ Write them on paper and keep in safe place</li>
                  <li>🔐 Save in password manager (LastPass, 1Password, Bitwarden)</li>
                  <li>📸 Take a screenshot and store in secure folder</li>
                  <li>☁️ Save in encrypted cloud storage</li>
                </ul>
              </div>

              <div className="profile-modal-actions">
                <button
                  className="profile-btn profile-btn-secondary"
                  onClick={copyBackupCodes}
                >
                  <FaCopy /> Copy All Codes
                </button>
                <button
                  className="profile-btn profile-btn-success"
                  onClick={onClose}
                >
                  <FaCheck /> I've Saved My Codes - Done
                </button>
              </div>

              <div className="success-message">
                <p className="profile-success-message">
                  <FaCheck /> Two-factor authentication has been successfully enabled!
                </p>
                <p className="next-steps">
                  <strong>Next time you login:</strong> You'll need to enter a code from Google Authenticator.
                  <br />
                  <strong>Lost your phone?</strong> Use one of your backup codes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// ACTIVITY LOG MODAL COMPONENT
// ============================================
const ActivityLogModal = ({ isOpen, onClose, activities, loading }) => {
  if (!isOpen) return null;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'profile-status-success';
      case 'failed':
        return 'profile-status-failed';
      default:
        return 'profile-status-unknown';
    }
  };

  return (
    <div className="profile-modal-overlay active" onClick={onClose}>
      <div className="profile-modal-content active profile-activity-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3><FaHistory /> Login Activity</h3>
          <button className="profile-close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body">
          {loading ? (
            <div className="profile-loading-addresses">
              <div className="profile-spinner"></div>
              <p>Loading login activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="profile-no-activity">
              <p>No login activity found</p>
            </div>
          ) : (
            <div className="profile-activity-list">
              {activities.map((activity, index) => (
                <div className="profile-activity-item" key={activity.id || index}>
                  <div className="profile-activity-icon">
                    {activity.device_type === 'mobile' ? <FaMobileAlt /> : <FaDesktop />}
                  </div>
                  <div className="profile-activity-details">
                    <h4>{activity.action || 'Login'} from {activity.browser || 'Unknown Browser'}</h4>
                    <p>{activity.os || 'Unknown OS'} • {activity.location || 'Unknown Location'}</p>
                    <div className="profile-activity-meta">
                      <span className="profile-activity-time">
                        <FaClock /> {formatTimestamp(activity.timestamp)}
                      </span>
                      <span className="profile-activity-ip">
                        <FaDatabase /> IP: {activity.ip_address || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="profile-activity-status">
                    <span className={`profile-status-badge ${getStatusColor(activity.status)}`}>
                      {activity.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SESSIONS MODAL COMPONENT
// ============================================
const SessionsModal = ({ isOpen, onClose, sessions, onRevokeSession, loading }) => {
  if (!isOpen) return null;

  const formatLastActive = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  return (
    <div className="profile-modal-overlay active" onClick={onClose}>
      <div className="profile-modal-content active profile-sessions-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3><FaDesktop /> Active Sessions</h3>
          <button className="profile-close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body">
          {loading ? (
            <div className="profile-loading-addresses">
              <div className="profile-spinner"></div>
              <p>Loading active sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="profile-no-sessions">
              <p>No active sessions found</p>
            </div>
          ) : (
            <div className="profile-sessions-list">
              {sessions.map((session, index) => (
                <div
                  className={`profile-session-item ${session.current ? 'profile-current-session' : ''}`}
                  key={session.id || index}
                >
                  <div className="profile-session-icon">
                    {session.device_type === 'mobile' ? <FaMobileAlt /> : <FaDesktop />}
                  </div>
                  <div className="profile-session-details">
                    <h4>{session.browser || 'Unknown Browser'} on {session.os || 'Unknown OS'}</h4>
                    <div className="profile-session-meta">
                      <p className="profile-session-location">
                        <MdLocationOn /> IP: {session.ip_address || 'Unknown'}
                      </p>
                      <p className="profile-session-time">
                        <FaClock /> Last active: {formatLastActive(session.last_active)}
                      </p>
                    </div>
                    {session.current && (
                      <span className="profile-current-badge">Current Session</span>
                    )}
                  </div>
                  <div className="profile-session-actions">
                    {!session.current && (
                      <button
                        className="profile-btn profile-btn-danger profile-btn-sm"
                        onClick={() => onRevokeSession(session.id)}
                        title="Revoke this session"
                      >
                        <FaPowerOff /> Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// DELETE ACCOUNT MODAL COMPONENT
// ============================================
const DeleteAccountModal = ({ isOpen, onClose, onDeleteAccount }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    if (!password) {
      alert('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      await onDeleteAccount(password);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay active" onClick={onClose}>
      <div className="profile-modal-content active profile-delete-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h3><FaExclamationTriangle /> Delete Account</h3>
          <button className="profile-close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body">
          {step === 1 && (
            <>
              <div className="profile-warning-section">
                <div className="profile-warning-icon">
                  <FaExclamationTriangle />
                </div>
                <h4>Warning: This action is irreversible!</h4>
                <p>Deleting your account will:</p>
                <ul className="profile-delete-consequences">
                  <li>Deactivate your account (soft delete)</li>
                  <li>Deactivate all your addresses</li>
                  <li>Remove your personal data</li>
                  <li>Cancel any active subscriptions</li>
                  <li>Remove your access to the platform</li>
                </ul>
              </div>

              <div className="profile-confirmation-input">
                <p>Type <strong>DELETE MY ACCOUNT</strong> to confirm:</p>
                <input
                  type="text"
                  className="profile-form-control"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                />
              </div>

              <div className="profile-modal-actions">
                <button className="profile-btn profile-btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="profile-btn profile-btn-danger"
                  onClick={() => setStep(2)}
                  disabled={confirmationText !== 'DELETE MY ACCOUNT'}
                >
                  Continue to Security Check
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="profile-security-check">
                <h4>Security Verification</h4>
                <p>For security, please enter your password:</p>
                <div className="profile-password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="profile-form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your current password"
                    disabled={loading}
                  />
                  <button
                    className="profile-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="profile-modal-actions">
                <button
                  className="profile-btn profile-btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  className="profile-btn profile-btn-danger"
                  onClick={handleDelete}
                  disabled={!password || loading}
                >
                  {loading ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// ADDRESS CARD COMPONENT
// ============================================
const AddressCard = ({ address, getAddressTypeIcon, onEdit, onDelete, onSetDefault, onCopy }) => (
  <div className={`profile-address-card ${address.is_default ? 'profile-default-address' : ''}`}>
    <div className="profile-address-header">
      <div className="profile-address-type">
        {getAddressTypeIcon(address.address_type)}
        <span className="profile-type-text">
          {address.address_type ? address.address_type.charAt(0).toUpperCase() + address.address_type.slice(1) : 'Home'}
          {address.is_default && <span className="profile-default-badge">Default</span>}
        </span>
      </div>
      <div className="profile-address-actions">
        <button
          className="profile-action-icon-btn profile-copy-btn"
          onClick={() => onCopy(address)}
          title="Copy address"
        >
          <FaCopy />
        </button>
        <button
          className="profile-action-icon-btn profile-edit-btn"
          onClick={() => onEdit(address)}
          title="Edit address"
        >
          <FaRegEdit />
        </button>
        <button
          className="profile-action-icon-btn profile-delete-btn"
          onClick={() => onDelete(address.id)}
          title="Delete address"
        >
          <FaTrash />
        </button>
      </div>
    </div>

    <div className="profile-address-body">
      <div className="profile-address-name-phone">
        <h4>{address.full_name}</h4>
        <p className="profile-phone">{address.phone}</p>
      </div>

      <div className="profile-address-details">
        <p>{address.address_line}</p>
        <p className="profile-city-state">
          {address.city}, {address.state} - {address.postal_code}
        </p>
        <p className="profile-country">{address.country || 'India'}</p>
      </div>

      {!address.is_default && (
        <button
          className="profile-btn profile-btn-outline profile-btn-sm"
          onClick={() => onSetDefault(address.id)}
        >
          <FaCheck /> Set as Default
        </button>
      )}
    </div>

    <div className="profile-address-footer">
      <span className="profile-address-date">
        Added: {new Date(address.created_at || Date.now()).toLocaleDateString()}
      </span>
      {address.is_default && (
        <span className="profile-default-indicator">
          <FaCheck /> Default Shipping Address
        </span>
      )}
    </div>
  </div>
);

// ============================================
// MAIN PROFILE COMPONENT
// ============================================
const Profile = () => {
  const navigate = useNavigate();

  // User and Profile State
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [sessionExpired, setSessionExpired] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    theme: "light",
    language: "english",
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      updates: true
    },
    privacy: {
      profile_visibility: "public",
      show_online_status: true,
      allow_tagging: true,
      search_visibility: true,
      data_sharing: false
    }
  });

  // Security State
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loginActivities, setLoginActivities] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Address State
  const [userAddresses, setUserAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    address_type: "home",
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false
  });

  // QR Code State
  const [qrValue, setQrValue] = useState('');
  const qrRef = useRef();

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const getMultipartHeaders = () => ({
    Authorization: `Bearer ${getAuthToken()}`,
  });

  const showStatusMessage = (type, message, duration = 3000) => {
    setSaveStatus({ type, message });
    setTimeout(() => setSaveStatus({ type: '', message: '' }), duration);
  };

  // ============================================
  // DATA FETCHING FUNCTIONS
  // ============================================
  const fetchUserAddresses = async () => {
    try {
      setAddressLoading(true);
      const response = await axios.get(API_CONFIG.ADDRESS_LIST, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        const addresses = response.data.addresses || [];
        setUserAddresses(addresses);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(API_CONFIG.SETTINGS_GET, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        const settingsData = response.data.settings;
        setSettings({
          theme: settingsData.theme || "light",
          language: settingsData.language || "english",
          notifications: settingsData.notifications || {
            email: true, push: true, sms: false, marketing: false, updates: true
          },
          privacy: settingsData.privacy || {
            profile_visibility: "public", show_online_status: true,
            allow_tagging: true, search_visibility: true, data_sharing: false
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchSecurityData = async () => {
    try {
      setSecurityLoading(true);

      // Fetch 2FA status
      try {
        const twoFAResponse = await axios.get(API_CONFIG.TWO_FA_STATUS, {
          headers: getAuthHeaders()
        });
        if (twoFAResponse.data.success) {
          setTwoFAEnabled(twoFAResponse.data.enabled);
        }
      } catch (error) {
        console.error('Error fetching 2FA status:', error);
      }

      // Fetch login activities
      try {
        const activityResponse = await axios.get(API_CONFIG.LOGIN_ACTIVITY, {
          headers: getAuthHeaders(),
          params: { limit: 50 }
        });
        if (activityResponse.data.success) {
          setLoginActivities(activityResponse.data.activities || []);
        }
      } catch (error) {
        console.error('Error fetching login activities:', error);
      }

      // Fetch active sessions
      try {
        const sessionsResponse = await axios.get(API_CONFIG.SESSIONS, {
          headers: getAuthHeaders()
        });
        if (sessionsResponse.data.success) {
          // Mark current session (you'll need to implement logic to identify current session)
          const sessions = (sessionsResponse.data.sessions || []).map(session => ({
            ...session,
            current: false // You'll need to set this based on some logic
          }));
          setActiveSessions(sessions);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setActiveSessions([]);
      }
    } catch (error) {
      console.error('Error in fetchSecurityData:', error);
    } finally {
      setSecurityLoading(false);
    }
  };

  // ============================================
  // PROFILE FETCH
  // ============================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setSessionExpired(true);
          return;
        }

        const response = await axios.get(API_CONFIG.PROFILE, {
          headers: getAuthHeaders(),
        });

        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            password: '',
            is_premium: userData.is_premium || 0
          });

          if (userData.avatar) {
            let avatarUrl = userData.avatar;
            if (!avatarUrl.startsWith("http")) {
              avatarUrl = API_CONFIG.UPLOADS + avatarUrl.replace(/^\/+/, "");
            }
            setAvatarPreview(avatarUrl);
          }
        } else {
          setSessionExpired(true);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setSessionExpired(true);
        } else {
          console.error('Error fetching profile:', err);
          showStatusMessage('error', 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch additional data when user is loaded
  useEffect(() => {
    if (user?.id) {
      const profileUrl = `${window.location.origin}/user/${user.id}`;
      setQrValue(profileUrl);

      const fetchAllData = async () => {
        try {
          await Promise.all([
            fetchUserAddresses(),
            fetchSettings(),
            fetchSecurityData()
          ]);
        } catch (error) {
          console.error('Error fetching additional data:', error);
        }
      };

      fetchAllData();
    }
  }, [user]);

  // ============================================
  // PROFILE UPDATE FUNCTIONS
  // ============================================
  const handleSave = async () => {
    try {
      const data = new FormData();

      if (formData.name) data.append("name", formData.name);
      if (formData.email) data.append("email", formData.email);
      if (formData.phone) data.append("phone", formData.phone);
      if (formData.password) data.append("password", formData.password);
      if (formData.is_premium !== undefined) data.append("is_premium", formData.is_premium);

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const response = await axios.put(API_CONFIG.PROFILE, data, {
        headers: getMultipartHeaders()
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        setFormData(prev => ({
          ...prev,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          password: '',
          is_premium: updatedUser.is_premium
        }));

        if (updatedUser.avatar) {
          let avatarUrl = updatedUser.avatar;
          if (!avatarUrl.startsWith("http")) {
            avatarUrl = API_CONFIG.UPLOADS + avatarUrl.replace(/^\/+/, "");
          }
          setAvatarPreview(avatarUrl);
        }

        setAvatarFile(null);
        setEditMode(false);
        showStatusMessage('success', 'Profile updated successfully!');
      }
    } catch (err) {
      showStatusMessage('error', err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
      is_premium: user?.is_premium || 0
    });
    setAvatarFile(null);
    if (user?.avatar) {
      let avatarUrl = user.avatar;
      if (!avatarUrl.startsWith("http")) {
        avatarUrl = API_CONFIG.UPLOADS + avatarUrl.replace(/^\/+/, "");
      }
      setAvatarPreview(avatarUrl);
    }
    setEditMode(false);
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm("Are you sure you want to delete your profile picture?")) return;

    try {
      const response = await axios.delete(API_CONFIG.PROFILE_AVATAR, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setAvatarPreview(null);
        setUser(prev => ({ ...prev, avatar: null }));
        setAvatarFile(null);
        showStatusMessage('success', "Profile picture deleted successfully!");
      }
    } catch (err) {
      showStatusMessage('error', err.response?.data?.message || 'Failed to delete profile picture');
    }
  };

  // ============================================
  // 2FA FUNCTIONS
  // ============================================
  const handle2FAToggle = async () => {
    if (twoFAEnabled) {
      if (!window.confirm('Are you sure you want to disable two-factor authentication?')) return;

      try {
        const response = await axios.post(API_CONFIG.TWO_FA_DISABLE, {}, {
          headers: getAuthHeaders()
        });

        if (response.data.success) {
          setTwoFAEnabled(false);
          showStatusMessage('success', 'Two-factor authentication disabled');
          fetchSecurityData();
        }
      } catch (error) {
        showStatusMessage('error', error.response?.data?.message || 'Failed to disable 2FA');
      }
    } else {
      setShow2FAModal(true);
    }
  };

  const handleEnable2FA = async () => {
    setTwoFAEnabled(true);
    showStatusMessage('success', 'Two-factor authentication enabled successfully!');
    fetchSecurityData();
  };

  // ============================================
  // SESSION FUNCTIONS
  // ============================================
  const revokeSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to revoke this session?')) return;

    try {
      const response = await axios.delete(`${API_CONFIG.SESSIONS}/${sessionId}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        showStatusMessage('success', 'Session revoked successfully');
        fetchSecurityData();
      }
    } catch (error) {
      showStatusMessage('error', error.response?.data?.message || 'Failed to revoke session');
    }
  };

  // ============================================
  // ACCOUNT FUNCTIONS
  // ============================================
  const deleteAccount = async (password) => {
    try {
      const response = await axios.delete(API_CONFIG.ACCOUNT_DELETE, {
        headers: getAuthHeaders(),
        data: { password }
      });

      if (response.data.success) {
        showStatusMessage('success', 'Account deleted successfully');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete account';
      showStatusMessage('error', errorMsg);
      throw error;
    }
  };

  // ============================================
  // ADDRESS FUNCTIONS
  // ============================================
  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveAddress = async () => {
    try {
      setAddressSaving(true);

      const requiredFields = ['full_name', 'phone', 'address_line', 'city', 'state', 'postal_code'];
      const missingFields = requiredFields.filter(field => !addressForm[field]?.trim());

      if (missingFields.length > 0) {
        showStatusMessage('error', `Please fill all required fields: ${missingFields.join(', ')}`);
        setAddressSaving(false);
        return;
      }

      const phoneDigits = addressForm.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        showStatusMessage('error', 'Phone number must be at least 10 digits');
        setAddressSaving(false);
        return;
      }

      let response;
      const addressData = {
        ...addressForm,
        phone: phoneDigits,
        is_default: addressForm.is_default ? 1 : 0,
        country: addressForm.country || 'India'
      };

      if (editingAddress) {
        response = await axios.put(
          `${API_CONFIG.ADDRESS_UPDATE}/${editingAddress.id}`,
          addressData,
          { headers: getAuthHeaders() }
        );
      } else {
        response = await axios.post(
          API_CONFIG.ADDRESS_CREATE,
          addressData,
          { headers: getAuthHeaders() }
        );
      }

      if (response.data.success) {
        showStatusMessage('success', `Address ${editingAddress ? 'updated' : 'saved'} successfully!`);
        fetchUserAddresses();
        resetAddressForm();
        setShowAddressForm(false);
      }
    } catch (error) {
      showStatusMessage('error', error.response?.data?.message || 'Failed to save address');
    } finally {
      setAddressSaving(false);
    }
  };

  const editAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      address_type: address.address_type || "home",
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line: address.address_line || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "India",
      is_default: address.is_default === 1 || address.is_default === true
    });
    setShowAddressForm(true);
  };

  const deleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await axios.delete(
        `${API_CONFIG.ADDRESS_DELETE}/${addressId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        showStatusMessage('success', "Address deleted successfully!");
        fetchUserAddresses();
      }
    } catch (error) {
      showStatusMessage('error', error.response?.data?.message || 'Failed to delete address');
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const response = await axios.put(
        `${API_CONFIG.ADDRESS_DEFAULT}/${addressId}/default`,
        {},
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        showStatusMessage('success', "Default address updated!");
        fetchUserAddresses();
      }
    } catch (error) {
      showStatusMessage('error', error.response?.data?.message || 'Failed to set default address');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      address_type: "home",
      full_name: "",
      phone: "",
      address_line: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      is_default: false
    });
    setEditingAddress(null);
  };

  const copyAddressToClipboard = (address) => {
    const addressText = `${address.full_name}\n${address.phone}\n${address.address_line}\n${address.city}, ${address.state} - ${address.postal_code}\n${address.country || 'India'}`;

    navigator.clipboard.writeText(addressText)
      .then(() => showStatusMessage('success', 'Address copied to clipboard!'))
      .catch(() => showStatusMessage('error', 'Failed to copy address'));
  };

  const getAddressTypeIcon = (type) => {
    const icons = {
      'home': <FaHome />,
      'work': <FaBriefcase />,
      'other': <FaMapPin />
    };
    return icons[type] || <FaHome />;
  };

  // ============================================
  // SETTINGS FUNCTIONS
  // ============================================
  const saveSettings = async () => {
    try {
      const response = await axios.put(API_CONFIG.SETTINGS_UPDATE, settings, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        showStatusMessage('success', 'Settings updated successfully!');
        if (settings.theme) {
          document.documentElement.setAttribute('data-theme', settings.theme);
          localStorage.setItem('theme', settings.theme);
        }
      }
    } catch (error) {
      showStatusMessage('error', error.response?.data?.message || 'Failed to save settings');
    }
  };

  const updateSettings = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = key.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleThemeChange = (newTheme) => {
    updateSettings('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const getPasswordStrength = useCallback((password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, []);

  const passwordStrength = useMemo(() =>
    getPasswordStrength(formData.password || ""),
    [formData.password, getPasswordStrength]
  );

  const strengthColor = (strength) => {
    const colors = ["#ff4444", "#ff7744", "#ffaa44", "#44aa44", "#22aa22"];
    return colors[strength] || "#ccc";
  };

  const togglePremium = () => {
    if (user.is_premium) {
      setFormData({ ...formData, is_premium: 0 });
    } else {
      navigate("/premium");
    }
  };

  const downloadProfile = async (format) => {
    try {
      if (format === 'json') {
        const dataStr = JSON.stringify({
          user: user,
          settings: settings,
          addresses: userAddresses,
          lastUpdated: new Date().toISOString()
        }, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = `pankhudi-profile-${user.name?.replace(/\s+/g, '-') || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showStatusMessage('success', 'Profile data downloaded!');
      }
    } catch (error) {
      showStatusMessage('error', 'Failed to download profile data');
    }
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s Profile`,
        text: `Check out ${user.name}'s profile on Pankhudi`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showStatusMessage('success', 'Profile URL copied to clipboard!');
    }
  };

  const copyToClipboard = async (text, fieldName) => {
    if (!text || text === "Not provided") return;
    try {
      await navigator.clipboard.writeText(text);
      showStatusMessage('success', `${fieldName} copied to clipboard!`);
    } catch (err) {
      showStatusMessage('error', 'Failed to copy to clipboard');
    }
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    try {
      const svgElement = qrRef.current.querySelector('svg');
      if (!svgElement) {
        showStatusMessage('error', 'QR code not available');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `pankhudi-profile-${user.name?.replace(/\s+/g, '-') || 'user'}-qr.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => URL.revokeObjectURL(svgUrl), 100);
      showStatusMessage('success', 'QR code downloaded!');
    } catch (err) {
      showStatusMessage('error', 'Failed to download QR code');
    }
  };

  // ============================================
  // DROPZONE SETUP
  // ============================================
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxFiles: 1,
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
      }
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        showStatusMessage('error', 'File size must be less than 5MB');
      } else if (error?.code === 'file-invalid-type') {
        showStatusMessage('error', 'Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      }
    }
  });

  // ============================================
  // SESSION EXPIRY HANDLER
  // ============================================
  useEffect(() => {
    if (sessionExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("theme");
    }
  }, [sessionExpired]);

  // ============================================
  // PROFILE FIELDS CONFIGURATION
  // ============================================
  const profileFields = useMemo(() => [
    { key: "name", label: "Full Name", icon: FaUser, type: "text" },
    { key: "email", label: "Email Address", icon: FaEnvelope, type: "email" },
    { key: "phone", label: "Phone Number", icon: FaPhone, type: "tel" }
  ], []);

  // ============================================
  // RENDER CONDITIONS
  // ============================================
  if (sessionExpired) {
    return (
      <div className="profile-session-expired">
        <div className="profile-expired-card">
          <h2><FaExclamationTriangle /> Session Expired</h2>
          <p>Your session has expired. Please login again to continue.</p>
          <button className="profile-btn profile-btn-primary" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-loading-overlay">
        <div className="profile-loading">
          <div className="profile-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <>
      <div className={`profile-page ${settings.theme}`}>
        <div className="profile-header">
          <button className="profile-btn profile-btn-outline" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </button>
          <h2 className="brand-name">Pankhudi</h2>
        </div>

        {saveStatus.message && (
          <div className={`profile-status-message profile-status-${saveStatus.type}`}>
            <p>{saveStatus.message}</p>
          </div>
        )}

        <div className="profile-container">
          {/* Navigation Tabs */}
          <div className="profile-tabs">
            {PROFILE_TABS.map(tab => (
              <button
                key={tab.id}
                className={`profile-tab-btn ${activeTab === tab.id ? "profile-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {React.createElement(tab.icon)} {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <div className="profile-tab-content">
              {/* Avatar Section */}
              <div className="profile-avatar-section">
                <div
                  className={`profile-avatar ${editMode ? "profile-avatar-editable" : ""}`}
                  {...(editMode ? getRootProps() : {})}
                >
                  <input {...getInputProps()} />
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="profile-avatar-image" />
                  ) : (
                    <div className="profile-avatar-fallback">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  {editMode && (
                    <div className="profile-avatar-overlay">
                      <FaEdit className="profile-edit-icon" />
                      <p>Change Photo</p>
                    </div>
                  )}
                </div>
                {editMode && avatarPreview && (
                  <button className="profile-btn profile-btn-danger profile-btn-sm" onClick={handleDeleteAvatar}>
                    <FaTrash /> Remove Photo
                  </button>
                )}
                <div className="profile-badges">
                  {user.is_premium === 1 && (
                    <div className="profile-badge profile-badge-premium">
                      <RiVipCrownFill /> Premium Member
                    </div>
                  )}
                  <div className="profile-badge profile-badge-default">
                    Member since {new Date(user.createdAt || user.registrationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="profile-quick-actions">
                <button className="profile-btn profile-btn-secondary" onClick={shareProfile}>
                  <FaShareAlt /> Share Profile
                </button>
                <button className="profile-btn profile-btn-secondary" onClick={() => downloadProfile('json')}>
                  <FaDownload /> Export Data
                </button>
                {user.is_premium === 1 ? (
                  <button className="profile-btn profile-btn-premium" onClick={togglePremium}>
                    <FaCrown /> Manage Premium
                  </button>
                ) : (
                  <button className="profile-btn profile-btn-outline" onClick={togglePremium}>
                    <FaCrown /> Upgrade to Premium
                  </button>
                )}
              </div>

              {/* Addresses Quick View */}
              <div className="profile-addresses-quick-view">
                <h3><FaMapMarkerAlt /> Saved Addresses ({userAddresses.length})</h3>
                <button
                  className="profile-btn profile-btn-secondary"
                  onClick={() => setActiveTab("addresses")}
                >
                  View All Addresses →
                </button>
              </div>

              {/* Profile Info Note */}
              <div className="profile-info-note">
                <p><FaExclamationTriangle /> <strong>Important:</strong> After updating your profile, you may need to logout and login again to see all changes.</p>
              </div>

              {/* Profile Fields */}
              {profileFields.map(({ key, label, icon: Icon, type }) => (
                <div className="profile-item profile-card" key={key}>
                  <div className="profile-field-header">
                    <label>
                      <Icon /> {label}
                    </label>
                    {!editMode && formData[key] && (
                      <button
                        className="profile-btn profile-btn-sm"
                        onClick={() => copyToClipboard(formData[key], label)}
                        title={`Copy ${label}`}
                      >
                        <FaCopy />
                      </button>
                    )}
                  </div>
                  {editMode ? (
                    <input
                      type={type}
                      className="profile-form-control"
                      value={formData[key] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.value })
                      }
                      placeholder={`Enter your ${label.toLowerCase()}`}
                    />
                  ) : (
                    <p className="profile-value">{formData[key] || "Not provided"}</p>
                  )}
                </div>
              ))}

              {/* Password Field */}
              <div className="profile-item profile-card">
                <label><FaLock /> New Password</label>
                {editMode ? (
                  <div className="profile-password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="profile-form-control"
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Enter new password (optional)"
                    />
                    <button
                      type="button"
                      className="profile-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                    </button>
                  </div>
                ) : (
                  <p>••••••••</p>
                )}
                {editMode && formData.password && (
                  <div className="profile-password-strength-container">
                    <div
                      className="profile-password-strength"
                      style={{
                        width: `${(passwordStrength / 4) * 100}%`,
                        backgroundColor: strengthColor(passwordStrength),
                      }}
                    ></div>
                    <div className="profile-password-strength-labels">
                      <span>Weak</span>
                      <span>Strong</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Premium Status */}
              <div className="profile-item profile-card profile-premium-item">
                <label><RiVipCrownFill /> Account Type</label>
                {editMode ? (
                  <select
                    className="profile-form-control"
                    value={formData.is_premium || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_premium: Number(e.target.value),
                      })
                    }
                  >
                    <option value={0}>Standard User</option>
                    <option value={1}>Premium User</option>
                  </select>
                ) : user.is_premium === 1 ? (
                  <p className="profile-badge profile-badge-premium">
                    <FaCrown /> Premium Account
                  </p>
                ) : (
                  <p>Standard Account</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="profile-actions">
                {editMode ? (
                  <>
                    <button className="profile-btn profile-btn-success" onClick={handleSave}>
                      <FaSave /> Save Changes
                    </button>
                    <button className="profile-btn profile-btn-secondary" onClick={handleCancel}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="profile-btn profile-btn-primary" onClick={() => setEditMode(true)}>
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Addresses Tab Content */}
          {activeTab === "addresses" && (
            <div className="profile-tab-content">
              <div className="profile-addresses-header">
                <h3><FaMapMarkerAlt /> Your Saved Addresses</h3>
                <p>Manage your delivery addresses for faster checkout</p>
              </div>

              <div className="profile-addresses-actions">
                <button
                  className="profile-btn profile-btn-success"
                  onClick={() => {
                    resetAddressForm();
                    setShowAddressForm(true);
                  }}
                >
                  <FaPlus /> Add New Address
                </button>

                <button
                  className="profile-btn profile-btn-secondary"
                  onClick={fetchUserAddresses}
                  disabled={addressLoading}
                >
                  <FaSync /> {addressLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {addressLoading ? (
                <div className="profile-loading-addresses">
                  <div className="profile-spinner"></div>
                  <p>Loading addresses...</p>
                </div>
              ) : userAddresses.length === 0 ? (
                <div className="profile-no-addresses">
                  <FaMapMarkerAlt className="profile-empty-icon" />
                  <h4>No Saved Addresses</h4>
                  <p>Add your first address to get started</p>
                  <button
                    className="profile-btn profile-btn-primary"
                    onClick={() => {
                      resetAddressForm();
                      setShowAddressForm(true);
                    }}
                  >
                    <FaPlus /> Add First Address
                  </button>
                </div>
              ) : (
                <>
                  <div className="profile-addresses-count">
                    <p><strong>{userAddresses.length}</strong> address(es) found</p>
                  </div>
                  <div className="profile-addresses-list">
                    {userAddresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        getAddressTypeIcon={getAddressTypeIcon}
                        onEdit={editAddress}
                        onDelete={deleteAddress}
                        onSetDefault={setDefaultAddress}
                        onCopy={copyAddressToClipboard}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Settings Tab Content */}
          {activeTab === "settings" && (
            <div className="profile-tab-content">
              <h3><AiFillSetting /> Account Settings</h3>

              {/* Appearance Settings */}
              <div className="profile-settings-group profile-card">
                <h4><FaPalette /> Appearance</h4>
                <div className="profile-setting-item">
                  <label>Theme</label>
                  <select
                    className="profile-form-control"
                    value={settings.theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">System Default</option>
                  </select>
                </div>

                <div className="profile-setting-item">
                  <label><FaLanguage /> Language</label>
                  <select
                    className="profile-form-control"
                    value={settings.language}
                    onChange={(e) => updateSettings('language', e.target.value)}
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                  </select>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="profile-settings-group profile-card">
                <h4><FaBell /> Notifications</h4>
                {Object.entries(settings.notifications || {}).map(([key, value]) => (
                  <div className="profile-setting-item profile-toggle" key={key}>
                    <label>{key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}</label>
                    <label className="profile-switch">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => updateSettings(`notifications.${key}`, !value)}
                      />
                      <span className="profile-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              {/* Privacy Settings */}
              <div className="profile-settings-group profile-card">
                <h4><MdPrivacyTip /> Privacy Settings</h4>
                <div className="profile-setting-item">
                  <label>Profile Visibility</label>
                  <select
                    className="profile-form-control"
                    value={settings.privacy?.profile_visibility}
                    onChange={(e) => updateSettings('privacy.profile_visibility', e.target.value)}
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="profile-setting-item profile-toggle">
                  <label>Show Online Status</label>
                  <label className="profile-switch">
                    <input
                      type="checkbox"
                      checked={settings.privacy?.show_online_status}
                      onChange={() => updateSettings('privacy.show_online_status', !settings.privacy?.show_online_status)}
                    />
                    <span className="profile-slider"></span>
                  </label>
                </div>

                <div className="profile-setting-item profile-toggle">
                  <label>Allow Tagging</label>
                  <label className="profile-switch">
                    <input
                      type="checkbox"
                      checked={settings.privacy?.allow_tagging}
                      onChange={() => updateSettings('privacy.allow_tagging', !settings.privacy?.allow_tagging)}
                    />
                    <span className="profile-slider"></span>
                  </label>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="profile-settings-group profile-card">
                <h4><FaQrcode /> Profile QR Code</h4>
                <div className="profile-qrcode-section">
                  <div className="profile-qrcode-placeholder">
                    <p>Scan to view profile</p>
                    <div className="profile-qrcode-image" ref={qrRef}>
                      {qrValue ? (
                        <QRCodeSVG
                          value={qrValue}
                          size={150}
                          level="H"
                          includeMargin
                          bgColor="#ffffff"
                          fgColor="#000000"
                        />
                      ) : (
                        <span>Generating QR Code...</span>
                      )}
                    </div>
                  </div>
                  <button className="profile-btn profile-btn-primary" onClick={downloadQRCode}>
                    <FaDownload /> Download QR Code
                  </button>
                </div>
              </div>

              {/* Settings Actions */}
              <div className="profile-settings-actions">
                <button className="profile-btn profile-btn-success" onClick={saveSettings}>
                  <FaSave /> Save Settings
                </button>
                <button className="profile-btn profile-btn-secondary" onClick={fetchSettings}>
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Security Tab Content */}
          {activeTab === "privacy" && (
            <div className="profile-tab-content">
              <h3><MdSecurity /> Privacy & Security</h3>

              {/* Security Settings */}
              <div className="profile-settings-group profile-card">
                <h4><FaShieldAlt /> Security</h4>
                <div className="profile-setting-item">
                  <label>Two-Factor Authentication</label>
                  <div className="profile-security-status">
                    <span className={`profile-status-indicator ${twoFAEnabled ? 'profile-status-enabled' : 'profile-status-disabled'}`}>
                      {twoFAEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      className={`profile-btn ${twoFAEnabled ? 'profile-btn-danger' : 'profile-btn-primary'}`}
                      onClick={handle2FAToggle}
                      disabled={securityLoading}
                    >
                      {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                  {!twoFAEnabled && (
                    <p className="setting-hint">
                      <FaInfoCircle /> Enable 2FA to add an extra layer of security to your account.
                      You'll need to enter a code from Google Authenticator when logging in.
                    </p>
                  )}
                </div>

                <div className="profile-setting-item">
                  <label>Login Activity</label>
                  <button
                    className="profile-btn profile-btn-secondary"
                    onClick={() => setShowActivityModal(true)}
                    disabled={securityLoading}
                  >
                    <FaHistory /> View Recent Activity ({loginActivities.length})
                  </button>
                </div>

                <div className="profile-setting-item">
                  <label>Active Sessions</label>
                  <button
                    className="profile-btn profile-btn-secondary"
                    onClick={() => setShowSessionsModal(true)}
                    disabled={securityLoading}
                  >
                    <FaDesktop /> Manage Sessions ({activeSessions.length})
                  </button>
                </div>
              </div>

              {/* Data & Privacy */}
              <div className="profile-settings-group profile-card">
                <h4>Data & Privacy</h4>
                <div className="profile-setting-item">
                  <label>Export Your Data</label>
                  <button className="profile-btn profile-btn-secondary" onClick={() => downloadProfile('json')}>
                    <FaDownload /> Download Data Archive
                  </button>
                </div>

                <div className="profile-setting-item profile-danger-zone">
                  <label>Account Deletion</label>
                  <div className="profile-danger-zone-content">
                    <p className="profile-danger-text">
                      <FaExclamationTriangle /> Permanently delete your account and all associated data
                    </p>
                    <button
                      className="profile-btn profile-btn-danger"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <FaTrash /> Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddressFormModal
        isOpen={showAddressForm}
        editingAddress={editingAddress}
        addressForm={addressForm}
        onInputChange={handleAddressInputChange}
        onSave={saveAddress}
        onClose={() => {
          setShowAddressForm(false);
          resetAddressForm();
        }}
        loading={addressSaving}
      />

      <TwoFAModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onEnable2FA={handleEnable2FA}
        user={user}
      />

      <ActivityLogModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        activities={loginActivities}
        loading={securityLoading}
      />

      <SessionsModal
        isOpen={showSessionsModal}
        onClose={() => setShowSessionsModal(false)}
        sessions={activeSessions}
        onRevokeSession={revokeSession}
        loading={securityLoading}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteAccount={deleteAccount}
      />
    </>
  );
};

export default Profile;