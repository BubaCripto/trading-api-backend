const Plan = require('../../models/Plan');
const { NotFoundError } = require('../../utils/errors');
const paginateQuery = require('../../utils/paginateQuery');

exports.getAllPlans = async (req) => {
  const result = await paginateQuery(Plan, req, {
    baseFilter: {}, // Opcional: { isActive: true }
    select: '-__v',
    defaultSort: '-createdAt',
  });

  return {
    success: true,
    ...result,
    message: 'Planos carregados com sucesso',
  };
};

exports.getPlanById = async (id) => {
  const plan = await Plan.findById(id);
  if (!plan) {
    throw new NotFoundError('Plano não encontrado');
  }

  return {
    success: true,
    data: plan,
  };
};

exports.createPlan = async (planData, user) => {
  const existingPlan = await Plan.findOne({ name: planData.name });
  if (existingPlan) {
    throw new Error('Já existe um plano com este nome');
  }

  const plan = await Plan.create({
    ...planData,
    createdBy: user._id,
  });

  return {
    success: true,
    data: plan,
    message: 'Plano criado com sucesso',
  };
};

exports.updatePlan = async (id, planData) => {
  const plan = await Plan.findById(id);
  if (!plan) {
    throw new NotFoundError('Plano não encontrado');
  }

  if (planData.name && planData.name !== plan.name) {
    const existingPlan = await Plan.findOne({ name: planData.name });
    if (existingPlan) {
      throw new Error('Já existe um plano com este nome');
    }
  }

  Object.assign(plan, planData);
  await plan.save();

  return {
    success: true,
    data: plan,
    message: 'Plano atualizado com sucesso',
  };
};

exports.deletePlan = async (id) => {
  const plan = await Plan.findById(id);
  if (!plan) {
    throw new NotFoundError('Plano não encontrado');
  }

  await plan.deleteOne();

  return {
    success: true,
    data: plan,
    message: 'Plano removido com sucesso',
  };
};
