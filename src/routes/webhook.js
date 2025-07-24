const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook/webhookController');

// Stripe exige o corpo cru
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;
