// src/models/RouteLog.js
const mongoose = require('mongoose');

const routeLogSchema = new mongoose.Schema({
  // Informações da requisição
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  route: {
    type: String,
    required: true
  },
  params: mongoose.Schema.Types.Mixed,
  query: mongoose.Schema.Types.Mixed,
  body: mongoose.Schema.Types.Mixed,

  // Informações do usuário
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: String,

  // Informações da resposta
  statusCode: Number,
  responseTime: Number, // em millisegundos
  responseData: mongoose.Schema.Types.Mixed,
  error: mongoose.Schema.Types.Mixed,

  // Metadados
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: String,
  userAgent: String
});

// Índices para pesquisa eficiente
routeLogSchema.index({ timestamp: -1 });
routeLogSchema.index({ route: 1, method: 1 });
routeLogSchema.index({ userId: 1 });
routeLogSchema.index({ statusCode: 1 });

module.exports = mongoose.model('RouteLog', routeLogSchema);