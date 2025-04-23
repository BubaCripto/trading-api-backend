const express = require('express');
const router = express.Router();

const controller = require('../controllers/community/communityController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const {
  validateCreateCommunity,
  validateUpdateCommunity
} = require('../middleware/validations/communityValidation');
const handleValidation = require('../middleware/validations/handleValidation');

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
 *     tags: [Communities]
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
 *     tags: [Communities]
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
 *     tags: [Communities]
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

module.exports = router;
