const express = require('express');
const router = express.Router();
const profileController = require('../controllers/user/profileController');
const { auth } = require('../middleware/auth');
const { validateProfileCreation, validateProfileUpdate } = require('../middleware/profileValidation');
const { canAccessOwnProfile, canEditOwnProfile } = require('../middleware/profilePermissions');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Gerenciamento de perfis de usuários
 */

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Criar um novo perfil
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomeCompleto
 *             properties:
 *               nomeCompleto:
 *                 type: string
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *               documento:
 *                 type: string
 *               telefone:
 *                 type: string
 *               endereco:
 *                 type: object
 *                 properties:
 *                   rua: { type: string }
 *                   numero: { type: string }
 *                   bairro: { type: string }
 *                   cidade: { type: string }
 *                   estado: { type: string }
 *                   cep: { type: string }
 *               imagemPerfil:
 *                 type: string
 *               bio:
 *                 type: string
 *               redesSociais:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tipo: { type: string }
 *                     link: { type: string }
 *     responses:
 *       201:
 *         description: Perfil criado com sucesso
 *       400:
 *         description: Erro de validação
 */
router.post('/', auth, validateProfileCreation, profileController.createProfile);

/**
 * @swagger
 * /api/profiles/{userId}:
 *   get:
 *     summary: Buscar perfil de um usuário
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Perfil não encontrado
 */
router.get('/:userId', auth, canAccessOwnProfile, profileController.getProfileByUserId);

/**
 * @swagger
 * /api/profiles/{userId}:
 *   put:
 *     summary: Atualizar perfil de usuário
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Profile'
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Perfil não encontrado
 */
router.put('/:userId', auth, canEditOwnProfile, validateProfileUpdate, profileController.updateProfile);

/**
 * @swagger
 * /api/profiles/{userId}:
 *   delete:
 *     summary: Deletar perfil
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil removido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Perfil não encontrado
 */
router.delete('/:userId', auth, canEditOwnProfile, profileController.deleteProfile);

module.exports = router;
