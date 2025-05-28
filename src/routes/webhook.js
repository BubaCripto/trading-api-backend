const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook/webhookController');

// Middleware para capturar o corpo bruto da requisição
const rawBodyMiddleware = express.raw({ type: 'application/json' });

// Função para disponibilizar o corpo bruto para o Stripe
const setRawBody = (req, res, next) => {
  if (req.body instanceof Buffer) {
    req.rawBody = req.body;
  }
  next();
};

// Rota para receber eventos do Stripe
router.post(
  '/stripe',
  rawBodyMiddleware,
  setRawBody,
  webhookController.handleStripeWebhook
);

module.exports = router;
