const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController');
const { auth, authorize } = require('../middleware/auth');
const { canCreateUser, canUpdateUser } = require('../middleware/userPermissions');

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gerenciamento de usuários e autenticação
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Cria um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, TRADER, COMMUNITY]
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: Email ou username já existe
 */
router.post('/',canCreateUser, userController.createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Lista todos os usuários (requer ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/', auth, authorize('ADMIN'), userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Busca um usuário pelo ID
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
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', auth, userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Atualiza um usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       400:
 *         description: Dados inválidos
 */
router.put('/:id', auth, canUpdateUser, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Deleta um usuário (requer ADMIN)
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
 *         description: Usuário deletado
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', auth, authorize('ADMIN'), userController.deleteUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags: [Users]
 *     summary: Realiza login e retorna um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token retornado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', userController.loginUser);

module.exports = router;
