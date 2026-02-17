const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

// ✅ Initialize Razorpay (FREE - No monthly charges)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ 1. Create Razorpay Order
router.post("/create-order", async (req, res) => {
    try {
        const { amount, currency, receipt, notes } = req.body;

        const options = {
            amount: amount, // Amount in paise
            currency: currency || "INR",
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || {}
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order",
            error: error.message
        });
    }
});

// ✅ 2. Verify Razorpay Payment
router.post("/verify", async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        } = req.body;

        // Generate signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // Verify signature
        if (expectedSignature === razorpay_signature) {
            res.json({
                success: true,
                message: "Payment verified successfully",
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
});

// ✅ 3. Get Payment Details
router.get("/payment/:paymentId", async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await razorpay.payments.fetch(paymentId);

        res.json({
            success: true,
            payment
        });
    } catch (error) {
        console.error("Error fetching payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment details"
        });
    }
});

module.exports = router;