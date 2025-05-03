// src/controllers/logController.js
const RouteLog = require('../../models/RouteLog');

class LogController {
  static async getLogs(req, res) {
    try {
      const {
        startDate,
        endDate,
        route,
        method,
        statusCode,
        userId,
        page = 1,
        limit = 50
      } = req.query;

      const query = {};

      // Filtros
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
      if (route) query.route = new RegExp(route, 'i');
      if (method) query.method = method.toUpperCase();
      if (statusCode) query.statusCode = parseInt(statusCode);
      if (userId) query.userId = userId;

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        RouteLog.find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('userId', 'name email'),
        RouteLog.countDocuments(query)
      ]);

      res.json({
        logs,
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar logs' });
    }
  }

  static async getRouteStats(req, res) {
    try {
      const stats = await RouteLog.aggregate([
        {
          $group: {
            _id: {
              route: '$route',
              method: '$method'
            },
            count: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            errors: {
              $sum: {
                $cond: [{ $gte: ['$statusCode', 400] }, 1, 0]
              }
            },
            success: {
              $sum: {
                $cond: [{ $lt: ['$statusCode', 400] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}

module.exports = LogController;