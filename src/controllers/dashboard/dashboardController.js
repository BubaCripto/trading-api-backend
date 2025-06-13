const dashboardService = require('./dashboardService');

/**
 * GET /api/admin/dashboard
 * Retorna estatísticas para o dashboard administrativo
 */
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const dashboardStats = await dashboardService.getAdminDashboardStats();
    res.status(200).json(dashboardStats);
  } catch (error) {
    next(error);
  }
};