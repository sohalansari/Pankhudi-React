// require('dotenv').config();
// const express = require('express');
// const fetch = require('node-fetch');
// const router = express.Router();

// const API_KEY = process.env.GOOGLE_API_KEY;
// if (!API_KEY) {
//     console.error('\n[ERROR] GOOGLE_API_KEY missing. Set it in .env');
//     process.exit(1);
// }

// // Optional local fallback for fashion-specific queries
// function localFallback(msg) {
//     const text = msg.toLowerCase();
//     if (text.includes("collection")) return "Our new summer collection is live! 🌸 Would you like to see our bestsellers?";
//     if (text.includes("size") || text.includes("fit")) return "We offer sizes XS to XXL. 📏 Let me know the item you're interested in.";
//     if (text.includes("return") || text.includes("exchange")) return "30-day hassle-free return policy. 🔄 Do you want help initiating a return?";
//     if (text.includes("delivery") || text.includes("ship")) return "Standard (3-5 days) & express (1-2 days) shipping 🚚 Free shipping on orders over $50!";
//     if (text.includes("price") || text.includes("discount")) return "Check our promotions and newsletter for discounts 💰";
//     if (text.includes("material") || text.includes("fabric") || text.includes("cotton")) return "We use sustainable materials like organic cotton and linen. 🌿";
//     if (text.includes("care") || text.includes("wash")) return "Most garments require gentle machine wash or hand wash. 🧼";
//     if (text.includes("order") || text.includes("track")) return "I can help track your order! Please provide your order number.";
//     if (text.includes("hello") || text.includes("hi") || text.includes("hey")) return "Hello! Welcome to Pankhudi! How can I assist you today?";
//     return null;
// }

// // Convert simple chat history → Gemini contents
// function toGeminiContents(messages = []) {
//     return messages.map(m => ({
//         role: m.role === 'assistant' ? 'model' : 'user',
//         parts: [{ text: m.content }]
//     }));
// }

// router.post('/', async (req, res) => {
//     try {
//         const { messages = [], model = 'gemini-2.0-flash' } = req.body;

//         const lastUserMessage = messages[messages.length - 1]?.content || '';

//         // Step 1: Check local fallback
//         const fallbackReply = localFallback(lastUserMessage);
//         if (fallbackReply) return res.json({ text: fallbackReply });

//         // Step 2: Prepare payload for Gemini API
//         const payload = { contents: toGeminiContents(messages) };

//         const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

//         // Step 3: Call Gemini API
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-goog-api-key': API_KEY
//             },
//             body: JSON.stringify(payload)
//         });

//         const data = await response.json();

//         // Step 4: Extract text safely
//         const parts = data?.candidates?.[0]?.content?.parts || [];
//         const text = parts.map(p => p?.text || '').join('').trim();

//         res.json({ text, raw: data });

//     } catch (err) {
//         console.error('[chat error]', err);
//         // fallback generic message if Gemini fails
//         res.status(500).json({ text: "I'm here to help! Could you rephrase your question?", error: String(err) });
//     }
// });

// module.exports = router;









require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error('\n[ERROR] GOOGLE_API_KEY missing. Set it in .env');
    process.exit(1);
}

// Track quota usage
const quotaManager = {
    isQuotaExceeded: false,
    quotaResetTime: null,

    setQuotaExceeded(retryAfter) {
        this.isQuotaExceeded = true;
        // Parse retry time from error message or use default 60 seconds
        const retrySeconds = retryAfter || 60;
        this.quotaResetTime = Date.now() + (retrySeconds * 1000);
        console.log(`[Quota] Quota exceeded. Switching to fallback mode for ${retrySeconds} seconds`);

        // Auto-reset after the retry period
        setTimeout(() => {
            this.isQuotaExceeded = false;
            this.quotaResetTime = null;
            console.log('[Quota] Quota reset. Gemini API available again.');
        }, retrySeconds * 1000);
    },

    shouldUseFallback() {
        if (!this.isQuotaExceeded) return false;

        // Check if quota reset time has passed
        if (this.quotaResetTime && Date.now() > this.quotaResetTime) {
            this.isQuotaExceeded = false;
            this.quotaResetTime = null;
            console.log('[Quota] Quota period expired. Gemini API available again.');
            return false;
        }
        return true;
    }
};

// Enhanced fallback responses with more variety
const fallbackResponses = {
    greeting: [
        "Hello! 👋 Welcome to Pankhudi! How can I assist you with your fashion needs today?",
        "Hi there! 🌸 Ready to find your perfect outfit? What are you looking for?",
        "Welcome to Pankhudi! 💫 I'm here to help you with sizes, styles, and more!"
    ],

    collection: [
        "Our new summer collection 'Tropical Breeze' is now live! 🌸 Featuring lightweight dresses, linen shirts, and sustainable basics.",
        "Check out our latest arrivals! ✨ From casual wear to elegant evening pieces, we've got something for every occasion.",
        "This season, we're all about breathable fabrics and vibrant colors! Would you like to see our bestsellers?"
    ],

    size: [
        "We offer sizes XS to XXL with detailed measurements on each product page. 📏 Need help finding your perfect fit?",
        "Finding the right size is easy! Check our size guide or tell me which item you're interested in.",
        "Most of our items run true to size. For specific measurements, I recommend checking the product description!"
    ],

    return: [
        "30-day hassle-free returns! 🔄 Items must be unworn with original tags. Start a return through your account or contact support.",
        "Easy returns and exchanges! We want you to love your purchase. Need help with the process?",
        "Not happy with your order? No worries! Our return policy has you covered for 30 days."
    ],

    shipping: [
        "Free shipping on orders over $50! 🚚 Standard (3-5 days) and express (1-2 days) options available.",
        "We ship worldwide! Track your order through your account once it's dispatched.",
        "Most orders ship within 24 hours. You'll receive a confirmation email with tracking info!"
    ],

    price: [
        "Check our website for current promotions! 💰 Sign up for newsletters to get exclusive discounts.",
        "We have frequent sales and special offers! Use code 'WELCOME10' for 10% off your first order.",
        "Best prices guaranteed! Price match available within 7 days of purchase."
    ],

    material: [
        "We use sustainable materials like organic cotton, TENCEL™, and recycled polyester. 🌿 Eco-friendly fashion!",
        "All our fabrics are carefully selected for quality and comfort. Each product page lists complete material details.",
        "Committed to sustainability! Many items use eco-friendly materials and ethical production methods."
    ],

    care: [
        "Gentle machine wash cold recommended for most items. 🧼 Always check the care label!",
        "To make your clothes last longer, wash inside out in cold water and air dry when possible.",
        "Special care instructions vary by fabric. Check the product page or care label for specifics!"
    ],

    order: [
        "Need help with an order? Please provide your order number and I'll check the status! 📦",
        "Track your package through the link in your email, or give me your order number for assistance.",
        "Orders typically process within 24 hours. Once shipped, you'll get tracking information!"
    ],

    styling: [
        "I'd love to help you style that! ✨ What's the occasion? Casual, work, or special event?",
        "Mix and match tips: Neutral basics pair well with statement pieces. Want specific advice?",
        "Creating the perfect outfit is fun! Tell me more about your style preferences."
    ],

    contact: [
        "Our support team is available at support@pankhudi.com 📧 or call 1-800-PANKHUDI",
        "Need human assistance? We're here for you! Email us or use the live chat on our website.",
        "Connect with us on social media @pankhudi for style inspiration and updates!"
    ],

    default: [
        "I'm here to help with all your fashion questions! What would you like to know?",
        "Thanks for reaching out! Could you tell me more about what you're looking for?",
        "How can I assist you today? Feel free to ask about products, sizes, orders, or anything else!",
        "I want to make sure I help you properly. Could you provide more details?",
        "At Pankhudi, we're all about making you look and feel great! What can I help you with?"
    ]
};

// Enhanced local fallback with pattern matching
function getLocalResponse(msg) {
    if (!msg) return null;

    const text = msg.toLowerCase().trim();

    // Pattern matching for better intent detection
    const patterns = [
        { keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'], category: 'greeting' },
        { keywords: ['collection', 'new arrival', 'latest', 'just dropped', 'summer', 'winter', 'season'], category: 'collection' },
        { keywords: ['size', 'fit', 'measurement', 'xs', 'small', 'medium', 'large', 'xxl'], category: 'size' },
        { keywords: ['return', 'exchange', 'refund', 'money back', 'replace'], category: 'return' },
        { keywords: ['ship', 'delivery', 'shipping', 'deliver', 'courier', 'dispatch'], category: 'shipping' },
        { keywords: ['price', 'cost', 'discount', 'sale', 'offer', 'promo', 'coupon', 'deal'], category: 'price' },
        { keywords: ['material', 'fabric', 'cotton', 'linen', 'silk', 'polyester', 'wool', 'sustainable'], category: 'material' },
        { keywords: ['care', 'wash', 'dry clean', 'maintain', 'clean', 'laundry'], category: 'care' },
        { keywords: ['order', 'track', 'package', 'delivered', 'shipped', 'arrive'], category: 'order' },
        { keywords: ['style', 'wear', 'match', 'outfit', 'combination', 'pair', 'fashion advice'], category: 'styling' },
        { keywords: ['human', 'agent', 'representative', 'customer service', 'support', 'contact'], category: 'contact' }
    ];

    for (const pattern of patterns) {
        if (pattern.keywords.some(keyword => text.includes(keyword))) {
            const responses = fallbackResponses[pattern.category];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    return null;
}

// Get a random default response
function getDefaultResponse() {
    return fallbackResponses.default[Math.floor(Math.random() * fallbackResponses.default.length)];
}

// Convert chat history to Gemini format
function buildGeminiContents(messages = []) {
    const systemPrompt = `You are Pankhudi's friendly fashion assistant. Help customers with:
- Product recommendations and style advice
- Size guides and fit information
- Order tracking and returns
- Material details and care instructions
- Promotions and discounts

Keep responses warm, concise, and helpful. Use emojis occasionally to be friendly.`;

    const geminiMessages = [
        {
            role: 'user',
            parts: [{ text: systemPrompt }]
        },
        {
            role: 'model',
            parts: [{ text: "I understand! I'm ready to help customers with their fashion needs at Pankhudi." }]
        }
    ];

    // Add conversation history (limit to last 10 messages to save tokens)
    const recentMessages = messages.slice(-10);
    recentMessages.forEach(msg => {
        geminiMessages.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        });
    });

    return geminiMessages;
}

// Main chat endpoint
router.post('/', async (req, res) => {
    try {
        const {
            messages = [],
            model = 'gemini-2.0-flash',
            temperature = 0.7,
            maxTokens = 300, // Reduced to save tokens
            forceFallback = false
        } = req.body;

        // Validate messages
        if (!messages.length) {
            return res.json({
                text: "Hello! 👋 Welcome to Pankhudi! How can I help you with your fashion needs today?",
                source: 'welcome'
            });
        }

        const lastUserMessage = messages[messages.length - 1]?.content || '';

        // Check if we should use fallback mode
        if (forceFallback || quotaManager.shouldUseFallback()) {
            console.log('[Chat] Using fallback mode (quota exceeded or forced)');
            const localReply = getLocalResponse(lastUserMessage) || getDefaultResponse();
            return res.json({
                text: localReply,
                source: 'fallback-quota',
                quotaExceeded: true
            });
        }

        // Try local response first for common queries
        const localReply = getLocalResponse(lastUserMessage);
        if (localReply) {
            // Still try Gemini in background? Optional
            return res.json({
                text: localReply,
                source: 'fallback'
            });
        }

        // Prepare Gemini API request
        const contents = buildGeminiContents(messages);

        const payload = {
            contents,
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: maxTokens,
                topP: 0.95,
                topK: 40
            }
        };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

        // Call Gemini API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Handle quota errors specifically
            if (response.status === 429) {
                const errorData = await response.json();
                console.log('[Quota Error]', errorData);

                // Extract retry time if available
                let retrySeconds = 60;
                if (errorData.error?.details) {
                    const retryInfo = errorData.error.details.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
                    if (retryInfo?.retryDelay) {
                        const match = retryInfo.retryDelay.match(/(\d+)s/);
                        if (match) retrySeconds = parseInt(match[1]);
                    }
                }

                quotaManager.setQuotaExceeded(retrySeconds);

                // Return fallback response
                return res.json({
                    text: getLocalResponse(lastUserMessage) || getDefaultResponse(),
                    source: 'fallback-quota',
                    quotaExceeded: true,
                    retryAfter: retrySeconds
                });
            }

            if (!response.ok) {
                throw new Error(`Gemini API returned ${response.status}`);
            }

            const data = await response.json();

            // Extract and validate response
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No candidates returned');
            }

            const parts = data.candidates[0]?.content?.parts || [];
            const text = parts.map(p => p?.text || '').join('').trim();

            if (!text) {
                throw new Error('Empty response');
            }

            // Success - return Gemini response
            res.json({
                text,
                source: 'gemini',
                model: model
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                console.log('[Chat] Request timeout');
                return res.json({
                    text: getLocalResponse(lastUserMessage) || getDefaultResponse(),
                    source: 'fallback-timeout'
                });
            }

            throw fetchError; // Re-throw for outer catch
        }

    } catch (err) {
        console.error('[Chat Error]', err);

        // Always return a friendly response, even on errors
        const lastUserMessage = req.body?.messages?.slice(-1)[0]?.content || '';
        res.json({
            text: getLocalResponse(lastUserMessage) || getDefaultResponse(),
            source: 'error-handler'
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        quota: {
            exceeded: quotaManager.isQuotaExceeded,
            resetTime: quotaManager.quotaResetTime
        }
    });
});

// Admin endpoint to reset quota (for testing)
router.post('/reset-quota', (req, res) => {
    quotaManager.isQuotaExceeded = false;
    quotaManager.quotaResetTime = null;
    res.json({ message: 'Quota reset successfully' });
});

module.exports = router;