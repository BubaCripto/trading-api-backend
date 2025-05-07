
const Operation = require('../../models/Operation');
const { ForbiddenError, NotFoundError } = require('../../utils/errors');

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
  const [stats] = await Operation.aggregate([
    {
      $match: {
        userId: userId,
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
                  { $multiply: [{ $divide: ["$positiveTrades", "$totalTrades"] }, 100] },
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
          {
            $group: {
              _id: "$pair",
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],
        porSinal: [
          {
            $group: {
              _id: "$signal",
              count: { $sum: 1 }
            }
          }
        ],
        porEstrategia: [
          {
            $group: {
              _id: "$strategy",
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);

  return {
    ...stats.geral[0],
    porPar: stats.porPar,
    porSinal: stats.porSinal,
    porEstrategia: stats.porEstrategia
  };
};


