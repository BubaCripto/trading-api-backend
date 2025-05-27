const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role/roleController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { validateCreateRole, validateUpdateRole } = require('../middleware/validations/roleValidation');
const handleValidation = require('../middleware/validations/handleValidation');


/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gerenciamento de roles e permissões
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - name
 *         - permissions
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único da role
 *         name:
 *           type: string
 *           enum: [ADMIN, TRADER, COMMUNITY, MODERATOR, USER, GUEST]
 *           description: Nome da role
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de IDs de permissões associadas à role
 *         description:
 *           type: string
 *           description: Descrição da role
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Lista todas as roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *     responses:
 *       200:
 *         description: Lista de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 6
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token não fornecido
 */
router.get('/', auth,   checkPermission('MANAGE_PERMISSIONS'),  roleController.getAllRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtém uma role pelo ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da role
 *     responses:
 *       200:
 *         description: Detalhes da role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Role não encontrada
 *       401:
 *         description: Não autorizado
 */
router.get('/:id', auth,   checkPermission('MANAGE_PERMISSIONS'),  roleController.getRoleById);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Cria uma nova role
 *     tags: [Roles]
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
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [ADMIN, TRADER, COMMUNITY, MODERATOR, USER, GUEST]
 *                 example: MODERATOR
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
 *               description:
 *                 type: string
 *                 example: Role de moderador com permissões limitadas
 *     responses:
 *       201:
 *         description: Role criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role criada com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Erro na criação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Já existe uma role com este nome
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 */
router.post('/', 
  auth, 
  checkPermission('MANAGE_PERMISSIONS'), 
  validateCreateRole, 
  handleValidation, 
  roleController.createRole
);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Atualiza uma role existente
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [ADMIN, TRADER, COMMUNITY, MODERATOR, USER, GUEST]
 *                 example: MODERATOR
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"]
 *               description:
 *                 type: string
 *                 example: Role de moderador atualizada com novas permissões
 *     responses:
 *       200:
 *         description: Role atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role atualizada com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role não encontrada
 *       400:
 *         description: Erro na atualização
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 */
router.put('/:id', 
  auth, 
  checkPermission('MANAGE_PERMISSIONS'), 
  validateUpdateRole, 
  handleValidation, 
  roleController.updateRole
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Remove uma role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da role
 *     responses:
 *       200:
 *         description: Role removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role removida com sucesso
 *       404:
 *         description: Role não encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 */
router.delete('/:id', auth, checkPermission('MANAGE_PERMISSIONS'), roleController.deleteRole);

module.exports = router;