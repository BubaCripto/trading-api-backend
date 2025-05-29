const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan/planController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { validateCreatePlan, validateUpdatePlan } = require('../middleware/validations/planValidation');
const handleValidation = require('../middleware/validations/handleValidation');

/**
 * @swagger
 * tags:
 *   name: Admin Plans
 *   description: Gerenciamento de planos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       required:
 *         - name
 *         - maxCommunications
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do plano
 *         name:
 *           type: string
 *           description: Nome do plano
 *         description:
 *           type: string
 *           description: Descrição do plano
 *         maxCommunications:
 *           type: number
 *           description: Número máximo de comunicações permitidas
 *         priceMonthly:
 *           type: number
 *           description: Preço mensal do plano
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de recursos incluídos no plano
 *         active:
 *           type: boolean
 *           description: Status do plano (ativo/inativo)
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
 * /api/plans:
 *   get:
 *     summary: Lista todos os planos
 *     tags: [Admin Plans]
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
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo/inativo
 *     responses:
 *       200:
 *         description: Lista de planos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plan'
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
 *                       example: 3
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
router.get('/', planController.getAllPlans);

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     summary: Obtém um plano pelo ID
 *     tags: [Admin Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do plano
 *     responses:
 *       200:
 *         description: Detalhes do plano
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Plano não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get('/:id', planController.getPlanById);

/**
 * @swagger
 * /api/plans:
 *   post:
 *     summary: Cria um novo plano
 *     tags: [Admin Plans]
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
 *               - maxCommunications
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [BASIC, STANDARD, PREMIUM]
 *                 example: BASIC
 *               description:
 *                 type: string
 *                 example: Plano básico com recursos limitados
 *               maxCommunications:
 *                 type: number
 *                 example: 1
 *               priceMonthly:
 *                 type: number
 *                 example: 29.90
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Acesso básico", "Suporte por email"]
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Plano criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Plano criado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Erro na criação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Já existe um plano com este nome
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 */
router.post('/', 
  auth, 
  checkPermission('MANAGE_PLANS'), 
  validateCreatePlan, 
  handleValidation, 
  planController.createPlan
);

/**
 * @swagger
 * /api/plans/{id}:
 *   put:
 *     summary: Atualiza um plano existente
 *     tags: [Admin Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do plano
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [BASIC, STANDARD, PREMIUM]
 *                 example: BASIC
 *               description:
 *                 type: string
 *                 example: Plano básico atualizado
 *               maxCommunications:
 *                 type: number
 *                 example: 2
 *               priceMonthly:
 *                 type: number
 *                 example: 39.90
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Acesso básico", "Suporte por email", "Novo recurso"]
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Plano atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Plano atualizado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plano não encontrado
 *       400:
 *         description: Erro na atualização
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 */
router.put('/:id', 
  auth, 
  checkPermission('MANAGE_PLANS'), 
  validateUpdatePlan, 
  handleValidation, 
  planController.updatePlan
);

/**
 * @swagger
 * /api/plans/{id}:
 *   delete:
 *     summary: Remove um plano
 *     tags: [Admin Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do plano
 *     responses:
 *       200:
 *         description: Plano removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Plano removido com sucesso
 *       404:
 *         description: Plano não encontrado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 */
router.delete('/:id', auth, checkPermission('MANAGE_PLANS'), planController.deletePlan);

module.exports = router;