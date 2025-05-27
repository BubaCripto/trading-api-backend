const planService = require('./planService');

exports.getAllPlans = async (req, res) => {
    try {
      const result = await planService.getAllPlans(req);
      res.json({
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno', error: error.message });
    }
  };
  

exports.getPlanById = async (req, res, next) => {
  try {
    const plan = await planService.getPlanById(req.params.id);
    res.status(200).json({
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

exports.createPlan = async (req, res, next) => {
  try {
    const plan = await planService.createPlan(req.body, req.user);
    res.status(201).json({
      message: 'Plano criado com sucesso',
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await planService.updatePlan(req.params.id, req.body);
    res.status(200).json({
      message: 'Plano atualizado com sucesso',
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const result = await planService.deletePlan(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};