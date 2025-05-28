const express = require('express');
const router = express.Router();
const controller = require('../controllers/contract/contractMessageController');
const { auth } = require('../middleware/auth');
const handleValidation = require('../middleware/validations/handleValidation');
const {
  validateSendMessage,
  validateGetMessages,
  validateMarkAsRead
} = require('../middleware/validations/contractMessageValidation');


/**
 * @swagger
 * tags:
 *   name: ContractMessages
 *   description: Mensagens entre trader e comunidade vinculadas a um contrato
 */

/**
 * @swagger
 * /contracts/{id}/messages:
 *   post:
 *     summary: Enviar uma nova mensagem em um contrato
 *     tags: [ContractMessages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do contrato
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Conteúdo da mensagem a ser enviada
 *                 example: "Olá, vamos começar amanhã às 9h?"
 *     responses:
 *       201:
 *         description: Mensagem enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string, example: "661e10241f1a730b8f965abc" }
 *                 message: { type: string, example: "Olá, vamos começar amanhã às 9h?" }
 *                 sender: { type: string, example: "660fef1a0fbb150f95dc9289" }
 *                 contract: { type: string, example: "660fff3d4f33e81a3d3dcf92" }
 *                 read: { type: boolean, example: false }
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: A mensagem é obrigatória
 *       403:
 *         description: Você não faz parte deste contrato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Você não tem permissão para enviar mensagens neste contrato
 *       404:
 *         description: Contrato não encontrado
 */

// Enviar mensagem
router.post(
  '/:id/messages',
  auth,
  validateSendMessage,
  handleValidation,
  controller.sendMessage
);

/**
 * @swagger
 * /contracts/{id}/messages:
 *   get:
 *     summary: Listar todas as mensagens de um contrato
 *     tags: [ContractMessages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do contrato
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de mensagens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string, example: "661e103a7f6e380c61230a12" }
 *                   message: { type: string, example: "Vamos começar agora." }
 *                   sender: { type: string, example: "660fef1a0fbb150f95dc9289" }
 *                   read: { type: boolean, example: false }
 *                   createdAt: { type: string, format: date-time }
 *       403:
 *         description: Você não pode visualizar mensagens deste contrato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Acesso negado ao histórico de mensagens
 *       404:
 *         description: Contrato não encontrado
 */

router.get(
  '/:id/messages',
  auth,
  validateGetMessages,
  handleValidation,
  controller.getMessagesByContract
);

/**
 * @swagger
 * /contracts/messages/{messageId}/read:
 *   patch:
 *     summary: Marcar uma mensagem como lida
 *     tags: [ContractMessages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         description: ID da mensagem
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mensagem marcada como lida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *                 read: { type: boolean, example: true }
 *       403:
 *         description: Você não tem permissão para marcar esta mensagem
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Você não pode marcar esta mensagem como lida
 *       404:
 *         description: Mensagem não encontrada
 */

// Marcar mensagem como lida
router.patch(
  '/messages/:messageId/read',
  auth,
  validateMarkAsRead,
  handleValidation,
  controller.markMessageAsRead
);

module.exports = router;
