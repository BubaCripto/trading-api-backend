const mongoose = require('mongoose');
const Community = require('../../models/Community');
const SignalDispatchLog = require('../../models/SignalDispatchLog');
const User = require('../../models/User');
const paginateQuery = require('../../utils/paginateQuery');
const Contract = require('../../models/Contract');

// Helper to convert string to ObjectId
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

exports.getCommunityStats = async (communityId) => {
  const communityObjectId = toObjectId(communityId);

  // Estatísticas de sinais
  const signalStats = await SignalDispatchLog.aggregate([
    { $match: { communityId: communityObjectId } },
    {
      $group: {
        _id: '$communityId',
        totalSignalsReceived: { $sum: 1 },
        activeSignals: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        closedSignals: { $sum: { $cond: [{ $eq: ['$status', 'CLOSED'] }, 1, 0] } },
        successfulSignals: { $sum: { $cond: [{ $eq: ['$result', 'PROFIT'] }, 1, 0] } },
        totalPnl: { $sum: '$pnlAmount' },
        averageSignalDuration: { $avg: '$durationDays' }
      }
    }
  ]);

  // Contar traders contratados (contratos ativos)
  const contractedTradersCount = await Contract.countDocuments({
    community: communityObjectId,
    status: 'ACCEPTED'
  });

  // Contar traders que já foram contratados (contratos fechados)
  const formerTradersCount = await Contract.countDocuments({
    community: communityObjectId,
    status: 'CLOSED'
  });

  // Contar membros totais e ativos
  const community = await Community.findById(communityObjectId).select('members activeMembers updatedAt');

  return {
    _id: communityId,
    communityId: communityId,
    totalSignalsReceived: signalStats[0]?.totalSignalsReceived || 0,
    activeSignals: signalStats[0]?.activeSignals || 0,
    closedSignals: signalStats[0]?.closedSignals || 0,
    successfulSignals: signalStats[0]?.successfulSignals || 0,
    successRate: signalStats[0] && signalStats[0].totalSignalsReceived > 0 ? (signalStats[0].successfulSignals / signalStats[0].totalSignalsReceived) * 100 : 0,
    totalPnl: signalStats[0]?.totalPnl || 0,
    averageSignalDuration: signalStats[0]?.averageSignalDuration || 0,
    contractedTraders: contractedTradersCount,
    formerTraders: formerTradersCount,
    totalMembers: community?.members?.length || 0,
    activeMembers: community?.activeMembers || 0,
    updatedAt: community?.updatedAt || new Date()
  };
};

exports.getCommunitySignals = async (communityId, req) => {
  const communityObjectId = toObjectId(communityId);

  const baseFilter = { communityId: communityObjectId };

  // Usar agregação para juntar SignalDispatchLog com Operation
  const aggregatePipeline = [
    { $match: baseFilter },
    {
      $lookup: {
        from: 'operations',
        localField: 'operationId',
        foreignField: '_id',
        as: 'operationDetails'
      }
    },
    { $unwind: { path: '$operationDetails', preserveNullAndEmptyArrays: true } },
    { $sort: { sentAt: -1 } },
    // Aqui pode-se adicionar paginação manual se necessário
  ];

  // Para paginação, pode-se usar skip e limit baseados em req.query.page e req.query.limit
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await SignalDispatchLog.countDocuments(baseFilter);
  const data = await SignalDispatchLog.aggregate(aggregatePipeline).skip(skip).limit(limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

exports.getCommunityPerformance = async (communityId) => {
  const communityObjectId = toObjectId(communityId);

  // Aggregate daily performance
  const performance = await SignalDispatchLog.aggregate([
    { $match: { communityId: communityObjectId } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$sentAt' } },
        totalPnl: { $sum: '$pnlAmount' },
        dailyPnl: { $sum: '$pnlAmount' },
        signalsCount: { $sum: 1 },
        successfulSignals: { $sum: { $cond: [{ $eq: ['$result', 'PROFIT'] }, 1, 0] } },
      }
    },
    {
      $project: {
        date: '$_id',
        totalPnl: 1,
        dailyPnl: 1,
        signalsCount: 1,
        successfulSignals: 1,
        successRate: { $cond: [{ $eq: ['$signalsCount', 0] }, 0, { $multiply: [{ $divide: ['$successfulSignals', '$signalsCount'] }, 100] }] }
      }
    },
    { $sort: { date: 1 } }
  ]);

  return performance;
};

exports.getCommunityTraders = async (communityId) => {
  const communityObjectId = toObjectId(communityId);

  // Aggregate traders contracted by community
  const traders = await Community.aggregate([
    { $match: { _id: communityObjectId } },
    { $unwind: '$contractedTraders' },
    {
      $lookup: {
        from: 'users',
        localField: 'contractedTraders.traderId',
        foreignField: '_id',
        as: 'traderInfo'
      }
    },
    { $unwind: '$traderInfo' },
    {
      $project: {
        _id: '$contractedTraders._id',
        communityId: '$_id',
        traderId: '$contractedTraders.traderId',
        traderName: '$traderInfo.name',
        contractStatus: '$contractedTraders.status',
        totalSignalsSent: '$contractedTraders.totalSignalsSent',
        successfulSignals: '$contractedTraders.successfulSignals',
        successRate: { $cond: [{ $eq: ['$contractedTraders.totalSignalsSent', 0] }, 0, { $multiply: [{ $divide: ['$contractedTraders.successfulSignals', '$contractedTraders.totalSignalsSent'] }, 100] }] },
        totalPnl: '$contractedTraders.totalPnl',
        contractStartDate: '$contractedTraders.contractStartDate',
        contractEndDate: '$contractedTraders.contractEndDate'
      }
    }
  ]);

  return traders;
};