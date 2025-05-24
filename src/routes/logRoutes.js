const express = require('express');
const router = express.Router();
const LogController = require('../controllers/log/logController');
const { auth } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Funcionalidades administrativas do sistema
 */

/**
 * @swagger
 * /api/logs/logs:
 *   get:
 *     summary: Retorna todos os logs do sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de logs retornada com sucesso
 */
router.get('/logs', 
  auth, 
  checkPermission('VIEW_LOGS'), 
  (req, res, next) => LogController.getLogs(req, res, next)
);

/**
 * @swagger
 * /api/logs/stats:
 *   get:
 *     summary: Retorna estatísticas de uso das rotas
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
router.get('/stats', 
  auth, 
  checkPermission('VIEW_LOGS'), 
  (req, res, next) => LogController.getRouteStats(req, res, next)
);

module.exports = router;
