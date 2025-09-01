import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css';
import {
    ArrowLeft,
    PersonCircle,
    Envelope,
    Telephone,
    GeoAlt,
    Calendar,
    ShieldLock,
    QuestionCircle,
    StarFill,
    LightningCharge,
    CheckCircleFill,
    XCircleFill,
    ArrowRepeat,
    PencilSquare,
    ExclamationTriangleFill,
    BarChartLine,
    Eye,
    EyeSlash,
    Clipboard,
    ClipboardCheck,
    ThreeDotsVertical,
    Download,
    Upload,
    Trash
} from 'react-bootstrap-icons';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [dynamicFeatures, setDynamicFeatures] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [securityData, setSecurityData] = useState({
        lastLogin: null,
        devices: []
    });
    const [stats, setStats] = useState({
        activity: 0,
        completedTasks: 0,
        projects: 0
    });
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    // Enhanced default profile with more fields
    const defaultProfile = {
        name: 'Guest User',
        email: 'user@example.com',
        phone: '',
        address: '',
        is_verified: false,
        created_at: new Date().toISOString(),
        premium: false,
        features: ['Basic Access'],
        two_factor_enabled: false,
        backup_codes: []
    };

    // Error boundary simulation
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Simulate network error randomly (for demo purposes)
                if (Math.random() < 0.05) {
                    throw new Error('Simulated network failure');
                }

                const response = await axios.get(`http://localhost:5000/api/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    timeout: 5000 // Add timeout
                });

                if (!response.data.success) {
                    throw new Error(response.data.message || 'Failed to load profile');
                }

                const userData = response.data.user;
                setProfile(userData);
                setIsPremium(userData.is_premium || false);
                setDynamicFeatures(userData.features || ['Basic Access']);
                setFormData({
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone || '',
                    address: userData.address || ''
                });

                setSecurityData({
                    lastLogin: userData.last_login || new Date().toISOString(),
                    devices: userData.devices || [
                        { id: 1, name: 'iPhone 13', os: 'iOS', lastActive: new Date().toISOString() },
                        { id: 2, name: 'MacBook Pro', os: 'macOS', lastActive: new Date(Date.now() - 86400000).toISOString() }
                    ],
                    two_factor_enabled: userData.two_factor_enabled || false,
                    backup_codes: userData.backup_codes || []
                });

                setStats({
                    activity: userData.activity_score || 87,
                    completedTasks: userData.completed_tasks || 24,
                    projects: userData.active_projects || 5
                });

            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to load profile';
                setError(errorMessage);
                toast.error(`Error: ${errorMessage}`);
                setProfile({ ...defaultProfile });
                setHasError(true);

                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else if (err.code === 'ECONNABORTED') {
                    toast.warning('Request timed out. Please check your connection.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, navigate]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/users/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                }
            );

            if (response.data.success) {
                setProfile(prev => ({ ...prev, ...formData }));
                setEditMode(false);
                toast.success('Profile updated successfully!', {
                    autoClose: 2000,
                    position: 'top-right'
                });
            } else {
                throw new Error(response.data.message || 'Update failed');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
            setError(errorMessage);
            toast.error(`Update Error: ${errorMessage}`, {
                autoClose: 3000
            });

            // Log error to error tracking service
            if (process.env.NODE_ENV === 'production') {
                console.error('Profile update error:', {
                    error: err,
                    userId: id,
                    formData
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // New utility functions
    const copyToClipboard = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        toast.info(`${fieldName} copied to clipboard`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const toggleTwoFactorAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/users/${id}/toggle-2fa`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSecurityData(prev => ({
                    ...prev,
                    two_factor_enabled: !prev.two_factor_enabled,
                    backup_codes: response.data.backup_codes || []
                }));
                toast.success(
                    `Two-factor authentication ${securityData.two_factor_enabled ? 'disabled' : 'enabled'}`,
                    { autoClose: 2000 }
                );
            }
        } catch (err) {
            toast.error(`Failed to update 2FA: ${err.message}`);
        }
    };

    const exportProfileData = async () => {
        setExportLoading(true);
        try {
            const data = {
                profile: displayProfile,
                security: securityData,
                stats
            };

            // Simulate export
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `profile-data-${new Date().toISOString()}.json`;
            a.click();

            toast.success('Profile data exported successfully');
        } catch (err) {
            toast.error(`Export failed: ${err.message}`);
        } finally {
            setExportLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        setImportLoading(true);
        try {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    // Validate imported data structure
                    if (data.profile && data.security && data.stats) {
                        toast.success('Profile data imported successfully');
                        // In a real app, you would update state with imported data
                    } else {
                        throw new Error('Invalid file format');
                    }
                } catch (err) {
                    toast.error(`Import failed: ${err.message}`);
                }
            };
            reader.readAsText(file);
        } catch (err) {
            toast.error(`Import failed: ${err.message}`);
        } finally {
            setImportLoading(false);
            e.target.value = ''; // Reset file input
        }
    };

    const upgradeToPremium = () => {
        toast.info('Redirecting to premium upgrade...', {
            position: 'top-center',
            autoClose: 2000
        });
    };

    const changePassword = () => {
        navigate('/change-password');
    };

    const contactSupport = () => {
        window.open('mailto:support@example.com?subject=Profile Support');
    };

    const showHelpCenter = () => {
        navigate('/help-center');
    };

    const displayProfile = profile || defaultProfile;
    const isDefaultProfile = !profile;

    // if (hasError) {
    //     return (
    //         <div className="profile-error-fallback">
    //             <div className="error-content">
    //                 <ExclamationTriangleFill size={48} className="error-icon" />
    //                 <h2>Profile Error</h2>
    //                 <p>We couldn't load your profile data properly.</p>
    //                 <div className="error-actions">
    //                     <button
    //                         onClick={() => window.location.reload()}
    //                         className="error-retry-button"
    //                     >
    //                         <ArrowRepeat className="mr-2" /> Retry
    //                     </button>
    //                     <button
    //                         onClick={() => navigate('/')}
    //                         className="error-home-button"
    //                     >
    //                         Go to Home
    //                     </button>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    if (loading) return (
        <div className="profile-loading-spinner">
            <LoadingSpinner />
            <p className="loading-text">Loading your profile...</p>
        </div>
    );

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="profile-header-content">
                    <button
                        onClick={() => navigate(-1)}
                        className="profile-back-button"
                    >
                        <ArrowLeft className="mr-2" size={18} />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="profile-button-group">
                        <button
                            className={`profile-edit-button ${editMode ? 'edit-mode' : 'default-mode'}`}
                            onClick={() => setEditMode(!editMode)}
                            disabled={isSubmitting || isDefaultProfile}
                        >
                            {editMode ? (
                                <><XCircleFill className="mr-1" size={14} /> Cancel</>
                            ) : (
                                <><PencilSquare className="mr-1" size={14} /> Edit</>
                            )}
                        </button>
                        <button
                            className="profile-refresh-button"
                            onClick={() => window.location.reload()}
                        >
                            <ArrowRepeat className="mr-1" size={14} /> Refresh
                        </button>
                    </div>
                </div>
            </header>

            <main className="profile-main">
                {error && (
                    <div className="profile-error-alert">
                        <ExclamationTriangleFill className="mr-2" size={16} />
                        <div>
                            {error} - Showing {isDefaultProfile ? 'default' : 'partial'} profile data
                            <button
                                onClick={() => setError('')}
                                className="dismiss-error"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                )}

                <div className="profile-card">
                    <div className="profile-card-header">
                        <div className="profile-title-container">
                            <PersonCircle className="profile-title-icon" size={28} />
                            <h2 className="profile-title">
                                User Profile
                                {isPremium && (
                                    <span className="profile-premium-badge">
                                        <StarFill className="mr-1" size={12} />
                                        PREMIUM
                                    </span>
                                )}
                                {isDefaultProfile && (
                                    <span className="profile-demo-badge">
                                        DEMO MODE
                                    </span>
                                )}
                            </h2>
                        </div>
                        {!isPremium && (
                            <button
                                onClick={upgradeToPremium}
                                className="profile-upgrade-button"
                            >
                                <LightningCharge className="mr-1" size={14} />
                                Upgrade
                            </button>
                        )}
                    </div>

                    <div className="profile-tabs-container">
                        <button
                            className={`profile-tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <PersonCircle size={16} />
                            <span>Profile</span>
                        </button>
                        <button
                            className={`profile-tab-button ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <ShieldLock size={16} />
                            <span>Security</span>
                            {securityData.two_factor_enabled && (
                                <span className="tab-badge verified">2FA</span>
                            )}
                        </button>
                        <button
                            className={`profile-tab-button ${activeTab === 'stats' ? 'active' : 'has-notification'}`}
                            onClick={() => setActiveTab('stats')}
                        >
                            <BarChartLine size={16} />
                            <span>Statistics</span>
                        </button>
                    </div>

                    {activeTab === 'profile' && (
                        <div className="profile-content">
                            {editMode ? (
                                <form onSubmit={handleSubmit} className="profile-form">
                                    <div className="profile-form-group">
                                        <label className="profile-form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="profile-form-input"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            minLength="2"
                                            disabled={isDefaultProfile}
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label className="profile-form-label flex items-center">
                                            <Envelope className="mr-2" size={14} />
                                            Email Address
                                        </label>
                                        <div className="input-with-action">
                                            <input
                                                type="email"
                                                className="profile-form-input bg-gray-100"
                                                name="email"
                                                value={formData.email}
                                                disabled
                                                readOnly
                                            />
                                            <button
                                                type="button"
                                                className="input-action-button"
                                                onClick={() => copyToClipboard(formData.email, 'Email')}
                                            >
                                                {copiedField === 'Email' ? (
                                                    <ClipboardCheck size={14} />
                                                ) : (
                                                    <Clipboard size={14} />
                                                )}
                                            </button>
                                        </div>
                                        <p className="profile-form-helper-text">Contact admin to change email</p>
                                    </div>

                                    <div className="profile-form-group">
                                        <label className="profile-form-label flex items-center">
                                            <Telephone className="mr-2" size={14} />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            className="profile-form-input"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            pattern="[0-9]{10,15}"
                                            title="10-15 digit phone number"
                                            disabled={isDefaultProfile}
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label className="profile-form-label flex items-center">
                                            <GeoAlt className="mr-2" size={14} />
                                            Address
                                        </label>
                                        <textarea
                                            className="profile-form-input"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            maxLength="255"
                                            disabled={isDefaultProfile}
                                        />
                                    </div>

                                    <div className="profile-form-actions">
                                        <button
                                            type="button"
                                            className="profile-form-cancel"
                                            onClick={() => setEditMode(false)}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="profile-form-submit"
                                            disabled={isSubmitting || isDefaultProfile}
                                        >
                                            {isSubmitting ? (
                                                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                            ) : (
                                                <CheckCircleFill className="mr-2" size={14} />
                                            )}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="profile-view-grid">
                                        <div>
                                            <h3 className="profile-section-title">Personal Information</h3>
                                            <div className="space-y-4">
                                                <div className="profile-info-row">
                                                    <div className="profile-info-label">
                                                        <PersonCircle className="mr-2" size={16} />
                                                        <span>Full Name</span>
                                                    </div>
                                                    <div className="profile-info-value">
                                                        {displayProfile.name}
                                                        <button
                                                            onClick={() => copyToClipboard(displayProfile.name, 'Name')}
                                                            className="copy-button"
                                                        >
                                                            {copiedField === 'Name' ? (
                                                                <ClipboardCheck size={14} />
                                                            ) : (
                                                                <Clipboard size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="profile-info-row">
                                                    <div className="profile-info-label">
                                                        <Envelope className="mr-2" size={16} />
                                                        <span>Email</span>
                                                    </div>
                                                    <div className="profile-info-value">
                                                        {displayProfile.email}
                                                        <button
                                                            onClick={() => copyToClipboard(displayProfile.email, 'Email')}
                                                            className="copy-button"
                                                        >
                                                            {copiedField === 'Email' ? (
                                                                <ClipboardCheck size={14} />
                                                            ) : (
                                                                <Clipboard size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="profile-info-row">
                                                    <div className="profile-info-label">
                                                        <Telephone className="mr-2" size={16} />
                                                        <span>Phone</span>
                                                    </div>
                                                    <div className="profile-info-value">
                                                        {displayProfile.phone || <span className="text-gray-400">Not provided</span>}
                                                    </div>
                                                </div>
                                                <div className="profile-info-row">
                                                    <div className="profile-info-label">Status</div>
                                                    <div className="profile-info-value">
                                                        {displayProfile.is_verified ? (
                                                            <span className="profile-status-badge verified">
                                                                Verified
                                                            </span>
                                                        ) : (
                                                            <span className="profile-status-badge not-verified">
                                                                Not Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="profile-section-title">Additional Information</h3>
                                            <div className="space-y-4">
                                                <div className="profile-info-row">
                                                    <div className="profile-info-label">
                                                        <GeoAlt className="mr-2" size={16} />
                                                        <span>Address</span>
                                                    </div>
                                                    <div className="profile-info-value">
                                                        {displayProfile.address ? (
                                                            <div className="whitespace-pre-line">{displayProfile.address}</div>
                                                        ) : (
                                                            <span className="text-gray-400">Not provided</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="profile-info-row">
                                                    <div className="profile-info-label">
                                                        <Calendar className="mr-2" size={16} />
                                                        <span>Member Since</span>
                                                    </div>
                                                    <div className="profile-info-value">
                                                        {new Date(displayProfile.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {dynamicFeatures.length > 0 && (
                                        <div className="profile-features-section">
                                            <h3 className="profile-section-title">Your {isPremium ? 'Premium' : ''} Features</h3>
                                            <div className="profile-features-grid">
                                                {dynamicFeatures.map((feature, index) => (
                                                    <div key={index} className="profile-feature-card">
                                                        {isPremium ? (
                                                            <StarFill className="profile-feature-icon premium" size={16} />
                                                        ) : (
                                                            <CheckCircleFill className="profile-feature-icon basic" size={16} />
                                                        )}
                                                        <span className="profile-feature-text">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="profile-content">
                            <div className="profile-view-grid">
                                <div>
                                    <h3 className="profile-section-title">Security Information</h3>
                                    <div className="space-y-4">
                                        <div className="profile-info-row">
                                            <div className="profile-info-label">
                                                <ShieldLock className="mr-2" size={16} />
                                                <span>Last Login</span>
                                            </div>
                                            <div className="profile-info-value">
                                                {securityData.lastLogin ? new Date(securityData.lastLogin).toLocaleString() : 'Unknown'}
                                            </div>
                                        </div>
                                        <div className="profile-info-row">
                                            <div className="profile-info-label">
                                                <ShieldLock className="mr-2" size={16} />
                                                <span>Two-Factor Auth</span>
                                            </div>
                                            <div className="profile-info-value">
                                                <button
                                                    onClick={toggleTwoFactorAuth}
                                                    className={`toggle-2fa ${securityData.two_factor_enabled ? 'enabled' : 'disabled'}`}
                                                >
                                                    {securityData.two_factor_enabled ? 'Disable' : 'Enable'} 2FA
                                                </button>
                                            </div>
                                        </div>
                                        {securityData.two_factor_enabled && securityData.backup_codes.length > 0 && (
                                            <div className="profile-info-row">
                                                <div className="profile-info-label">
                                                    <ShieldLock className="mr-2" size={16} />
                                                    <span>Backup Codes</span>
                                                </div>
                                                <div className="profile-info-value">
                                                    <div className="backup-codes-container">
                                                        <div className="backup-codes">
                                                            {securityData.backup_codes.map((code, i) => (
                                                                <div key={i} className="backup-code">
                                                                    {showPassword ? code : '••••••••'}
                                                                    <button
                                                                        onClick={() => copyToClipboard(code, `Code ${i + 1}`)}
                                                                        className="copy-code"
                                                                    >
                                                                        <Clipboard size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="toggle-show-codes"
                                                        >
                                                            {showPassword ? (
                                                                <><EyeSlash size={14} className="mr-1" /> Hide Codes</>
                                                            ) : (
                                                                <><Eye size={14} className="mr-1" /> Show Codes</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="profile-section-title">Active Devices</h3>
                                    <div className="space-y-3">
                                        {securityData.devices.length > 0 ? (
                                            securityData.devices.map(device => (
                                                <div key={device.id} className="profile-feature-card">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{device.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {device.os} • Last active: {new Date(device.lastActive).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="device-actions">
                                                        <button className="text-sm text-red-500 hover:text-red-700">
                                                            <Trash size={14} />
                                                        </button>
                                                        <button className="text-sm text-blue-500 hover:text-blue-700 ml-2">
                                                            <ThreeDotsVertical size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500">No devices found</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="profile-content">
                            <div className="profile-view-grid">
                                <div>
                                    <h3 className="profile-section-title">Activity</h3>
                                    <div className="space-y-4">
                                        <div className="profile-info-row">
                                            <div className="profile-info-label">Activity Score</div>
                                            <div className="profile-info-value">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{ width: `${stats.activity}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">{stats.activity}% monthly activity</div>
                                            </div>
                                        </div>
                                        <div className="profile-info-row">
                                            <div className="profile-info-label">Completed Tasks</div>
                                            <div className="profile-info-value">
                                                <span className="text-2xl font-bold text-green-600">{stats.completedTasks}</span>
                                                <span className="text-sm text-gray-500 ml-2">this month</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="profile-section-title">Projects</h3>
                                    <div className="space-y-4">
                                        <div className="profile-info-row">
                                            <div className="profile-info-label">Active Projects</div>
                                            <div className="profile-info-value">
                                                <span className="text-2xl font-bold text-purple-600">{stats.projects}</span>
                                            </div>
                                        </div>
                                        {isPremium && (
                                            <div className="profile-info-row">
                                                <div className="profile-info-label">Storage Used</div>
                                                <div className="profile-info-value">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className="bg-yellow-500 h-2.5 rounded-full"
                                                            style={{ width: '35%' }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">3.5GB of 10GB used</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {activeTab === 'profile' && (
                    <div className="profile-actions-section">
                        <h3 className="profile-section-title">Account Actions</h3>
                        <div className="profile-actions-grid">
                            <button
                                className="profile-action-button change-password"
                                onClick={changePassword}
                            >
                                <ShieldLock className="profile-action-icon text-blue-500" size={18} />
                                <span>Change Password</span>
                            </button>
                            <button
                                className="profile-action-button contact-support"
                                onClick={contactSupport}
                            >
                                <Envelope className="profile-action-icon text-purple-500" size={18} />
                                <span>Contact Support</span>
                            </button>
                            <button
                                className="profile-action-button help-center"
                                onClick={showHelpCenter}
                            >
                                <QuestionCircle className="profile-action-icon text-green-500" size={18} />
                                <span>Help Center</span>
                            </button>
                            <div className="profile-action-button data-actions">
                                <div className="data-action-buttons">
                                    <button
                                        onClick={exportProfileData}
                                        disabled={exportLoading}
                                    >
                                        <Download size={16} className="mr-2" />
                                        {exportLoading ? 'Exporting...' : 'Export Data'}
                                    </button>
                                    <label className="import-button">
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleFileUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <Upload size={16} className="mr-2" />
                                        {importLoading ? 'Importing...' : 'Import Data'}
                                    </label>
                                </div>
                            </div>
                            <button
                                onClick={upgradeToPremium}
                                className={`profile-action-button ${isPremium ? 'premium' : 'upgrade'}`}
                            >
                                <LightningCharge className="profile-action-icon text-yellow-600" size={18} />
                                <span>{isPremium ? 'Premium Settings' : 'Upgrade to Premium'}</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <Footer className="mt-auto" />
        </div>
    );
};

export default Profile;