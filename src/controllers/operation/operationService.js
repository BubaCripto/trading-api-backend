const mongoose = require('mongoose');
const Operation = require('../../models/Operation');
const Contract = require('../../models/Contract');
const { ForbiddenError, NotFoundError } = require('../../utils/errors');
const Feedback = require('../../models/Feedback');


function hasRole(user, roleName) {
  return user.roles?.some(role => {
    if (typeof role === 'string') return role === roleName;
    if (typeof role === 'object' && role.name) return role.name === roleName;
    return false;
  });
}


/**
 * Cria uma nova operação
 */
exports.createOperation = async (data, currentUser) => {
  if (!currentUser.roles?.some(role => typeof role === 'string' ? role === 'TRADER' : role.name === 'TRADER')) {
    throw new ForbiddenError('Somente traders podem criar operações.');
  }

  const operation = new Operation({
    ...data,
    userId: currentUser._id,
    username: currentUser.username
  });

  return await operation.save();
};

/**
 * Lista todas as operações (com filtros futuros opcionais)
 */
exports.getAllOperations = async (currentUser) => {
  const isAdmin = hasRole(currentUser, 'ADMIN');
  const filter = isAdmin ? {} : { userId: currentUser._id };

  return await Operation.find(filter).sort({ createdAt: -1 });
};



/**
 * Retorna operação por ID
 */
exports.getOperationById = async (id) => {
  const operation = await Operation.findById(id);
  if (!operation) throw new NotFoundError('Operação não encontrada');
  return operation;
};

/**
 * Atualiza operação (somente trader dono ou admin)
 */
exports.updateOperation = async (id, data, currentUser) => {
  const operation = await Operation.findById(id);
  if (!operation) throw new NotFoundError('Operação não encontrada');

  const isOwner = operation.userId.toString() === currentUser._id.toString();
  const isAdmin = currentUser.roles?.some(role => typeof role === 'string' ? role === 'ADMIN' : role.name === 'ADMIN');
  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Você não tem permissão para editar esta operação.');
  }

  Object.assign(operation, data);
  return await operation.save();
};

/**
 * Atualiza somente os targets da operação
 */
exports.updateTargets = async (id, newTargets, currentUser) => {
  const operation = await Operation.findById(id);
  if (!operation) throw new NotFoundError('Operação não encontrada');

  const isOwner = operation.userId.toString() === currentUser._id.toString();
  const isAdmin = currentUser.roles?.some(role => typeof role === 'string' ? role === 'ADMIN' : role.name === 'ADMIN');
  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Você não tem permissão para editar os targets.');
  }

  operation.targets = newTargets;
  return await operation.save();
};

/**
 * Solicita fechamento manual
 */
exports.requestManualClose = async (id, currentUser) => {
  const operation = await Operation.findById(id);
  if (!operation) throw new NotFoundError('Operação não encontrada');

  const isOwner = operation.userId.toString() === currentUser._id.toString();
  const isAdmin = currentUser.roles?.some(role => typeof role === 'string' ? role === 'ADMIN' : role.name === 'ADMIN');
  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Você não tem permissão para solicitar o fechamento.');
  }

  operation.history.isManualCloseRequested = true;
  operation.manualCloseAt = new Date();
  return await operation.save();
};

/**
 * Deleta operação
 */
exports.deleteOperation = async (id, currentUser) => {
  const operation = await Operation.findById(id);
  if (!operation) throw new NotFoundError('Operação não encontrada');

  const isOwner = operation.userId.toString() === currentUser._id.toString();
  const isAdmin = currentUser.roles?.some(role => typeof role === 'string' ? role === 'ADMIN' : role.name === 'ADMIN');
  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Você não tem permissão para deletar esta operação.');
  }

  return await Operation.findByIdAndDelete(id);
};

/**
 * Ranking de performance (simples por enquanto)
 */
exports.getRanking = async () => {
  const ranking = await Operation.aggregate([
    { $match: { pnl: { $ne: null } } },
    {
      $group: {
        _id: '$userId',
        username: { $first: '$username' },
        totalPnL: { $sum: '$pnl' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalPnL: -1 } }
  ]);

  return ranking;
};

exports.getTraderRankingWithKpis = async () => {
  const result = await Operation.aggregate([
    {
      $match: {
        "history.isClosed": true,
        "history.pnlAmount": { $ne: null }
      }
    },
    {
      $group: {
        _id: "$userId",
        username: { $first: "$username" },

        totalPnL: { $sum: "$history.pnlAmount" },
        avgPnL: { $avg: "$history.pnlAmount" },
        maxPnL: { $max: "$history.pnlAmount" },
        minPnL: { $min: "$history.pnlAmount" },

        totalTrades: { $sum: 1 },
        positiveTrades: {
          $sum: { $cond: [{ $gt: ["$history.pnlAmount", 0] }, 1, 0] }
        },
        winRate: {
          $avg: { $cond: [{ $gt: ["$history.pnlAmount", 0] }, 1, 0] }
        },
        avgRiskReward: { $avg: "$history.riskRewardRatio" },
        lastTradeDate: { $max: "$history.exitDate" }
      }
    },
    {
      $project: {
        userId: "$_id",
        username: 1,
        totalPnL: 1,
        avgPnL: 1,
        maxPnL: 1,
        minPnL: 1,
        totalTrades: 1,
        winRate: { $round: [{ $multiply: ["$winRate", 100] }, 2] },
        avgRiskReward: 1,
        lastTradeDate: 1
      }
    },
    { $sort: { totalPnL: -1 } }
  ]);

  return result;
};

exports.getTraderStats = async (userId) => {
  let objectId;
  try {
    objectId = new mongoose.Types.ObjectId(userId);
  } catch (err) {
    throw new Error("ID de usuário inválido.");
  }

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90);

  // contratos finalizados
  const contractsEnded = await Contract.countDocuments({
    traderId: objectId,
    status: 'ENDED'
  });

  // comunidades únicas que contrataram
  const communitiesAgg = await Contract.aggregate([
    { $match: { traderId: objectId, status: { $in: ['ACCEPTED', 'ENDED'] } } },
    { $group: { _id: "$communityId" } },
    { $count: "communitiesCount" }
  ]);
  const communitiesCount = communitiesAgg[0]?.communitiesCount || 0;

  // operações nos últimos 90 dias
  const recentOps = await Operation.find({
    userId: objectId,
    createdAt: { $gte: ninetyDaysAgo }
  });

  const avgOpsPerWeek = Number((recentOps.length / (90 / 7)).toFixed(1));

  // dias consecutivos
  const uniqueDates = [...new Set(recentOps.map(op => op.createdAt.toISOString().split("T")[0]))].sort();
  let maxStreak = 0;
  let currentStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  const [stats] = await Operation.aggregate([
    {
      $match: {
        userId: objectId,
        "history.isClosed": true,
        "history.pnlAmount": { $ne: null }
      }
    },
    {
      $facet: {
        geral: [
          {
            $group: {
              _id: null,
              totalPnL: { $sum: "$history.pnlAmount" },
              avgPnL: { $avg: "$history.pnlAmount" },
              maxPnL: { $max: "$history.pnlAmount" },
              minPnL: { $min: "$history.pnlAmount" },
              totalTrades: { $sum: 1 },
              positiveTrades: {
                $sum: { $cond: [{ $gt: ["$history.pnlAmount", 0] }, 1, 0] }
              },
              avgRiskReward: { $avg: "$history.riskRewardRatio" },
              volumeOperadoTotal: {
                $sum: { $multiply: ["$entry", "$leverage"] }
              },
              mediaAlavancagem: { $avg: "$leverage" },
              avgDurationMinutos: {
                $avg: {
                  $divide: [
                    { $subtract: ["$history.exitDate", "$history.entryDate"] },
                    1000 * 60
                  ]
                }
              },
              lastTradeDate: { $max: "$history.exitDate" }
            }
          },
          {
            $project: {
              _id: 0,
              totalPnL: 1,
              avgPnL: 1,
              maxPnL: 1,
              minPnL: 1,
              totalTrades: 1,
              positiveTrades: 1,
              winRate: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$positiveTrades", "$totalTrades"] },
                      100
                    ]
                  },
                  2
                ]
              },
              avgRiskReward: 1,
              volumeOperadoTotal: 1,
              mediaAlavancagem: 1,
              avgDurationMinutos: 1,
              lastTradeDate: 1
            }
          }
        ],
        porPar: [
          { $group: { _id: "$pair", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        porSinal: [
          { $group: { _id: "$signal", count: { $sum: 1 } } }
        ],
        porEstrategia: [
          { $group: { _id: "$strategy", count: { $sum: 1 } } }
        ],
        ultimasOperacoes: [
          {
            $match: {
              userId: objectId,
              "history.exitDate": { $gte: ninetyDaysAgo },
              "history.isClosed": true,
              "history.pnlAmount": { $ne: null }
            }
          },
          {
            $project: {
              _id: 0,
              createdAt: 1,
              pair: 1,
              signal: 1,
              pnl: "$history.pnlAmount"
            }
          },
          { $sort: { createdAt: -1 } }
        ]
      }
    }
  ]);

  const geral = stats?.geral?.[0] || {};
  const minutos = Math.round(geral.avgDurationMinutos || 0);
  const avgDurationFormatted = `${Math.floor(minutos / 60)}h ${minutos % 60}m`;

  // Buscar feedbacks do trader
  const feedbacks = await Feedback.find({ 
    reviewedId: objectId,
    reviewedType: 'TRADER'
  });

  // Calcular estatísticas de feedback
  const feedbackCount = feedbacks.length;
  
  // Inicializar objeto para somar as pontuações
  const scoreSum = {
    sinais_claros: 0,
    qtd_operacoes: 0,
    estrategias_explicadas: 0,
    resposta_duvidas: 0
  };
  
  // Somar todas as pontuações
  feedbacks.forEach(feedback => {
    if (feedback.scores) {
      scoreSum.sinais_claros += feedback.scores.sinais_claros || 0;
      scoreSum.qtd_operacoes += feedback.scores.qtd_operacoes || 0;
      scoreSum.estrategias_explicadas += feedback.scores.estrategias_explicadas || 0;
      scoreSum.resposta_duvidas += feedback.scores.resposta_duvidas || 0;
    }
  });
  
  // Calcular médias se houver feedbacks
  const feedbackScores = feedbackCount > 0 ? {
    sinais_claros: Number((scoreSum.sinais_claros / feedbackCount).toFixed(1)),
    qtd_operacoes: Number((scoreSum.qtd_operacoes / feedbackCount).toFixed(1)),
    estrategias_explicadas: Number((scoreSum.estrategias_explicadas / feedbackCount).toFixed(1)),
    resposta_duvidas: Number((scoreSum.resposta_duvidas / feedbackCount).toFixed(1))
  } : {
    sinais_claros: 0,
    qtd_operacoes: 0,
    estrategias_explicadas: 0,
    resposta_duvidas: 0
  };
  
  // Calcular média geral
  const feedbackAverage = feedbackCount > 0 ? 
    Number(((feedbackScores.sinais_claros + 
             feedbackScores.qtd_operacoes + 
             feedbackScores.estrategias_explicadas + 
             feedbackScores.resposta_duvidas) / 4).toFixed(1)) : 0;

  return {
    ...geral,
    porPar: stats?.porPar || [],
    porSinal: stats?.porSinal || [],
    porEstrategia: stats?.porEstrategia || [],
    ultimasOperacoes: stats?.ultimasOperacoes || [],
    contractsEnded,
    communitiesCount,
    avgOpsPerWeek,
    consecutiveDays: maxStreak || 1,
    avgDurationFormatted,
    // Adicionar estatísticas de feedback
    feedbackCount,
    feedbackScores,
    feedbackAverage
  };
};


/**
 * Lista todas as operações para webhook (sem verificação de usuário)
 */
exports.getOperationsForWebhook = async (filters = {}) => {
  // Aqui você pode aplicar filtros específicos para o webhook
  // Por exemplo, talvez queira limitar quais operações são expostas
  
  // Exemplo de filtro: apenas operações fechadas ou apenas dos últimos 30 dias
  const defaultFilters = {
    // Exemplo: 'status': 'Closed',
    // Exemplo: createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  };
  
  const combinedFilters = { ...defaultFilters, ...filters };
  
  // Buscar operações e popular os dados do usuário
  return await Operation.find(combinedFilters)
    .populate({
      path: 'userId',
      select: 'username',
    })
    .sort({ createdAt: -1 });
};








