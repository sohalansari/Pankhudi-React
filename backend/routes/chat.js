require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error('\n[ERROR] GOOGLE_API_KEY missing. Set it in .env');
    process.exit(1);
}

// Optional local fallback for fashion-specific queries
function localFallback(msg) {
    const text = msg.toLowerCase();
    if (text.includes("collection")) return "Our new summer collection is live! 🌸 Would you like to see our bestsellers?";
    if (text.includes("size") || text.includes("fit")) return "We offer sizes XS to XXL. 📏 Let me know the item you're interested in.";
    if (text.includes("return") || text.includes("exchange")) return "30-day hassle-free return policy. 🔄 Do you want help initiating a return?";
    if (text.includes("delivery") || text.includes("ship")) return "Standard (3-5 days) & express (1-2 days) shipping 🚚 Free shipping on orders over $50!";
    if (text.includes("price") || text.includes("discount")) return "Check our promotions and newsletter for discounts 💰";
    if (text.includes("material") || text.includes("fabric") || text.includes("cotton")) return "We use sustainable materials like organic cotton and linen. 🌿";
    if (text.includes("care") || text.includes("wash")) return "Most garments require gentle machine wash or hand wash. 🧼";
    if (text.includes("order") || text.includes("track")) return "I can help track your order! Please provide your order number.";
    if (text.includes("hello") || text.includes("hi") || text.includes("hey")) return "Hello! Welcome to Pankhudi! How can I assist you today?";
    return null;
}

// Convert simple chat history → Gemini contents
function toGeminiContents(messages = []) {
    return messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));
}

router.post('/', async (req, res) => {
    try {
        const { messages = [], model = 'gemini-2.0-flash' } = req.body;

        const lastUserMessage = messages[messages.length - 1]?.content || '';

        // Step 1: Check local fallback
        const fallbackReply = localFallback(lastUserMessage);
        if (fallbackReply) return res.json({ text: fallbackReply });

        // Step 2: Prepare payload for Gemini API
        const payload = { contents: toGeminiContents(messages) };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        // Step 3: Call Gemini API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': API_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Step 4: Extract text safely
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const text = parts.map(p => p?.text || '').join('').trim();

        res.json({ text, raw: data });

    } catch (err) {
        console.error('[chat error]', err);
        // fallback generic message if Gemini fails
        res.status(500).json({ text: "I'm here to help! Could you rephrase your question?", error: String(err) });
    }
});

module.exports = router;
