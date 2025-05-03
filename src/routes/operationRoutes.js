
const express = require('express');
const router = express.Router();
const controller = require('../controllers/operation/operationController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { validateCreateOperation, validateUpdateOperation } = require('../middleware/validations/operationValidation');
const handleValidation = require('../middleware/validations/handleValidation');
const validateSignalLogic = require('../middleware/validations/validateSignalLogic');
const {
  createOperationLimiter,
  updateOperationLimiter,
  queryOperationLimiter
} = require('../middleware/rateLimiter');

const routeLogger = require('../middleware/routeLogger');

/**
 * @swagger
 * tags:
 *   name: Operations
 *   description: Gestão de operações de trading
 */

/**
 * @swagger
 * /api/operations:
 *   post:
 *     summary: Criar nova operação
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pair
 *               - signal
 *               - leverage
 *               - entry
 *               - stop
 *               - targets
 *             properties:
 *               pair: { type: string, example: "BTCUSDT" }
 *               signal: { type: string, enum: [LONG, SHORT], example: "LONG" }
 *               leverage: { type: number, example: 3 }
 *               strategy: { type: string, example: "Swing" }
 *               risk: { type: string, enum: [Baixo, Moderado, Alto], example: "Moderado" }
 *               entry: { type: number, example: 82196.78 }
 *               stop: { type: number, example: 78000 }
 *               description: { type: string, example: "Entrada técnica após correção" }
 *               targets:
 *                 type: array
 *                 items: { type: number }
 *                 example: [85000, 87000]
 *     responses:
 *       201:
 *         description: Operação criada com sucesso
 *       400:
 *         description: Erro de validação
 *   get:
 *     summary: Listar todas as operações
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de operações retornada
 */

/**
 * @swagger
 * /api/operations/{id}:
 *   get:
 *     summary: Buscar operação por ID
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID da operação
 *     responses:
 *       200:
 *         description: Operação encontrada
 *       404:
 *         description: Operação não encontrada
 *   put:
 *     summary: Atualizar operação existente
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entry: { type: number, example: 82000 }
 *               stop: { type: number, example: 77000 }
 *               signal: { type: string, enum: [LONG, SHORT], example: "SHORT" }
 *               strategy: { type: string, example: "Scalping" }
 *               risk: { type: string, example: "Alto" }
 *               description: { type: string, example: "Nova análise" }
 *               leverage: { type: number, example: 2 }
 *     responses:
 *       200:
 *         description: Operação atualizada
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Operação não encontrada
 *   delete:
 *     summary: Excluir operação
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Operação deletada
 *       403:
 *         description: Sem permissão
 */

/**
 * @swagger
 * /api/operations/{id}/targets:
 *   patch:
 *     summary: Atualizar os alvos (targets) da operação
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targets]
 *             properties:
 *               targets:
 *                 type: array
 *                 items: { type: number }
 *                 example: [86000, 88000]
 *     responses:
 *       200:
 *         description: Alvos atualizados com sucesso
 */

/**
 * @swagger
 * /api/operations/{id}/request-manual-close:
 *   patch:
 *     summary: Solicitar fechamento manual da operação
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Operação marcada como fechada manualmente
 */

/**
 * @swagger
 * /api/operations/ranking:
 *   get:
 *     summary: Obter ranking de traders por PnL
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de traders ranqueados por lucro
 */

// Rotas de consulta (mais permissivas)
router.get('/ranking', auth,routeLogger, queryOperationLimiter, checkPermission('VIEW_OPERATION'), controller.getRanking);
router.get('/', auth,routeLogger, queryOperationLimiter, checkPermission('VIEW_OPERATION'), controller.getAllOperations);
router.get('/:id', auth,routeLogger, queryOperationLimiter, checkPermission('VIEW_OPERATION'), controller.getOperationById);

// Rota de criação (mais restritiva)
router.post('/',
  auth,
  routeLogger,
  createOperationLimiter,
  checkPermission('CREATE_OPERATION'),
  validateCreateOperation,
  validateSignalLogic,
  handleValidation,
  controller.createOperation
);

// Rotas de atualização (limite intermediário)
router.put('/:id',
  auth,
  routeLogger,
  updateOperationLimiter,
  checkPermission('UPDATE_OPERATION'),
  validateUpdateOperation,
  handleValidation,
  controller.updateOperation
);

router.patch('/:id/targets',
  auth,
  routeLogger,
  updateOperationLimiter,
  checkPermission('UPDATE_OPERATION'),
  controller.updateTargets
);

router.patch('/:id/request-manual-close',
  auth,
  routeLogger,
  updateOperationLimiter,
  checkPermission('UPDATE_OPERATION'),
  controller.requestManualClose
);

// Rota de deleção (limite intermediário)
router.delete('/:id',
  auth,
  routeLogger,
  updateOperationLimiter,
  checkPermission('DELETE_OPERATION'),
  controller.deleteOperation
);

module.exports = router;
