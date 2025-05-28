const planService = require('./planService');

async function getAllPlans(req, res, next) {
  try {
    const result = await planService.getAllPlans(req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getPlanById(req, res, next) {
  try {
    const result = await planService.getPlanById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function createPlan(req, res, next) {
  try {
    const result = await planService.createPlan(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function updatePlan(req, res, next) {
  try {
    const result = await planService.updatePlan(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function deletePlan(req, res, next) {
  try {
    const result = await planService.deletePlan(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
