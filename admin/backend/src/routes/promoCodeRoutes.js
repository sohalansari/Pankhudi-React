// routes/promoCodeRoutes.js
const express = require('express');
const router = express.Router();
const promoCodeController = require('../controllers/promoCodeController');

// GET all promo codes
router.get('/', promoCodeController.getAllPromoCodes);

// GET single promo code by ID
router.get('/:id', promoCodeController.getPromoCodeById);

// POST create new promo code
router.post('/', promoCodeController.createPromoCode);

// PUT update promo code
router.put('/:id', promoCodeController.updatePromoCode);

// PATCH toggle active status
router.patch('/:id/toggle', promoCodeController.togglePromoStatus);

// DELETE promo code
router.delete('/:id', promoCodeController.deletePromoCode);

// POST validate promo code
router.post('/validate', promoCodeController.validatePromoCode);

// POST increment usage count
router.post('/:id/use', promoCodeController.usePromoCode);

// GET usage statistics
router.get('/stats/overview', promoCodeController.getPromoStats);

module.exports = router;