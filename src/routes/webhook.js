const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook/webhookController');

// Rota para receber eventos do Stripe
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }), // Obrigatório para validar assinatura Stripe
  webhookController.handleStripeWebhook
);

module.exports = router;
