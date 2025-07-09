const communityDashboardService = require('../../services/dashboard/communityDashboardService');

exports.getCommunityStats = async (req, res, next) => {
  try {
    const stats = await communityDashboardService.getCommunityStats(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

exports.getCommunitySignals = async (req, res, next) => {
  try {
    const signals = await communityDashboardService.getCommunitySignals(req.params.id, req);
    res.status(200).json(signals);
  } catch (error) {
    next(error);
  }
};

exports.getCommunityPerformance = async (req, res, next) => {
  try {
    const performance = await communityDashboardService.getCommunityPerformance(req.params.id);
    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    next(error);
  }
};

exports.getCommunityTraders = async (req, res, next) => {
  try {
    const traders = await communityDashboardService.getCommunityTraders(req.params.id);
    res.status(200).json({ success: true, data: traders });
  } catch (error) {
    next(error);
  }
};