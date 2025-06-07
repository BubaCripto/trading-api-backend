const express = require('express');
const router = express.Router();
const operationController = require('../controllers/operation/operationController');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const routeLogger = require('../middleware/routeLogger');

/**
 * @swagger
 * tags:
 *   name: Webhook
 *   description: Endpoints para integração externa via webhook
 */

/**
 * @swagger
 * /api/operations/webhook:
 *   get:
 *     summary: Retorna operações de trading para integração externa
 *     description: Endpoint protegido por API key para acesso externo às operações
 *     tags: [Webhook]
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: apiKey
 *         schema:
 *           type: string
 *         description: API key para autenticação (alternativa ao header x-api-key)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de itens por página
 *       - in: query
 *         name: pair
 *         schema:
 *           type: string
 *         description: Filtrar por par de trading (ex. BTCUSDT)
 *       - in: query
 *         name: signal
 *         schema:
 *           type: string
 *           enum: [LONG, SHORT]
 *         description: Filtrar por tipo de sinal (LONG ou SHORT)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, Closed, Canceled]
 *         description: Filtrar por status da operação
 *     responses:
 *       200:
 *         description: Lista de operações retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       pair:
 *                         type: string
 *                         example: "BTCUSDT"
 *                       signal:
 *                         type: string
 *                         example: "LONG"
 *                       entry:
 *                         type: number
 *                         example: 82196.78
 *                       stop:
 *                         type: number
 *                         example: 78000
 *                       targets:
 *                         type: array
 *                         items:
 *                           type: number
 *                         example: [85000, 87000]
 *                       status:
 *                         type: string
 *                         example: "Open"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-06-18T14:30:00Z"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: API key não fornecida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "API key não fornecida"
 *       403:
 *         description: API key inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "API key inválida"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao buscar operações"
 */

// Rota para o webhook de operações (apenas com autenticação por API key)
router.get(
  '/',
  apiKeyAuth,
  routeLogger,
  operationController.getOperationsWebhook
);

module.exports = router;