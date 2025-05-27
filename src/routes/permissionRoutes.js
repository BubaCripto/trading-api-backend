const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission/permissionController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { validateCreatePermission, validateUpdatePermission } = require('../middleware/validations/permissionValidation');
const handleValidation = require('../middleware/validations/handleValidation');
const { createOperationLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Gerenciamento de permissões do sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único da permissão
 *         name:
 *           type: string
 *           description: Nome da permissão
 *           enum: [CREATE_USER, VIEW_USER, UPDATE_USER, DELETE_USER, MANAGE_USERS, CREATE_COMMUNITY, VIEW_COMMUNITY, UPDATE_COMMUNITY, DELETE_COMMUNITY, MANAGE_COMMUNITIES, INVITE_MEMBER, HIRE_TRADER, REMOVE_TRADER, CREATE_OPERATION, VIEW_OPERATION, UPDATE_OPERATION, DELETE_OPERATION, MANAGE_OPERATIONS, SEND_ALERT, MANAGE_CHANNELS, VIEW_COMMUNICATIONS, VIEW_PERMISSION, EDIT_PERMISSION, DELETE_PERMISSION, MANAGE_PERMISSIONS, ACCESS_ADMIN_PANEL, RESET_PASSWORDS, MANAGE_PLANS]
 *         description:
 *           type: string
 *           description: Descrição da permissão
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
 * /api/permissions:
 *   get:
 *     summary: Lista todas as permissões
 *     tags: [Permissions]
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
 *         description: Lista de permissões
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permission'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 28
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 */
router.get('/', 
  auth, 
  checkPermission('MANAGE_PERMISSIONS'),
  permissionController.getAllPermissions
);

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: Obtém uma permissão pelo ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da permissão
 *     responses:
 *       200:
 *         description: Detalhes da permissão
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       404:
 *         description: Permissão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permissão não encontrada
 */
router.get('/:id', 
  auth, 
  checkPermission('MANAGE_PERMISSIONS'),
  permissionController.getPermissionById
);

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Cria uma nova permissão
 *     tags: [Permissions]
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
 *                 enum: [CREATE_USER, VIEW_USER, UPDATE_USER, DELETE_USER, MANAGE_USERS, CREATE_COMMUNITY, VIEW_COMMUNITY, UPDATE_COMMUNITY, DELETE_COMMUNITY, MANAGE_COMMUNITIES, INVITE_MEMBER, HIRE_TRADER, REMOVE_TRADER, CREATE_OPERATION, VIEW_OPERATION, UPDATE_OPERATION, DELETE_OPERATION, MANAGE_OPERATIONS, SEND_ALERT, MANAGE_CHANNELS, VIEW_COMMUNICATIONS, VIEW_PERMISSION, EDIT_PERMISSION, DELETE_PERMISSION, MANAGE_PERMISSIONS, ACCESS_ADMIN_PANEL, RESET_PASSWORDS, MANAGE_PLANS]
 *                 example: MANAGE_PLANS
 *               description:
 *                 type: string
 *                 example: Permite gerenciar planos do sistema
 *     responses:
 *       201:
 *         description: Permissão criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permissão criada com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 */
router.post('/', 
  auth, 
  checkPermission('MANAGE_PERMISSIONS'),
  validateCreatePermission,
  handleValidation,
  permissionController.createPermission
);

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Atualiza uma permissão existente
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da permissão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: Nova descrição da permissão
 *     responses:
 *       200:
 *         description: Permissão atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permissão atualizada com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       404:
 *         description: Permissão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permissão não encontrada
 */
router.put('/:id', 
  auth, 
  checkPermission('MANAGE_PERMISSIONS'),
  validateUpdatePermission,
  handleValidation,
  permissionController.updatePermission
);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Remove uma permissão
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da permissão
 *     responses:
 *       200:
 *         description: Permissão removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permissão removida com sucesso
 *       404:
 *         description: Permissão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permissão não encontrada
 */
router.delete('/:id', 
  auth, 
  checkPermission('MANAGE_PERMISSIONS'),
  permissionController.deletePermission
);

module.exports = router;