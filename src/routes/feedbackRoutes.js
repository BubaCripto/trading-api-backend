const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback/feedbackController');
const { auth } = require('../middleware/auth');
const handleValidation = require('../middleware/validations/handleValidation');

const {
  validateCreateFeedback,
  validateContractIdParam,
  validateUserIdParam
} = require('../middleware/validations/feedbackValidation');

/**
 * @swagger
 * tags:
 *   name: Feedbacks
 *   description: Gerenciamento de feedbacks para contratos fechados
 */

/**
 * @swagger
 * /api/feedbacks:
 *   post:
 *     summary: Cria um feedback para um contrato fechado
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contractId, scores]
 *             properties:
 *               contractId:
 *                 type: string
 *                 example: "660fff3d4f33e81a3d3dcf92"
 *               scores:
 *                 type: object
 *                 example: {
 *                   "sinais_claros": 5,
 *                   "qtd_operacoes": 4,
 *                   "estrategias_explicadas": 5,
 *                   "resposta_duvidas": 5
 *                 }
 *               experiencia:
 *                 type: string
 *                 example: "Sinais ótimos!"
 *               melhorar:
 *                 type: string
 *                 example: "Nenhum ponto"
 *               denuncia:
 *                 type: string
 *                 example: ""
 *     responses:
 *       201:
 *         description: Feedback criado com sucesso
 *       400:
 *         description: Dados inválidos ou contrato não está fechado
 *       403:
 *         description: Permissão negada
 *       409:
 *         description: Feedback já existente
 */
router.post('/', auth, validateCreateFeedback, handleValidation, feedbackController.createFeedback);

/**
 * @swagger
 * /api/feedbacks/contract/{contractId}:
 *   get:
 *     summary: Lista todos os feedbacks de um contrato
 *     tags: [Feedbacks]
 *     parameters:
 *       - name: contractId
 *         in: path
 *         required: true
 *         description: ID do contrato
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de feedbacks
 *       404:
 *         description: Contrato não encontrado
 */
router.get('/contract/:contractId', validateContractIdParam, handleValidation, feedbackController.getFeedbacksByContract);

/**
 * @swagger
 * /api/feedbacks/user/{userId}:
 *   get:
 *     summary: Lista todos os feedbacks recebidos por um usuário
 *     tags: [Feedbacks]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de feedbacks
 */
router.get('/user/:userId', validateUserIdParam, handleValidation, feedbackController.getFeedbacksByUser);

module.exports = router;