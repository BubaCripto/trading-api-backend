const rankingService = require('../../services/rankingService');

const rankingController = {
  async getTraderRanking(req, res) {
    try {
      const { period = 'all' } = req.query;
      const validPeriods = ['all', 'day', 'week', 'month'];

      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          message: 'Período inválido. Use: all, day, week ou month'
        });
      }

      const rankings = await rankingService.calculateTraderRanking(period);
      res.json(rankings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = rankingController;