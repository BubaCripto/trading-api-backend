const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communitycontroller');
const { auth, authorize } = require('../middleware/auth');



/**
 * @swagger
 * tags:
 *   name: Communities
 *   description: Endpoints relacionados às comunidades
 */

/**
 * @swagger
 * /api/communities:
 *   post:
 *     summary: Cria uma nova comunidade
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *               hiredTraders:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Comunidade criada com sucesso
 *       400:
 *         description: Erro na requisição
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado
 */
router.post(
  '/',
  auth,
  authorize('ADMIN'),
  communityController.createCommunity
);

/**
 * @swagger
 * /api/communities:
 *   get:
 *     summary: Lista todas as comunidades
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comunidades
 */
router.get(
  '/',
  auth,
  communityController.getAllCommunities
);

/**
 * @swagger
 * /api/communities/{id}:
 *   get:
 *     summary: Busca comunidade por ID
 *     tags: [Communities]
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
 *         description: Comunidade encontrada
 *       404:
 *         description: Comunidade não encontrada
 */
router.get(
  '/:id',
  auth,
  communityController.getCommunityById
);

/**
 * @swagger
 * /api/communities/{id}:
 *   put:
 *     summary: Atualiza uma comunidade existente
 *     tags: [Communities]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *               hiredTraders:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Comunidade atualizada com sucesso
 *       404:
 *         description: Comunidade não encontrada
 */
router.put(
  '/:id',
  auth,
  authorize('ADMIN'),
  communityController.updateCommunity
);

/**
 * @swagger
 * /api/communities/{id}:
 *   delete:
 *     summary: Deleta uma comunidade
 *     tags: [Communities]
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
 *         description: Comunidade deletada com sucesso
 *       404:
 *         description: Comunidade não encontrada
 */
router.delete(
  '/:id',
  auth,
  authorize('ADMIN'),
  communityController.deleteCommunity
);

/**
 * @swagger
 * /api/communities/{id}/hire:
 *   patch:
 *     summary: Contrata um trader para a comunidade
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: traderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trader contratado com sucesso
 *       403:
 *         description: Permissão negada
 *       404:
 *         description: Comunidade ou trader não encontrados
 */
router.patch('/:id/hire', auth, authorize('ADMIN'), communityController.hireTrader);

/**
 * @swagger
 * /api/communities/{id}/fire:
 *   patch:
 *     summary: Remove um trader da comunidade
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: traderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trader removido com sucesso
 *       403:
 *         description: Permissão negada
 *       404:
 *         description: Comunidade ou trader não encontrados
 */
router.patch('/:id/fire', auth, authorize('ADMIN'), communityController.fireTrader);

module.exports = router;
