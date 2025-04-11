const Operation = require('../models/Operation');

const operationController = {
  // Create new operation
  async createOperation(req, res) {
  try {
    const {
      pair,
      signal,
      strategy,
      risk,
      leverage,
      entry,
      stop,
      targets
    } = req.body;

    // ⚠️ Validação de campos obrigatórios
    if (!pair || !signal || !leverage || entry === undefined || stop === undefined || !Array.isArray(targets)) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes ou inválidos.' });
    }

    // ⚠️ Tipos de dados
    if (typeof entry !== 'number' || typeof stop !== 'number' || typeof leverage !== 'number') {
      return res.status(400).json({ message: 'entry, stop e leverage devem ser números.' });
    }

    if (!Array.isArray(targets) || !targets.every(t => typeof t === 'number')) {
      return res.status(400).json({ message: 'targets deve ser um array de números.' });
    }

    // ⚠️ Lógica de validação para sinais LONG/SHORT
    if (signal === 'LONG' && entry < stop) {
      return res.status(400).json({
        message: 'Para operações LONG, entry deve ser maior que stop.'
      });
    }

    if (signal === 'SHORT' && entry > stop) {
      return res.status(400).json({
        message: 'Para operações SHORT, entry deve ser menor que stop.'
      });
    }

    const operation = new Operation({
      pair,
      signal,
      strategy,
      risk,
      leverage,
      entry,
      stop,
      targets,
      userId: req.user._id,
      username: req.user.username
    });

    await operation.save();
    res.status(201).json(operation);
  } catch (error) {
    console.error('🔴 Error creating operation:', error);
    res.status(400).json({ message: error.message });
  }
}
,

  // Get all operations with filters and pagination
  async getAllOperations(req, res) {
    try {
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

      res.json({
        operations,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getOperationById(req, res) {
    try {
      const operation = req.operation;

      if (req.user.role === 'COMMUNITY') {
        const { pair, signal, strategy, entry, targets } = operation;
        return res.json({ pair, signal, strategy, entry, targets });
      }

      res.json(operation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateOperation(req, res) {
    try {
      const operation = req.operation;
      Object.assign(operation, req.body);
      await operation.save();
      res.json(operation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async deleteOperation(req, res) {
    try {
      const operation = req.operation;
      await operation.deleteOne();
      res.json({ message: 'Operation deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateTargets(req, res) {
    try {
      const operation = req.operation;
      operation.targets = req.body.targets;
      await operation.save();
      res.json(operation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async requestManualClose(req, res) {
    try {
      const operation = req.operation;
      operation.history.isManualCloseRequested = true;
      await operation.save();
      res.json({ message: 'Manual close requested', operation });
    } catch (error) {
      res.status(500).json({ message: 'Error requesting manual close', error: error.message });
    }
  }
};

module.exports = operationController;
