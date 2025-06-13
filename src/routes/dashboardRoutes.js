const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard/dashboardController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: Estatísticas administrativas do sistema
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Obtém estatísticas para o dashboard administrativo
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas do dashboard administrativo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 */
router.get('/', auth, checkPermission('ACCESS_ADMIN_PANEL'), dashboardController.getAdminDashboard);

module.exports = router;