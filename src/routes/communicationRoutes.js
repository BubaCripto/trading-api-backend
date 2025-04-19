const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communication/communicationController');
const { auth, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Communications
 *     description: Gerenciamento de comunicações das comunidades
 */

// Middleware global de autenticação e autorização para ADMIN
router.use(auth, authorize('ADMIN'));

/**
 * @swagger
 * /api/communications:
 *   post:
 *     summary: Cria uma nova comunicação para uma comunidade
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - communityId
 *               - type
 *               - credentials
 *             properties:
 *               communityId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Discord, Telegram, Slack]
 *               credentials:
 *                 type: object
 *                 properties:
 *                   webhookUrl:
 *                     type: string
 *             example:
 *               communityId: "67d9845720515d6ee2dffd27"
 *               type: "Discord"
 *               credentials:
 *                 webhookUrl: "https://discord.com/api/webhooks/your-webhook-url"
 *     responses:
 *       201:
 *         description: Comunicação criada com sucesso
 *       400:
 *         description: Erro na requisição
 */
router.post('/', communicationController.createCommunication);

/**
 * @swagger
 * /api/communications:
 *   get:
 *     summary: Lista todas as comunicações
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comunicações
 */
router.get('/', communicationController.getAllCommunications);

/**
 * @swagger
 * /api/communications/filter:
 *   get:
 *     summary: Filtra comunicações por palavra-chave
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Termo para busca por tipo ou webhook
 *     responses:
 *       200:
 *         description: Lista filtrada de comunicações
 */
router.get('/filter', communicationController.getFilteredCommunications);

/**
 * @swagger
 * /api/communications/{id}:
 *   get:
 *     summary: Retorna uma comunicação por ID
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comunicação encontrada
 *       404:
 *         description: Comunicação não encontrada
 */
router.get('/:id', communicationController.getCommunicationById);

/**
 * @swagger
 * /api/communications/{id}:
 *   put:
 *     summary: Atualiza os dados de uma comunicação
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               type:
 *                 type: string
 *               credentials:
 *                 type: object
 *                 properties:
 *                   webhookUrl:
 *                     type: string
 *             example:
 *               type: "Discord"
 *               credentials:
 *                 webhookUrl: "https://discord.com/api/webhooks/your-new-webhook"
 *     responses:
 *       200:
 *         description: Comunicação atualizada
 *       404:
 *         description: Comunicação não encontrada
 */
router.put('/:id', communicationController.updateCommunication);

/**
 * @swagger
 * /api/communications/{id}:
 *   delete:
 *     summary: Remove uma comunicação do sistema
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comunicação deletada com sucesso
 *       404:
 *         description: Comunicação não encontrada
 */
router.delete('/:id', communicationController.deleteCommunication);

module.exports = router;
