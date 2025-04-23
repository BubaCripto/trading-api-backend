const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract/contractController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');


const {
  validateCreateContract,
  validateContractIdParam,
  validateGetContractsQuery
} = require('../middleware/validations/contractValidation');


/**
 * @swagger
 * tags:
 *   name: Contracts
 *   description: Gerenciamento de contratos entre comunidades e traders
 */

/**
 * @swagger
 * /contracts/request:
 *   post:
 *     summary: Comunidade solicita contrato com um trader
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [communityId, traderId, terms]
 *             properties:
 *               communityId:
 *                 type: string
 *                 example: "660fff3d4f33e81a3d3dcf92"
 *               traderId:
 *                 type: string
 *                 example: "660fef1a0fbb150f95dc9289"
 *               terms:
 *                 type: string
 *                 example: "Operar das 9h às 12h com estratégia XYZ"
 *     responses:
 *       201:
 *         description: Contrato criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Permissão negada
 *       409:
 *         description: Contrato já existente
 */
router.post('/request', auth, checkPermission('HIRE_TRADER'), validateCreateContract, contractController.requestContract);

/**
 * @swagger
 * /contracts/{id}/accept:
 *   post:
 *     summary: Trader aceita o contrato
 *     tags: [Contracts]
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
 *         description: Contrato aceito com sucesso
 *       403:
 *         description: Apenas o trader convidado pode aceitar
 *       400:
 *         description: Contrato já processado
 */
router.post('/:id/accept', auth, validateContractIdParam, contractController.acceptContract);

/**
 * @swagger
 * /contracts/{id}/reject:
 *   post:
 *     summary: Trader rejeita o contrato
 *     tags: [Contracts]
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
 *         description: Contrato rejeitado com sucesso
 *       403:
 *         description: Apenas o trader convidado pode rejeitar
 */
router.post('/:id/reject', auth, validateContractIdParam, contractController.rejectContract);

/**
 * @swagger
 * /contracts/{id}/revoke:
 *   post:
 *     summary: Comunidade ou trader revoga contrato
 *     tags: [Contracts]
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
 *         description: Contrato revogado com sucesso
 *       403:
 *         description: Apenas envolvidos no contrato podem revogar
 */
router.post('/:id/revoke', auth,validateContractIdParam, contractController.revokeContract);

/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: Lista contratos filtrando por comunidade, trader ou status
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: community
 *         in: query
 *         schema:
 *           type: string
 *         example: "660fff3d4f33e81a3d3dcf92"
 *       - name: trader
 *         in: query
 *         schema:
 *           type: string
 *         example: "660fef1a0fbb150f95dc9289"
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, REVOKED]
 *     responses:
 *       200:
 *         description: Lista de contratos
 */
router.get('/', auth, validateGetContractsQuery,  contractController.getContracts);

module.exports = router;
