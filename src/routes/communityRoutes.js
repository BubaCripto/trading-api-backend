const express = require('express');
const router = express.Router();
const controller = require('../controllers/community/communityController');
const communityDashboardController = require('../controllers/dashboard/communityDashboardController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const handleValidation = require('../middleware/validations/handleValidation');
const { param } = require('express-validator');
const { validateCreateCommunity, validateUpdateCommunity } = require('../middleware/validations/communityValidation');

/**
 * @swagger
 * /api/communities/{id}/stats:
 *   get:
 *     summary: Get community dashboard statistics by community ID
 *     tags:
 *       - Community Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the community
 *     responses:
 *       200:
 *         description: Community dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CommunityStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Community not found
 */
router.get('/:id/stats',
  auth,

  param('id').isMongoId(),
  handleValidation,
  communityDashboardController.getCommunityStats
);

/**
 * @swagger
 * /api/communities/{id}/signals:
 *   get:
 *     summary: Get community signals by community ID
 *     tags:
 *       - Community Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the community
 *     responses:
 *       200:
 *         description: Community signals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommunitySignal'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Community not found
 */
router.get('/:id/signals',
  auth,
  //checkPermission('VIEW_COMMUNITY_DASHBOARD'),
  param('id').isMongoId(),
  handleValidation,
  communityDashboardController.getCommunitySignals
);


/**
 * @swagger
 * /api/communities/{id}/performance:
 *   get:
 *     summary: Get community performance by community ID
 *     tags:
 *       - Community Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the community
 *     responses:
 *       200:
 *         description: Community performance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommunityPerformance'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Community not found
 */
router.get('/:id/performance',
  auth,
  //checkPermission('VIEW_COMMUNITY_DASHBOARD'),
  param('id').isMongoId(),
  handleValidation,
  communityDashboardController.getCommunityPerformance
);

/**
 * @swagger
 * /api/communities/{id}/traders:
 *   get:
 *     summary: Get community traders by community ID
 *     tags:
 *       - Community Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the community
 *     responses:
 *       200:
 *         description: Community traders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommunityTrader'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Community not found
 */
router.get('/:id/traders',
  auth,
  checkPermission('VIEW_COMMUNITY_DASHBOARD'),
  param('id').isMongoId(),
  handleValidation,
  communityDashboardController.getCommunityTraders
);


/**
 * @swagger
 * tags:
 *   name: Communities
 *   description: Gerenciamento de comunidades
 */

/**
 * @swagger
 * /api/communities:
 *   post:
 *     summary: Criar nova comunidade
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               telegramLink:
 *                 type: string
 *               discordLink:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comunidade criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/',
  auth,
  checkPermission('CREATE_COMMUNITY'),
  validateCreateCommunity,
  handleValidation,
  controller.createCommunity
);

/**
 * @swagger
 * /api/communities:
 *   get:
 *     summary: Listar comunidades públicas
 *     tags: [Communities]
 *     responses:
 *       200:
 *         description: Lista de comunidades
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/communities/me:
 *   get:
 *     summary: Obter comunidades do usuário logado
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comunidades do usuário
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
 *                         example: "6641b95d56d0fba3d6ef08e2"
 *                       name:
 *                         type: string
 *                         example: "Comunidade de Trading"
 *                       description:
 *                         type: string
 *                         example: "Uma comunidade focada em estratégias de trading"
 *                       active:
 *                         type: boolean
 *                         example: true
 *                       userId:
 *                         type: string
 *                         example: "6641b95d56d0fba3d6ef08a4"
 *                       createdBy:
 *                         type: string
 *                         example: "6641b95d56d0fba3d6ef08a4"
 *                       hiredTraders:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "6641b95d56d0fba3d6ef08a5"
 *                       isPrivate:
 *                         type: boolean
 *                         example: false
 *                       telegramLink:
 *                         type: string
 *                         example: "https://t.me/comunidadetrading"
 *                       discordLink:
 *                         type: string
 *                         example: "https://discord.gg/comunidadetrading"
 *                       category:
 *                         type: string
 *                         example: "Swing Trade"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00.000Z"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Não autorizado
 */
router.get('/me', auth, controller.getMyCommunities);

/**
 * @swagger
 * /api/communities/{id}:
 *   get:
 *     summary: Obter detalhes de uma comunidade
 *     tags: [Communities]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes da comunidade
 *       404:
 *         description: Comunidade não encontrada
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/communities/{id}:
 *   put:
 *     summary: Editar uma comunidade
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               telegramLink: { type: string }
 *               discordLink: { type: string }
 *               category: { type: string }
 *     responses:
 *       200:
 *         description: Comunidade atualizada
 *       403:
 *         description: Permissão negada
 *       404:
 *         description: Comunidade não encontrada
 */
router.put(
  '/:id',
  auth,
  checkPermission('UPDATE_COMMUNITY'),
  validateUpdateCommunity,
  handleValidation,
  controller.updateCommunity
);

/**
 * @swagger
 * /api/communities/{id}:
 *   delete:
 *     summary: Deletar comunidade
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Comunidade removida
 *       403:
 *         description: Permissão negada
 */
router.delete('/:id', auth, checkPermission('DELETE_COMMUNITY'), controller.deleteCommunity);

/**
 * @swagger
 * /api/communities/{id}/hire/{traderId}:
 *   patch:
 *     summary: Contratar um trader
 *     tags: [Admin Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: traderId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trader contratado
 */
router.patch('/:id/hire/:traderId', auth, checkPermission('ADMIN_HIRE_TRADER'), controller.hireTrader);

/**
 * @swagger
 * /api/communities/{id}/remove/{traderId}:
 *   patch:
 *     summary: Remover um trader contratado
 *     tags: [Admin Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: traderId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trader removido
 */
router.patch('/:id/remove/:traderId', auth, checkPermission('ADMIN_REMOVE_TRADER'), controller.removeTrader);

/**
 * @swagger
 * /api/communities/{id}/invite/{userId}:
 *   patch:
 *     summary: Convidar um membro
 *     tags: [Admin Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Membro convidado
 */
router.patch('/:id/invite/:userId', auth, checkPermission('ADMIN_INVITE_MEMBER'), controller.inviteMember);

// Add before module.exports = router;

/**
 * @swagger
 * /api/communities/{id}/subscribe/{planId}:
 *   patch:
 *     summary: Subscribe community to a plan
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: planId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Community subscribed to plan
 *       403:
 *         description: Permission denied
 */
router.patch('/:id/subscribe/:planId',auth, checkPermission('MANAGE_SUBSCRIPTIONS'), controller.subscribeToPlan
);
// suas rotas acima...

/**
 * @swagger
 * components:
 *   schemas:
 *     CommunityStats:
 *       type: object
 *       properties:
 *         totalSignals:
 *           type: integer
 *           example: 45
 *         totalTraders:
 *           type: integer
 *           example: 3
 *         totalSuccessRate:
 *           type: number
 *           format: float
 *           example: 72.4
 *         totalGainPercent:
 *           type: number
 *           format: float
 *           example: 15.6
 *         totalLossPercent:
 *           type: number
 *           format: float
 *           example: 3.4
 *         totalOperationsClosed:
 *           type: integer
 *           example: 38

 *     CommunitySignal:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "662f0ec7f8f3a59c6c8e8e90"
 *         operationId:
 *           type: string
 *           example: "662eaf5f192ee8949b8b1a9d"
 *         traderId:
 *           type: string
 *           example: "662e9d5f192ee8949b8b1a12"
 *         communityId:
 *           type: string
 *           example: "662f0ec7f8f3a59c6c8e8e90"
 *         symbol:
 *           type: string
 *           example: "BTCUSDT"
 *         entryPrice:
 *           type: number
 *           example: 25100.0
 *         stopLoss:
 *           type: number
 *           example: 24800.0
 *         targets:
 *           type: array
 *           items:
 *             type: number
 *           example: [25300.0, 25500.0, 25800.0]
 *         status:
 *           type: string
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-07-09T15:32:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-07-09T16:05:00.000Z"

 *     CommunityPerformance:
 *       type: object
 *       properties:
 *         traderId:
 *           type: string
 *           example: "662e9d5f192ee8949b8b1a12"
 *         traderName:
 *           type: string
 *           example: "Carlos Andrade"
 *         operations:
 *           type: integer
 *           example: 22
 *         winRate:
 *           type: number
 *           format: float
 *           example: 68.2
 *         totalGain:
 *           type: number
 *           format: float
 *           example: 10.5
 *         totalLoss:
 *           type: number
 *           format: float
 *           example: 2.1
 *         netResult:
 *           type: number
 *           format: float
 *           example: 8.4

 *     CommunityTrader:
 *       type: object
 *       properties:
 *         traderId:
 *           type: string
 *           example: "662e9d5f192ee8949b8b1a12"
 *         name:
 *           type: string
 *           example: "João Vilela"
 *         joinedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-01T10:15:00.000Z"
 *         operationsCount:
 *           type: integer
 *           example: 18
 *         successRate:
 *           type: number
 *           format: float
 *           example: 75.3
 */


module.exports = router;
