const rateLimit = require('express-rate-limit');

// Limiter para criação de operações (mais restritivo)
const createOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo de 10 novas operações por janela
  message: {
    error: 'Limite de criação de operações excedido. Tente novamente mais tarde.'
  }
});

// Limiter para atualizações de operações
const updateOperationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo de 20 atualizações por janela
  message: {
    error: 'Muitas atualizações. Tente novamente mais tarde.'
  }
});

// Limiter para consultas (mais permissivo)
const queryOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 consultas por janela
  message: {
    error: 'Limite de consultas excedido. Tente novamente mais tarde.'
  }
});

module.exports = {
  createOperationLimiter,
  updateOperationLimiter,
  queryOperationLimiter
};