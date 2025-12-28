import React, { useState, useRef, useEffect } from "react";
import "./chatbot.css";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const initialMessage = {
        id: 1,
        text: "Welcome to Pankhudi Assistant! I'm your shopping assistant for Women's and kids' fashion. How can I help you today?",
        sender: "bot",
        options: [
            "Browse products",
            "Track my order",
            "Size guide",
            "Current promotions",
            "Return policy",
            "Contact customer service"
        ]
    };

    const [messages, setMessages] = useState([initialMessage]);
    const [input, setInput] = useState("");
    const [userContext, setUserContext] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [orderHistory, setOrderHistory] = useState([
        { id: "SH12345", status: "Delivered", date: "2023-05-15", items: ["Men's T-Shirt", "Kids Jeans"] },
        { id: "SH67890", status: "Shipped", date: "2023-06-01", items: ["Men's Jacket", "Kids Shoes"] },
        { id: "SH24680", status: "Processing", date: "2023-06-05", items: ["Men's Polo Shirt"] }
    ]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const botResponses = {
        greeting: "Welcome back! What else can I help you with?",
        browse: {
            men: "Great! We have these categories for men: \n- T-shirts & Polos \n- Jeans & Pants \n- Jackets & Coats \n- Shoes \n- Accessories \nWhich would you like to see?",
            kids: "Awesome! For kids we offer: \n- Baby clothes (0-24 months) \n- Toddler outfits (2-5 years) \n- Big kids (6-14 years) \n- Shoes \n- School uniforms \nWhat interests you?",
            default: "Would you like to browse men's or kids' products?"
        },
        trackOrder: {
            prompt: "Please provide your order number and I'll check the status for you.",
            found: (order) => `Order #${order.id} (placed ${order.date}):\nStatus: ${order.status}\nItems: ${order.items.join(", ")}\n${order.status === "Shipped" ? "Tracking number: TRK" + order.id : ""}`,
            notFound: "I couldn't find that order number. Please check and try again. You can also say 'my orders' to see recent orders.",
            recent: "Here are your recent orders:"
        },
        sizeGuide: {
            men: "Our men's sizing guide: \n- XS: Chest 34-36\" \n- S: Chest 36-38\" \n- M: Chest 38-40\" \n- L: Chest 40-42\" \n- XL: Chest 42-44\" \nNeed help with a specific item?",
            kids: "Kids sizing by age: \n- 0-3M: 8-12 lbs \n- 3-6M: 12-16 lbs \n- 6-12M: 16-22 lbs \n- 12-18M: 22-27 lbs \n- 2T: 27-30 lbs \n- 3T: 30-34 lbs \n...up to size 14",
            default: "Would you like size information for men's or kids' clothing?"
        },
        promotions: {
            current: "Current promotions: \n- 20% off all summer styles with code SUN20 \n- Buy 2 kids' tees, get 1 free \n- Free shipping on orders over $50 \n- New members get 15% off first purchase",
            expired: "That promotion has expired. Here are our current offers:"
        },
        returnPolicy: {
            standard: "Our hassle-free return policy: \n- 30 days for full refund \n- 60 days for store credit \n- Free returns for members \n- Items must be unworn with tags attached",
            specific: "For returns, please visit our Returns Center or reply with your order number for specific instructions."
        },
        customerService: "Our customer service team is available 24/7 at support@stylehub.com or call 1-800-STYLEHUB. What can I help you with while you wait?",
        default: "I can help with: \n- Product recommendations \n- Order status \n- Sizing questions \n- Promotions \n- Returns & exchanges",
        fallback: "I'm not sure I understand. Could you rephrase or choose from these options?",
        error: "I'm having trouble understanding that request. Please try again or select from the options below."
    };

    const defaultOptions = initialMessage.options;

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input.trim(), sender: "user" };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        setIsTyping(true);
        setTimeout(() => {
            processUserInput(input.trim().toLowerCase());
            setIsTyping(false);
        }, 800);
    };

    const handleQuickReply = (option) => {
        const userMsg = { id: Date.now(), text: option, sender: "user" };
        setMessages((prev) => [...prev, userMsg]);

        setIsTyping(true);
        setTimeout(() => {
            processUserInput(option.toLowerCase());
            setIsTyping(false);
        }, 800);
    };

    const processUserInput = (userInput) => {
        let response;
        let options = [];
        let context = userContext;

        try {
            // Handle "back to main menu" first
            if (userInput.includes('back') || userInput.includes('main') || userInput.includes('menu')) {
                response = botResponses.default;
                context = null;
                options = defaultOptions;
            }
            // Handle context-specific responses
            else if (context) {
                switch (context) {
                    case 'browse':
                        if (userInput.includes('men') || userInput.includes("man") || userInput.includes("male")) {
                            response = botResponses.browse.men;
                            context = 'browse_men';
                            options = ["T-shirts & Polos", "Jeans & Pants", "Jackets & Coats", "Shoes", "Accessories", "Back to main menu"];
                        } else if (userInput.includes('kid') || userInput.includes('child') || userInput.includes('children')) {
                            response = botResponses.browse.kids;
                            context = 'browse_kids';
                            options = ["Baby clothes", "Toddler outfits", "Big kids", "Shoes", "School uniforms", "Back to main menu"];
                        } else {
                            response = botResponses.browse.default;
                            context = 'browse';
                        }
                        break;
                    case 'size':
                        if (userInput.includes('men') || userInput.includes("man") || userInput.includes("male")) {
                            response = botResponses.sizeGuide.men;
                            options = ["Back to main menu"];
                        } else if (userInput.includes('kid') || userInput.includes('child') || userInput.includes('children')) {
                            response = botResponses.sizeGuide.kids;
                            options = ["Back to main menu"];
                        } else {
                            response = botResponses.sizeGuide.default;
                            context = 'size';
                        }
                        break;
                    case 'track':
                        if (userInput.includes('my orders') || userInput.includes('recent orders') || userInput.includes('order history')) {
                            response = `${botResponses.trackOrder.recent}\n${orderHistory.map(order => `#${order.id} - ${order.status}`).join('\n')}\nWhich order would you like details for?`;
                            context = 'track_details';
                            options = orderHistory.map(order => `Order #${order.id}`).concat(["Back to main menu"]);
                        } else if (/^SH\d+$/.test(userInput.toUpperCase())) {
                            const order = orderHistory.find(o => o.id === userInput.toUpperCase());
                            if (order) {
                                response = botResponses.trackOrder.found(order);
                                options = ["Back to main menu"];
                            } else {
                                response = botResponses.trackOrder.notFound;
                                context = 'track';
                            }
                        } else {
                            response = botResponses.trackOrder.prompt;
                            context = 'track';
                        }
                        break;
                    case 'returns':
                        if (/^SH\d+$/.test(userInput.toUpperCase())) {
                            const order = orderHistory.find(o => o.id === userInput.toUpperCase());
                            if (order) {
                                response = `For order #${order.id}:\n${botResponses.returnPolicy.specific}\nWould you like to:\n1. Start a return\n2. Get shipping instructions\n3. Speak to customer service`;
                                options = ["Start a return", "Get shipping instructions", "Contact customer service", "Back to main menu"];
                            } else {
                                response = "I couldn't find that order number. Please check and try again.";
                                context = 'returns';
                            }
                        } else {
                            response = botResponses.returnPolicy.standard;
                            options = ["Start a return", "Return policy details", "Back to main menu"];
                        }
                        break;
                    default:
                        response = botResponses.default;
                        context = null;
                        options = defaultOptions;
                }
            }
            // Handle new questions
            else {
                if (userInput.includes('hi') || userInput.includes('hello') || userInput.includes('hey')) {
                    response = botResponses.greeting;
                    options = defaultOptions;
                }
                else if (userInput.includes('browse') || userInput.includes('product') || userInput.includes('shop') || userInput.includes('buy')) {
                    response = botResponses.browse.default;
                    context = 'browse';
                }
                else if (userInput.includes('track') || userInput.includes('order') || userInput.includes('delivery') || userInput.includes('status')) {
                    response = botResponses.trackOrder.prompt;
                    context = 'track';
                }
                else if (userInput.includes('size') || userInput.includes('fit') || userInput.includes('measure') || userInput.includes('guide')) {
                    response = botResponses.sizeGuide.default;
                    context = 'size';
                }
                else if (userInput.includes('promo') || userInput.includes('discount') || userInput.includes('sale') || userInput.includes('offer')) {
                    response = botResponses.promotions.current;
                }
                else if (userInput.includes('return') || userInput.includes('exchange') || userInput.includes('refund')) {
                    response = botResponses.returnPolicy.standard;
                    context = 'returns';
                    options = ["Start a return", "Return policy details", "Back to main menu"];
                }
                else if (userInput.includes('contact') || userInput.includes('help') || userInput.includes('support') || userInput.includes('service')) {
                    response = botResponses.customerService;
                }
                else if (userInput.includes('thank') || userInput.includes('thanks')) {
                    response = "You're welcome! Is there anything else I can help you with?";
                    options = defaultOptions;
                }
                else if (userInput.includes('men') || userInput.includes('man') || userInput.includes('male')) {
                    response = "Would you like information about:\n1. Men's products\n2. Men's sizing\n3. Something else?";
                    options = ["Browse men's products", "Men's size guide", "Back to main menu"];
                }
                else if (userInput.includes('kid') || userInput.includes('child') || userInput.includes('children')) {
                    response = "Would you like information about:\n1. Kids' products\n2. Kids' sizing\n3. Something else?";
                    options = ["Browse kids' products", "Kids' size guide", "Back to main menu"];
                }
                else {
                    response = botResponses.fallback;
                    options = defaultOptions;
                }
            }
        } catch (error) {
            console.error("Error generating bot response:", error);
            response = botResponses.error;
            options = defaultOptions;
            context = null;
        }

        setUserContext(context);
        setMessages(prev => [
            ...prev,
            {
                id: Date.now() + 1,
                text: response,
                sender: "bot",
                options: options.length > 0 ? options : null
            }
        ]);
    };

    return (
        <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
            {!isOpen && (
                <button
                    className="chatbot-button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open chatbot"
                >
                    💬Help
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window" role="region" aria-live="polite">
                    <header className="chatbot-header">
                        <div className="chatbot-title">
                            <h4>Pankhudi Assistant</h4>
                            <span className="chatbot-status">Online</span>
                        </div>
                        <button
                            className="chatbot-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chatbot"
                        >
                            ✖
                        </button>
                    </header>

                    <div className="chatbot-messages">
                        {messages.map(({ id, text, sender, options }) => (
                            <div key={id}>
                                <div
                                    className={`chatbot-message ${sender}`}
                                    role="article"
                                    aria-label={`${sender} message`}
                                >
                                    {text.split('\n').map((paragraph, i) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>
                                {options && sender === "bot" && (
                                    <div className="chatbot-options">
                                        {options.map((option, index) => (
                                            <button
                                                key={index}
                                                className="chatbot-option"
                                                onClick={() => handleQuickReply(option)}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chatbot-message bot">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input" onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question..."
                            aria-label="Chat input"
                        />
                        <button type="submit" aria-label="Send message">
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}