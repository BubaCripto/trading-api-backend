// services/operationService.js
const Operation = require('../../models/Operation');

const operationService = {
  async create(data, user) {
    const operation = new Operation({ ...data, userId: user._id, username: user.username });
    return await operation.save();
  },

  async getAll(req) {
    const { page = 1, limit = 10, status, pair, strategy, sort = '-date' } = req.query;
    const query = {};
    if (status) query.status = status;
    if (pair) query.pair = pair;
    if (strategy) query.strategy = strategy;

    const projection = req.user.role === 'COMMUNITY'
      ? { pair: 1, signal: 1, strategy: 1, entry: 1, targets: 1 }
      : {};

    const operations = await Operation.find(query, projection)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Operation.countDocuments(query);

    return {
      operations,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  },

  async getById(operation, user) {
    if (user.role === 'COMMUNITY') {
      const { pair, signal, strategy, entry, targets } = operation;
      return { pair, signal, strategy, entry, targets };
    }
    return operation;
  },

  async update(operation, body) {
    Object.assign(operation, body);
    return await operation.save();
  },

  async delete(operation) {
    return await operation.deleteOne();
  },

  async updateTargets(operation, targets) {
    operation.targets = targets;
    return await operation.save();
  },

  async requestManualClose(operation) {
    operation.history.isManualCloseRequested = true;
    return await operation.save();
  }
};

module.exports = operationService;