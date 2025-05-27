
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Admin User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Permissão negada
 */
router.get('/', auth, userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Admin User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "novoNome"
 *               email:
 *                 type: string
 *                 example: "novo@email.com"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */

router.put('/:id', auth, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Admin User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário a ser removido
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Usuário removido com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Acesso negado
 */

router.delete('/:id', auth, checkPermission('DELETE_USER'), userController.deleteUser);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Retorna o perfil do usuário logado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil retornados com sucesso
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/me', auth, userController.getProfile);

module.exports = router;
