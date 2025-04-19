// controllers/operationController.js
const operationService = require('./operationService');
const operationValidator = require('./validators/operationValidator');

const operationController = {
  async createOperation(req, res) {
    try {
      const validated = operationValidator.validateCreate(req.body);
      const operation = await operationService.create(validated, req.user);
      res.status(201).json(operation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getAllOperations(req, res) {
    try {
      const result = await operationService.getAll(req);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getOperationById(req, res) {
    try {
      const result = await operationService.getById(req.operation, req.user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateOperation(req, res) {
    try {
      const updated = await operationService.update(req.operation, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async deleteOperation(req, res) {
    try {
      await operationService.delete(req.operation);
      res.json({ message: 'Operação removida com sucesso' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateTargets(req, res) {
    try {
      const updated = await operationService.updateTargets(req.operation, req.body.targets);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async requestManualClose(req, res) {
    try {
      const updated = await operationService.requestManualClose(req.operation);
      res.json({ message: 'Fechamento manual solicitado', operation: updated });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao solicitar fechamento manual', error: error.message });
    }
  }
};

module.exports = operationController;