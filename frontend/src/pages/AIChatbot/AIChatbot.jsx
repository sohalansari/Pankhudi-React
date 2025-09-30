import React, { useState, useEffect, useRef } from 'react';
import './AIChatbot.css';

import {
    FaPaperPlane, FaRobot, FaUser, FaTshirt,
    FaSearch, FaShoppingBag, FaTrash, FaEllipsisV,
    FaCopy, FaMoon, FaSun, FaPlus, FaTimes,
    FaDownload, FaUpload, FaEdit, FaSave,
    FaShoppingCart, FaHeart, FaShippingFast,
    FaExchangeAlt, FaQuestionCircle, FaBars,
    FaSlidersH, FaPalette, FaFont, FaVolumeUp,
    FaExpand, FaCompress, FaCog, FaClock
} from 'react-icons/fa';
import { IoChevronBackOutline } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";

function AIChatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [model] = useState('gemini-2.0-flash');
    const [showOptions, setShowOptions] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [chatSessions, setChatSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [sessionTitle, setSessionTitle] = useState('New Chat');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // Settings state
    const [settings, setSettings] = useState({
        fontSize: 16,
        animationSpeed: 1,
        messageBubbleStyle: 'rounded', // 'rounded', 'square', 'minimal'
        soundEffects: true,
        autoExpandInput: true,
        compactMode: false,
        colorTheme: 'default', // 'default', 'pastel', 'dark', 'professional'
        messageTimeStamps: true,
        readAloud: false,
        typingIndicator: true
    });

    // Premium color scheme for clothing brand
    const premiumColors = {
        primary: '#8A2BE2',      // Premium purple
        secondary: '#FFD700',    // Gold accent
        tertiary: '#4B0082',     // Deep indigo
        lightBg: '#F8F9FF',      // Light background
        darkBg: '#1A1A2E',       // Dark background
        lightText: '#FFFFFF',    // Light text
        darkText: '#2D2D2D',     // Dark text
        gradient: 'linear-gradient(135deg, #8A2BE2 0%, #4B0082 100%)',
        userMsg: '#8A2BE2',      // User message color
        aiMsg: '#4B0082',        // AI message color
    };

    // Load messages and sessions from localStorage
    useEffect(() => {
        const savedSessions = localStorage.getItem('pankhudiChatSessions');
        const savedSettings = localStorage.getItem('pankhudiChatSettings');

        if (savedSessions) {
            try {
                const sessions = JSON.parse(savedSessions);
                setChatSessions(sessions);

                if (sessions.length > 0) {
                    setActiveSession(sessions[0].id);
                    setMessages(sessions[0].messages || []);
                    setSessionTitle(sessions[0].title || 'New Chat');
                }
            } catch (error) {
                console.error("Error parsing saved sessions:", error);
                initializeDefaultSession();
            }
        } else {
            initializeDefaultSession();
        }

        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error("Error parsing saved settings:", error);
            }
        }
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('pankhudiChatSettings', JSON.stringify(settings));
    }, [settings]);

    const initializeDefaultSession = () => {
        const defaultSession = {
            id: 'default-' + Date.now(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };
        setChatSessions([defaultSession]);
        setActiveSession(defaultSession.id);
        localStorage.setItem('pankhudiChatSessions', JSON.stringify([defaultSession]));
    };

    // Save messages to active session in localStorage
    useEffect(() => {
        if (chatSessions.length > 0 && activeSession) {
            const updatedSessions = chatSessions.map(session =>
                session.id === activeSession
                    ? { ...session, messages, title: sessionTitle }
                    : session
            );
            setChatSessions(updatedSessions);
            localStorage.setItem('pankhudiChatSessions', JSON.stringify(updatedSessions));
        }
    }, [messages, activeSession, sessionTitle]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Create a new chat session
    const createNewChat = () => {
        const newSessionId = `session-${Date.now()}`;
        const newSession = {
            id: newSessionId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };

        const updatedSessions = [newSession, ...chatSessions];
        setChatSessions(updatedSessions);
        setActiveSession(newSessionId);
        setMessages([]);
        setSessionTitle('New Chat');
        setIsEditingTitle(false);
        setSidebarOpen(false);

        localStorage.setItem('pankhudiChatSessions', JSON.stringify(updatedSessions));
    };

    // Switch between chat sessions
    const switchSession = (sessionId) => {
        const session = chatSessions.find(s => s.id === sessionId);
        if (session) {
            setActiveSession(sessionId);
            setMessages(session.messages || []);
            setSessionTitle(session.title || 'New Chat');
            setIsEditingTitle(false);
            setSidebarOpen(false);
        }
    };

    // Delete a chat session
    const deleteSession = (sessionId, e) => {
        e.stopPropagation();
        if (chatSessions.length <= 1) {
            alert("You need to have at least one chat session.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this chat?")) {
            const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
            setChatSessions(updatedSessions);

            if (sessionId === activeSession) {
                switchSession(updatedSessions[0].id);
            }

            localStorage.setItem('pankhudiChatSessions', JSON.stringify(updatedSessions));
        }
    };

    // Save session title
    const saveSessionTitle = () => {
        setIsEditingTitle(false);
        const updatedSessions = chatSessions.map(session =>
            session.id === activeSession
                ? { ...session, title: sessionTitle }
                : session
        );
        setChatSessions(updatedSessions);
        localStorage.setItem('pankhudiChatSessions', JSON.stringify(updatedSessions));
    };

    // Update settings
    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Simulate AI typing effect
    const typeMessage = (reply, newMessages) => {
        if (!settings.typingIndicator) {
            setMessages([...newMessages, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }]);
            setLoading(false);
            return;
        }

        setLoading(true);
        let index = 0;
        let typedReply = "";
        const speed = 20 / settings.animationSpeed;
        const interval = setInterval(() => {
            if (index < reply.length) {
                typedReply += reply[index];
                index++;
                setMessages([...newMessages, { role: 'assistant', content: typedReply, timestamp: new Date().toISOString() }]);
            } else {
                clearInterval(interval);
                setLoading(false);
            }
        }, speed);
    };

    const sendMessage = async (msg = null) => {
        const content = msg || input.trim();
        if (!content) return;

        const newMessages = [...messages, { role: 'user', content, timestamp: new Date().toISOString() }];
        setMessages(newMessages);
        if (!msg) setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages, model })
            });

            if (res.ok) {
                const data = await res.json();
                const reply = data?.text || "I'm having trouble connecting to the server. Please try again later.";
                typeMessage(reply, newMessages);
            } else {
                generateLocalAIResponse(content, newMessages);
            }
        } catch {
            generateLocalAIResponse(content, newMessages);
        }
    };

    // Enhanced local fallback AI for clothing store
    const generateLocalAIResponse = (msg, newMessages) => {
        let reply = "I'm Pankhudi's AI assistant! How can I help with your fashion needs today?";
        const lower = msg.toLowerCase();

        // Clothing-specific responses
        if (lower.includes('collection') || lower.includes('new')) {
            reply = "Our new summer collection is live! Featuring floral prints, lightweight fabrics, and vibrant colors. 🌸 Would you like me to show you our bestsellers?";
        } else if (lower.includes('size') || lower.includes('fit')) {
            reply = "We offer sizes XS to XXL. Check our size guide for the perfect fit! 📏 For specific items, I can check availability of sizes if you tell me which product you're interested in.";
        } else if (lower.includes('return') || lower.includes('exchange')) {
            reply = "We offer a 30-day hassle-free return policy. 🔄 Items must be unworn with original tags. Would you like help initiating a return?";
        } else if (lower.includes('ship') || lower.includes('delivery')) {
            reply = "We offer standard (3-5 days) and express (1-2 days) shipping. 🚚 Free shipping on orders over $50!";
        } else if (lower.includes('price') || lower.includes('cost') || lower.includes('discount')) {
            reply = "We have regular promotions and a loyalty program! Sign up for our newsletter to get 15% off your first order. 💰";
        } else if (lower.includes('material') || lower.includes('fabric') || lower.includes('cotton')) {
            reply = "We use sustainable materials including organic cotton, linen, and recycled polyester. Our focus is on quality and eco-friendly production. 🌿";
        } else if (lower.includes('care') || lower.includes('wash')) {
            reply = "Most of our garments require gentle machine wash or hand wash. Check the care label inside each item for specific instructions. 🧼";
        } else if (lower.includes('order') || lower.includes('track')) {
            reply = "I can help you track your order! Please provide your order number or email address associated with the purchase.";
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            reply = "Hello! Welcome to Pankhudi! How can I assist you with your fashion needs today?";
        }

        typeMessage(reply, newMessages);
    };

    // Quick suggestion buttons
    const quickSuggestions = [
        { text: "What's new in collection?", icon: <FaTshirt /> },
        { text: "What's your return policy?", icon: <FaExchangeAlt /> },
        { text: "Do you have this in size L?", icon: <FaSearch /> },
        { text: "How long does shipping take?", icon: <FaShippingFast /> }
    ];

    // Delete whole chat in current session
    const clearChat = () => {
        if (window.confirm("Clear all messages in this chat?")) {
            setMessages([]);
        }
    };

    // Delete single message
    const deleteMessage = (index) => {
        setMessages(messages.filter((_, i) => i !== index));
    };

    // Copy message
    const copyMessage = (text) => {
        navigator.clipboard.writeText(text);
        alert("Message copied to clipboard!");
    };

    // Export chat
    const exportChat = (type = "json") => {
        let data = "";
        let fileName = `${sessionTitle.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}`;

        if (type === "json") {
            data = JSON.stringify(messages, null, 2);
            fileName += ".json";
        } else {
            data = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
            fileName += ".txt";
        }

        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Import chat from file
    const importChat = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                let importedMessages;
                if (file.name.endsWith('.json')) {
                    importedMessages = JSON.parse(event.target.result);
                } else {
                    const text = event.target.result;
                    importedMessages = text.split('\n').filter(line => line.trim()).map(line => {
                        if (line.startsWith('USER:') || line.startsWith('ASSISTANT:')) {
                            const role = line.startsWith('USER:') ? 'user' : 'assistant';
                            const content = line.substring(line.indexOf(':') + 1).trim();
                            return { role, content, timestamp: new Date().toISOString() };
                        }
                        return { role: 'user', content: line.trim(), timestamp: new Date().toISOString() };
                    });
                }

                if (Array.isArray(importedMessages)) {
                    setMessages(importedMessages);
                } else {
                    alert("Invalid file format. Please upload a valid chat export file.");
                }
            } catch (error) {
                alert("Error parsing file: " + error.message);
            }
        };
        reader.readAsText(file);
    };

    // Search filter
    const filteredMessages = searchQuery
        ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
        : messages;

    return (
        <div className="chatbot" data-theme={darkMode ? "dark" : "light"} data-font-size={settings.fontSize} data-bubble-style={settings.messageBubbleStyle}>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Settings panel overlay */}
            {settingsOpen && (
                <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
                    <div className="settings-panel" onClick={e => e.stopPropagation()}>
                        <div className="settings-header">
                            <h2>Chat Settings</h2>
                            <button className="close-settings" onClick={() => setSettingsOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="settings-content">
                            <div className="setting-group">
                                <h3>Appearance</h3>
                                <div className="setting-item">
                                    <label>
                                        <FaFont /> Font Size: {settings.fontSize}px
                                    </label>
                                    <input
                                        type="range"
                                        min="12"
                                        max="22"
                                        value={settings.fontSize}
                                        onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="setting-item">
                                    <label>
                                        <FaPalette /> Message Bubble Style
                                    </label>
                                    <select
                                        value={settings.messageBubbleStyle}
                                        onChange={(e) => updateSetting('messageBubbleStyle', e.target.value)}
                                    >
                                        <option value="rounded">Rounded</option>
                                        <option value="square">Square</option>
                                        <option value="minimal">Minimal</option>
                                    </select>
                                </div>
                                <div className="setting-item">
                                    <label>
                                        <FaExchangeAlt /> Animation Speed
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3"
                                        step="0.5"
                                        value={settings.animationSpeed}
                                        onChange={(e) => updateSetting('animationSpeed', parseFloat(e.target.value))}
                                    />
                                    <span className="setting-value">{settings.animationSpeed}x</span>
                                </div>
                            </div>

                            <div className="setting-group">
                                <h3>Behavior</h3>
                                <div className="setting-item toggle">
                                    <label>
                                        <FaExpand /> Auto-expand Input Field
                                    </label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.autoExpandInput}
                                            onChange={(e) => updateSetting('autoExpandInput', e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item toggle">
                                    <label>
                                        <FaCompress /> Compact Mode
                                    </label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.compactMode}
                                            onChange={(e) => updateSetting('compactMode', e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item toggle">
                                    <label>
                                        <FaVolumeUp /> Sound Effects
                                    </label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.soundEffects}
                                            onChange={(e) => updateSetting('soundEffects', e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item toggle">
                                    <label>
                                        <FaRobot /> Typing Indicator
                                    </label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.typingIndicator}
                                            onChange={(e) => updateSetting('typingIndicator', e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="setting-group">
                                <h3>Content</h3>
                                <div className="setting-item toggle">
                                    <label>
                                        <FaClock /> Show Timestamps
                                    </label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.messageTimeStamps}
                                            onChange={(e) => updateSetting('messageTimeStamps', e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item toggle">
                                    <label>
                                        <FaVolumeUp /> Read Messages Aloud
                                    </label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.readAloud}
                                            onChange={(e) => updateSetting('readAloud', e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar with chat sessions */}
            <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <button id="new-chat-button" onClick={createNewChat}>
                    <FaPlus /> New Chat
                </button>

                <div className="sessions-list">
                    {chatSessions.map(session => (
                        <div
                            key={session.id}
                            className={`session-item ${session.id === activeSession ? 'active' : ''}`}
                            onClick={() => switchSession(session.id)}
                        >
                            <span className="session-title">{session.title}</span>
                            <button
                                className="delete-session-btn"
                                onClick={(e) => deleteSession(session.id, e)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main chat area */}
            <div className="chat-main">
                {/* Website branding */}
                <div className="website-brand">
                    <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <FaBars />
                    </button>
                    <FaTshirt className="brand-icon" />
                    <h1 > Pankhudi</h1>
                </div>

                {/* Header */}
                <header className="chat-header">
                    <button className="icon-button mobile-only" onClick={() => window.history.back()}>
                        <FaArrowLeft />
                    </button>

                    <div className="session-header">
                        {isEditingTitle ? (
                            <div className="title-edit">
                                <input
                                    type="text"
                                    value={sessionTitle}
                                    onChange={(e) => setSessionTitle(e.target.value)}
                                    onBlur={saveSessionTitle}
                                    onKeyDown={(e) => e.key === 'Enter' && saveSessionTitle()}
                                    autoFocus
                                />
                                <button onClick={saveSessionTitle}><FaSave /></button>
                            </div>
                        ) : (
                            <div className="title-display" onClick={() => setIsEditingTitle(true)}>
                                <h1>{sessionTitle}</h1>
                                <FaEdit className="edit-icon" />
                            </div>
                        )}
                    </div>

                    <div className="header-actions">
                        <div className="search-container">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-box"
                            />
                        </div>
                        <button className="icon-button" onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>
                        <button className="icon-button" onClick={() => setSettingsOpen(true)}>
                            <FaSlidersH />
                        </button>
                        <div className="options-container">
                            <button className="icon-button" onClick={() => setShowOptions(!showOptions)}>
                                <FaEllipsisV />
                            </button>
                            {showOptions && (
                                <div className="options-menu">
                                    <button onClick={clearChat}><FaTrash /> Clear Chat</button>
                                    <button onClick={() => exportChat("json")}><FaDownload /> Export JSON</button>
                                    <button onClick={() => exportChat("txt")}><FaDownload /> Export TXT</button>
                                    <label htmlFor="import-chat">
                                        <FaUpload /> Import Chat
                                    </label>
                                    <input
                                        type="file"
                                        id="import-chat"
                                        style={{ display: 'none' }}
                                        onChange={importChat}
                                        accept=".json,.txt"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div className="chat-container">
                    <div className="messages-container">
                        {filteredMessages.length === 0 && !loading ? (
                            <div className="empty-state">
                                <FaRobot className="empty-icon" />
                                <h3>Welcome to Pankhudi Fashion Assistant</h3>
                                <p>Ask me about our collections, sizes, return policy, or anything else!</p>

                                <div className="quick-suggestions">
                                    {quickSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            className="suggestion-btn"
                                            onClick={() => sendMessage(suggestion.text)}
                                        >
                                            {suggestion.icon} {suggestion.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            filteredMessages.map((m, i) => (
                                <div key={i} className={`message ${m.role === 'user' ? 'user' : 'assistant'}`}>
                                    <div className="msg-avatar">
                                        {m.role === 'user' ? <FaUser /> : <FaRobot />}
                                    </div>
                                    <div className="msg-body">
                                        <p>{m.content}</p>
                                        {settings.messageTimeStamps && (
                                            <small>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                        )}
                                    </div>
                                    <div className="msg-actions">
                                        <button onClick={() => copyMessage(m.content)}><FaCopy /></button>
                                        <button onClick={() => deleteMessage(i)}><FaTrash /></button>
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && settings.typingIndicator && (
                            <div className="message assistant">
                                <div className="msg-avatar"><FaRobot /></div>
                                <div className="msg-body typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="input-container">
                    <textarea
                        value={input}
                        onChange={e => {
                            setInput(e.target.value);
                            if (settings.autoExpandInput) {
                                e.target.style.height = 'auto';
                                e.target.style.height = (e.target.scrollHeight) + 'px';
                            }
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Ask me anything about fashion, sizes, delivery, etc..."
                        rows={1}
                    />
                    <button
                        className="send-button"
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                    >
                        {loading ? <div className="spinner"></div> : <FaPaperPlane />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AIChatbot;