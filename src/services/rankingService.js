const Operation = require('../models/Operation');

const rankingService = {
  async calculateTraderRanking(period = 'all') {
    try {
      const matchStage = {
        'history.isClosed': true,
        'history.pnlPercentage': { $exists: true }
      };

      // Adiciona filtro por período se especificado
      if (period !== 'all') {
        const dateFilter = {};
        const now = new Date();
        switch (period) {
          case 'day':
            dateFilter.$gte = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            dateFilter.$gte = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            dateFilter.$gte = new Date(now.setMonth(now.getMonth() - 1));
            break;
        }
        if (Object.keys(dateFilter).length > 0) {
          matchStage['history.exitDate'] = dateFilter;
        }
      }

      const rankings = await Operation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$userId',
            username: { $first: '$username' },
            totalOperations: { $sum: 1 },
            winningOperations: {
              $sum: { $cond: [{ $gt: ['$history.pnlPercentage', 0] }, 1, 0] }
            },
            totalPnlPercentage: { $sum: '$history.pnlPercentage' },
            totalPnlAmount: { $sum: '$history.pnlAmount' },
            avgRiskReward: { $avg: '$history.riskRewardRatio' }
          }
        },
        {
          $project: {
            username: 1,
            totalOperations: 1,
            winningOperations: 1,
            winRate: {
              $multiply: [{ $divide: ['$winningOperations', '$totalOperations'] }, 100]
            },
            avgPnlPercentage: { $divide: ['$totalPnlPercentage', '$totalOperations'] },
            totalPnlAmount: 1,
            avgRiskReward: 1
          }
        },
        { $sort: { totalPnlAmount: -1 } }
      ]);

      return rankings;
    } catch (error) {
      throw new Error(`Erro ao calcular ranking: ${error.message}`);
    }
  }
};

module.exports = rankingService;