const express = require('express');
const router = express.Router();
const LogController = require('../controllers/log/logController');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');


// Rotas protegidas que requerem autenticação e permissões de admin
router.get('/logs', 
  auth, 
  checkPermission('VIEW_LOGS'), 
  LogController.getLogs
);

router.get('/stats', 
  auth, 
  checkPermission('VIEW_LOGS'), 
  LogController.getRouteStats
);

module.exports = router;
