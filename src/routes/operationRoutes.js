const express = require('express');
const router = express.Router();
const operationController = require('../controllers/operations/operationController');
const rankingController = require('../controllers/operations/rankingController');

const { 
  auth,
  authorize 
} = require('../middleware/auth');

/**
 * @swagger
 * /api/operations/ranking:
 *   get:
 *     summary: Obter ranking dos traders
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, day, week, month]
 *         description: Período para calcular o ranking
 *     responses:
 *       200:
 *         description: Ranking dos traders
 *       400:
 *         description: Período inválido
 */
router.get('/ranking', auth, rankingController.getTraderRanking);

const {
  canCreateOperation,
  canViewOperation,
  canEditOperation
} = require('../middleware/operationPermissions');


/**
 * @swagger
 * tags:
 *   name: Operations
 *   description: Endpoints relacionados às operações de trading
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
 *               - entry
 *               - stop
 *               - leverage
 *             properties:
 *               pair:
 *                 type: string
 *               signal:
 *                 type: string
 *                 enum: [LONG, SHORT]
 *               leverage:
 *                 type: number
 *               strategy:
 *                 type: string
 *               risk:
 *                 type: string
 *               entry:
 *                 type: number
 *               stop:
 *                 type: number
 *               description:
 *                 type: string
 *               targets:
 *                 type: array
 *                 items:
 *                   type: number
 *             example:
 *               pair: SOLUSDT
 *               signal: LONG
 *               leverage: 3
 *               strategy: Swing
 *               risk: Moderado
 *               entry: 113.64
 *               stop: 80.22
 *               description: Test operation
 *               targets: [124.50, 125]
 *     responses:
 *       201:
 *         description: Operação criada com sucesso
 *       400:
 *         description: Requisição inválida
 */

router.post('/', auth, canCreateOperation, operationController.createOperation);

/**
 * @swagger
 * /api/operations:
 *   get:
 *     summary: Listar todas as operações
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de operações
 */
router.get('/', auth, operationController.getAllOperations);

/**
 * @swagger
 * /api/operations/{id}:
 *   get:
 *     summary: Buscar operação por ID
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operação encontrada
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Não encontrada
 */
router.get('/:id', auth, canViewOperation, operationController.getOperationById);

/**
 * @swagger
 * /api/operations/{id}:
 *   put:
 *     summary: Atualizar operação
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pair:
 *                 type: string
 *               signal:
 *                 type: string
 *                 enum: [LONG, SHORT]
 *               leverage:
 *                 type: number
 *               entry:
 *                 type: number
 *               stop:
 *                 type: number
 *               entry2:
 *                 type: number
 *               strategy:
 *                 type: string
 *               risk:
 *                 type: string
 *               targets:
 *                 type: array
 *                 items:
 *                   type: number
 *               description:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, Open, Closed, Cancelled]
 *               status_signal:
 *                 type: string
 *     responses:
 *       200:
 *         description: Operação atualizada
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Não encontrada
 */
router.put('/:id', auth, canEditOperation, operationController.updateOperation);

/**
 * @swagger
 * /api/operations/{id}/targets:
 *   patch:
 *     summary: Atualizar alvos da operação
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targets
 *             properties:
 *               targets:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Alvos atualizados com sucesso
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Não encontrada
 */
router.patch('/:id/targets', auth, canEditOperation, operationController.updateTargets);

/**
 * @swagger
 * /api/operations/{id}:
 *   delete:
 *     summary: Deletar operação
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operação deletada
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Não encontrada
 */
router.delete('/:id',auth, canEditOperation, operationController.deleteOperation);

/**
 * @swagger
 * /api/operations/{id}/request-manual-close:
 *   patch:
 *     summary: Solicitar fechamento manual da operação
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solicitação registrada com sucesso
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Não encontrada
 */
router.patch('/:id/request-manual-close', auth, canEditOperation, operationController.requestManualClose);

/**
 * @swagger
 * /api/operations/ranking:
 *   get:
 *     summary: Obter ranking dos traders por PNL
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, day, week, month]
 *         description: Período para calcular o ranking
 *     responses:
 *       200:
 *         description: Ranking dos traders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   totalOperations:
 *                     type: number
 *                   winningOperations:
 *                     type: number
 *                   winRate:
 *                     type: number
 *                   avgPnlPercentage:
 *                     type: number
 *                   totalPnlAmount:
 *                     type: number
 *                   avgRiskReward:
 *                     type: number
 */
router.get('/ranking', auth, rankingController.getTraderRanking);

module.exports = router;