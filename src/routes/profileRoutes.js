
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile/profileController');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Perfil do usuário autenticado
 */

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Retorna os dados do perfil do usuário autenticado
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *       404:
 *         description: Perfil não encontrado
 */

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Atualiza o perfil do usuário autenticado
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Perfil não encontrado
 */

router.get('/me', auth, profileController.getMyProfile);
router.put('/me', auth, profileController.updateMyProfile);

module.exports = router;
