const express = require('express');
const router = express.Router();
const controller = require('../controllers/communication/communicationController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const handleValidation = require('../middleware/validations/handleValidation');
const {
  validateCreateCommunication,
  validateToggleCommunication
} = require('../middleware/validations/validateCommunication');

/**
 * @swagger
 * tags:
 *   name: Communications
 *   description: Gerenciamento de conexões de comunicação das comunidades (Telegram, Discord, WhatsApp)
 */

/**
 * @swagger
 * /api/communications:
 *   post:
 *     summary: Criar nova conexão de comunicação para a comunidade
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [communityId, type, credentials]
 *             properties:
 *               communityId:
 *                 type: string
 *                 example: "660fff3d4f33e81a3d3dcf92"
 *               type:
 *                 type: string
 *                 enum: [Telegram, Discord, WhatsApp]
 *                 example: "Telegram"
 *               credentials:
 *                 oneOf:
 *                   - properties:
 *                       botToken: { type: string, example: "123456:ABC-DEF" }
 *                       chatId: { type: string, example: "-1001234567890" }
 *                   - properties:
 *                       webhookUrl: { type: string, example: "https://discord.com/api/webhooks/..." }
 *                   - properties:
 *                       accountSid: { type: string, example: "AC..." }
 *                       authToken: { type: string, example: "your_auth_token" }
 *                       fromNumber: { type: string, example: "+14155238886" }
 *                       toNumber: { type: string, example: "+5511999999999" }
 *     responses:
 *       201:
 *         description: Comunicação criada
 *       403:
 *         description: Permissão negada ou limite atingido
 */
router.post(
  '/',
  auth,
  validateCreateCommunication,
  checkPermission('CREATE_COMMUNICATION'),
  handleValidation,
  controller.createCommunication
);

/**
 * @swagger
 * /api/communications:
 *   get:
 *     summary: Listar conexões de comunicação da comunidade
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: communityId
 *         schema:
 *           type: string
 *         description: Filtrar por comunidade específica
 *     responses:
 *       200:
 *         description: Lista de comunicações
 */
router.get(
  '/',
  auth,
  checkPermission('VIEW_COMMUNICATIONS'),
  controller.getCommunications
);

/**
 * @swagger
 * /api/communications/{id}/toggle:
 *   patch:
 *     summary: Ativar ou desativar comunicação
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status de comunicação atualizado
 *       403:
 *         description: Sem permissão
 */
router.patch(
  '/:id/toggle',
  auth,
  validateToggleCommunication,
  checkPermission('UPDATE_COMMUNICATION'), // ou use uma perm específica
  handleValidation,
  controller.toggleCommunication
);

/**
 * @swagger
 * /api/communications/{id}:
 *   delete:
 *     summary: Deletar uma comunicação existente
 *     tags: [Communications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Comunicação deletada com sucesso
 *       403:
 *         description: Sem permissão
 */
router.delete(
  '/:id',
  auth,
  validateToggleCommunication,
  checkPermission('DELETE_COMMUNICATION'),
  handleValidation,
  controller.deleteCommunication
);

module.exports = router;
