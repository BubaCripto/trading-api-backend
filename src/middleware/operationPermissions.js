const Operation = require('../models/Operation');
const Community = require('../models/Community');

// Apenas TRADER pode criar
const canCreateOperation = (req, res, next) => {
  if (req.user.role !== 'TRADER') {
    return res.status(403).json({ message: 'Apenas traders podem criar operações' });
  }
  next();
};

// Permissão de visualização de operação
const canViewOperation = async (req, res, next) => {
  const { id } = req.params;
  const operation = await Operation.findById(id);
  if (!operation) return res.status(404).json({ message: 'Operação não encontrada' });

  if (req.user.role === 'ADMIN' || operation.userId.equals(req.user._id)) {
    req.operation = operation;
    return next();
  }

  if (req.user.role === 'COMMUNITY') {
    const community = await Community.findById(req.user._id);
    const isHired = community?.hiredTraders?.some(tid => tid.equals(operation.userId));
    if (isHired) {
      req.operation = operation;
      return next();
    }
  }

  return res.status(403).json({ message: 'Você não tem permissão para ver esta operação' });
};

// Somente dono (TRADER) pode editar/excluir/fechar manualmente
const canEditOperation = async (req, res, next) => {
  const { id } = req.params;
  const operation = await Operation.findById(id);
  if (!operation) return res.status(404).json({ message: 'Operação não encontrada' });

  if (!operation.userId.equals(req.user._id)) {
    return res.status(403).json({ message: 'Você não tem permissão para alterar esta operação' });
  }

  req.operation = operation;
  next();
};

module.exports = {
  canCreateOperation,
  canViewOperation,
  canEditOperation
};
