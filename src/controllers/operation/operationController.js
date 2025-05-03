
const operationService = require('./operationService');
const paginateQuery = require('../../utils/paginateQuery');


/**
 * POST /api/operations
 */
exports.createOperation = async (req, res) => {

  try {
    const operation = await operationService.createOperation(req.body, req.user);
    res.status(201).json(operation);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * GET /api/operations
 */
exports.getAllOperations = async (req, res) => {
  try {
    const operations = await operationService.getAllOperations(req.user);
    res.json(operations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * GET /api/operations/:id
 */
exports.getOperationById = async (req, res) => {
  try {
    const operation = await operationService.getOperationById(req.params.id);
    res.json(operation);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * PUT /api/operations/:id
 */
exports.updateOperation = async (req, res) => {
  try {
    const updated = await operationService.updateOperation(req.params.id, req.body, req.user);
    res.json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * PATCH /api/operations/:id/targets
 */
exports.updateTargets = async (req, res) => {
  try {
    const updated = await operationService.updateTargets(req.params.id, req.body.targets, req.user);
    res.json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * PATCH /api/operations/:id/request-manual-close
 */
exports.requestManualClose = async (req, res) => {
  try {
    const closed = await operationService.requestManualClose(req.params.id, req.user);
    res.json(closed);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * DELETE /api/operations/:id
 */
exports.deleteOperation = async (req, res) => {
  try {
    await operationService.deleteOperation(req.params.id, req.user);
    res.status(204).send();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * GET /api/operations/ranking
 */
exports.getRanking = async (req, res) => {
  try {
    const ranking = await operationService.getRanking();
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
