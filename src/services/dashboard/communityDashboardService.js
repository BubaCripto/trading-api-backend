const mongoose = require('mongoose');
const Community = require('../../models/Community');
const SignalDispatchLog = require('../../models/SignalDispatchLog');
const User = require('../../models/User');
const paginateQuery = require('../../utils/paginateQuery');
const Contract = require('../../models/Contract');
const Operation = require('../../models/Operation');

// Helper to convert string to ObjectId
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// Estatísticas gerais da comunidade
exports.getCommunityStats = async (communityId) => {
  const communityObjectId = toObjectId(communityId);

  // Buscar membros
  const community = await Community.findById(communityObjectId).select('members createdAt');
  const totalMembers = community?.members?.length || 0;

  // Buscar contratos ativos e fechados
  const contractedTradersCount = await Contract.countDocuments({
    community: communityObjectId,
    status: 'ACCEPTED'
  });
  const formerTradersCount = await Contract.countDocuments({
    community: communityObjectId,
    status: 'CLOSED'
  });

  // Buscar sinais e performance via join com Operation
  const signalStats = await SignalDispatchLog.aggregate([
    { $match: { communityId: communityObjectId } },
    {
      $lookup: {
        from: 'operations',
        localField: 'operationId',
        foreignField: '_id',
        as: 'operation'
      }
    },
    { $unwind: { path: '$operation', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: '$communityId',
        totalSignalsReceived: { $sum: 1 },
        activeSignals: { $sum: { $cond: [
          { $and: [
            { $eq: ['$operation.history.isOpen', true] },
            { $eq: ['$operation.history.isClosed', false] },
            { $eq: ['$operation.history.isCancelled', false] }
          ] }, 1, 0] } },
        closedSignals: { $sum: { $cond: [{ $eq: ['$operation.history.isClosed', true] }, 1, 0] } },
        cancelledSignals: { $sum: { $cond: [{ $eq: ['$operation.history.isCancelled', true] }, 1, 0] } },
        stopSignals: { $sum: { $cond: [{ $eq: ['$operation.history.isStop', true] }, 1, 0] } },
        successfulSignals: { $sum: { $cond: [{ $gt: ['$operation.history.pnlAmount', 0] }, 1, 0] } },
        totalPnl: { $sum: '$operation.history.pnlAmount' },
        averageSignalDuration: {
          $avg: {
            $cond: [
              { $and: ['$operation.history.entryDate', '$operation.history.exitDate'] },
              { $divide: [{ $subtract: ['$operation.history.exitDate', '$operation.history.entryDate'] }, 1000 * 60 * 60 * 24] },
              null
            ]
          }
        }
      }
    }
  ]);

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
    totalMembers,
    updatedAt: community?.updatedAt || new Date()
  };
};

// Listar sinais da comunidade com detalhes reais da operação
exports.getCommunitySignals = async (communityId, req) => {
  const communityObjectId = toObjectId(communityId);
  const baseFilter = { communityId: communityObjectId };

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
  ];

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

// Performance diária real da comunidade
exports.getCommunityPerformance = async (communityId) => {
  const communityObjectId = toObjectId(communityId);

  const performance = await SignalDispatchLog.aggregate([
    { $match: { communityId: communityObjectId } },
    {
      $lookup: {
        from: 'operations',
        localField: 'operationId',
        foreignField: '_id',
        as: 'operation'
      }
    },
    { $unwind: '$operation' },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$operation.history.exitDate' } },
        totalPnl: { $sum: '$operation.history.pnlAmount' },
        dailyPnl: { $sum: '$operation.history.pnlAmount' },
        signalsCount: { $sum: 1 },
        successfulSignals: { $sum: { $cond: [{ $gt: ['$operation.history.pnlAmount', 0] }, 1, 0] } },
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

// Listar traders contratados pela comunidade de forma real
exports.getCommunityTraders = async (communityId) => {
  const communityObjectId = toObjectId(communityId);

  // Buscar contratos ativos e fechados
  const contracts = await Contract.find({
    community: communityObjectId,
    status: { $in: ['ACCEPTED', 'CLOSED'] }
  }).populate('trader');

  // Montar resposta com dados reais do trader e status do contrato
  return contracts.map(contract => ({
    contractId: contract._id,
    communityId: contract.community,
    traderId: contract.trader?._id,
    traderName: contract.trader?.username,
    contractStatus: contract.status,
    contractStartDate: contract.createdAt,
    contractEndDate: contract.status === 'CLOSED' ? contract.updatedAt : null
  }));
};
