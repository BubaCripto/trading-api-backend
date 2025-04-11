const express = require('express');
const router = express.Router();
const operationController = require('../controllers/operations/operationController');
const { auth, authorize } = require('../middleware/auth');
const checkOperationOwnership = require('../middleware/checkOperationOwnership');

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

router.post('/',
  auth,
  authorize('TRADER', 'ADMIN'),
  operationController.createOperation
);

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
router.get('/',
  auth,
  authorize('TRADER', 'ADMIN'),
  operationController.getAllOperations
);

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
router.get('/:id',
  auth,
  authorize('TRADER', 'ADMIN'),
  checkOperationOwnership,
  operationController.getOperationById
);

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
router.put('/:id',
  auth,
  authorize('TRADER', 'ADMIN'),
  checkOperationOwnership,
  operationController.updateOperation
);

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
router.patch('/:id/targets',
  auth,
  authorize('TRADER', 'ADMIN'),
  checkOperationOwnership,
  operationController.updateTargets
);

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
router.delete('/:id',
  auth,
  authorize('TRADER', 'ADMIN'),
  checkOperationOwnership,
  operationController.deleteOperation
);

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
router.patch('/:id/request-manual-close',
  auth,
  authorize('TRADER', 'ADMIN'),
  checkOperationOwnership,
  operationController.requestManualClose
);

module.exports = router;