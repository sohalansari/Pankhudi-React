import React, { useState } from "react";
import "./Settings.css";

function Settings() {
    // State for various admin settings
    const [settings, setSettings] = useState({
        system: {
            maintenanceMode: false,
            userRegistration: true,
            emailVerification: true,
            autoBackup: true,
            backupFrequency: "daily"
        },
        security: {
            twoFactorAuth: true,
            passwordExpiry: 90,
            loginAttempts: 5,
            sessionTimeout: 60
        },
        notifications: {
            newUser: true,
            failedLogin: true,
            systemErrors: true,
            databaseBackup: true
        },
        appearance: {
            theme: "light",
            sidebarColor: "blue",
            dashboardLayout: "grid"
        }
    });

    // Handle toggle changes
    const handleToggle = (category, setting) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: !prev[category][setting]
            }
        }));
    };

    // Handle input changes
    const handleInputChange = (category, setting, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: value
            }
        }));
    };

    // Handle save settings
    const handleSaveSettings = () => {
        // In a real app, you would send these settings to your backend
        console.log("Saving settings:", settings);
        alert("Settings saved successfully!");
    };

    // Handle reset to defaults
    const handleResetDefaults = () => {
        if (window.confirm("Are you sure you want to reset all settings to default?")) {
            setSettings({
                system: {
                    maintenanceMode: false,
                    userRegistration: true,
                    emailVerification: true,
                    autoBackup: true,
                    backupFrequency: "daily"
                },
                security: {
                    twoFactorAuth: true,
                    passwordExpiry: 90,
                    loginAttempts: 5,
                    sessionTimeout: 60
                },
                notifications: {
                    newUser: true,
                    failedLogin: true,
                    systemErrors: true,
                    databaseBackup: true
                },
                appearance: {
                    theme: "light",
                    sidebarColor: "blue",
                    dashboardLayout: "grid"
                }
            });
            alert("Settings reset to defaults!");
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h2>Admin Settings</h2>
                <p>Manage system configuration and preferences</p>
            </div>

            <div className="settings-container">
                {/* System Settings */}
                <div className="settings-card">
                    <h3>System Settings</h3>
                    <div className="settings-group">
                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Maintenance Mode</h4>
                                <p>Put the system in maintenance mode (users will see a maintenance page)</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.system.maintenanceMode}
                                    onChange={() => handleToggle("system", "maintenanceMode")}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>User Registration</h4>
                                <p>Allow new users to register accounts</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.system.userRegistration}
                                    onChange={() => handleToggle("system", "userRegistration")}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Email Verification</h4>
                                <p>Require users to verify their email address</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.system.emailVerification}
                                    onChange={() => handleToggle("system", "emailVerification")}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Auto Backup</h4>
                                <p>Automatically backup database and files</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.system.autoBackup}
                                    onChange={() => handleToggle("system", "autoBackup")}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Backup Frequency</h4>
                                <p>How often to perform automatic backups</p>
                            </div>
                            <select
                                value={settings.system.backupFrequency}
                                onChange={(e) => handleInputChange("system", "backupFrequency", e.target.value)}
                                className="setting-select"
                            >
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="settings-card">
                    <h3>Security Settings</h3>
                    <div className="settings-group">
                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Two-Factor Authentication</h4>
                                <p>Require 2FA for all admin accounts</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.security.twoFactorAuth}
                                    onChange={() => handleToggle("security", "twoFactorAuth")}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Password Expiry (Days)</h4>
                                <p>Number of days before passwords expire</p>
                            </div>
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={settings.security.passwordExpiry}
                                onChange={(e) => handleInputChange("security", "passwordExpiry", parseInt(e.target.value))}
                                className="setting-input"
                            />
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Max Login Attempts</h4>
                                <p>Number of failed attempts before account lockout</p>
                            </div>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={settings.security.loginAttempts}
                                onChange={(e) => handleInputChange("security", "loginAttempts", parseInt(e.target.value))}
                                className="setting-input"
                            />
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Session Timeout (Minutes)</h4>
                                <p>Time of inactivity before automatic logout</p>
                            </div>
                            <input
                                type="number"
                                min="1"
                                max="480"
                                value={settings.security.sessionTimeout}
                                onChange={(e) => handleInputChange("security", "sessionTimeout", parseInt(e.target.value))}
                                className="setting-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="settings-card">
                    <h3>Admin Notifications</h3>
                    <div className="settings-group">
                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>New User Registrations</h4>
                                <p>Get notified when a new user registers</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.newUser}
                                    onChange={() => handleToggle("notifications", "newUser")}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Failed Login Attempts</h4>
                                <p>Get notified of failed login attempts</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.failedLogin}
                                    onChange={() => handleToggle("notifications", "failedLogin")}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>System Errors</h4>
                                <p>Get notified of system errors and exceptions</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.systemErrors}
                                    onChange={() => handleToggle("notifications", "systemErrors")}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Database Backups</h4>
                                <p>Get notified when backups are completed</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.databaseBackup}
                                    onChange={() => handleToggle("notifications", "databaseBackup")}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="settings-card">
                    <h3>Appearance</h3>
                    <div className="settings-group">
                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Theme</h4>
                                <p>Choose the default theme for the admin panel</p>
                            </div>
                            <select
                                value={settings.appearance.theme}
                                onChange={(e) => handleInputChange("appearance", "theme", e.target.value)}
                                className="setting-select"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto (System)</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Sidebar Color</h4>
                                <p>Choose the color scheme for the sidebar</p>
                            </div>
                            <select
                                value={settings.appearance.sidebarColor}
                                onChange={(e) => handleInputChange("appearance", "sidebarColor", e.target.value)}
                                className="setting-select"
                            >
                                <option value="blue">Blue</option>
                                <option value="dark">Dark</option>
                                <option value="purple">Purple</option>
                                <option value="green">Green</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Dashboard Layout</h4>
                                <p>Choose how dashboard widgets are arranged</p>
                            </div>
                            <select
                                value={settings.appearance.dashboardLayout}
                                onChange={(e) => handleInputChange("appearance", "dashboardLayout", e.target.value)}
                                className="setting-select"
                            >
                                <option value="grid">Grid</option>
                                <option value="list">List</option>
                                <option value="compact">Compact</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-actions">
                <button className="btn btn-secondary" onClick={handleResetDefaults}>
                    Reset to Defaults
                </button>
                <button className="btn btn-primary" onClick={handleSaveSettings}>
                    Save Settings
                </button>
            </div>
        </div>
    );
}

export default Settings;