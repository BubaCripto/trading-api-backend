const Plan = require('../../models/Plan');
const { NotFoundError } = require('../../utils/errors');
const paginateQuery = require('../../utils/paginateQuery');

exports.getAllPlans = async (req) => {
    return await paginateQuery(Plan, req, {
      baseFilter: {}, // Se quiser filtrar só ativos, usa { isActive: true }
      select: '-__v',
      defaultSort: '-createdAt'
    });
  };

exports.getPlanById = async (id) => {
  const plan = await Plan.findById(id);
  if (!plan) {
    throw new NotFoundError('Plano não encontrado');
  }
  return plan;
};

exports.createPlan = async (planData, user) => {
  // Verificar se já existe um plano com o mesmo nome
  const existingPlan = await Plan.findOne({ name: planData.name });
  if (existingPlan) {
    throw new Error('Já existe um plano com este nome');
  }
  
  const plan = new Plan(planData);
  await plan.save();
  return plan;
};

exports.updatePlan = async (id, planData) => {
  const plan = await Plan.findById(id);
  if (!plan) {
    throw new NotFoundError('Plano não encontrado');
  }
  
  // Se estiver tentando mudar o nome, verificar se já existe outro plano com este nome
  if (planData.name && planData.name !== plan.name) {
    const existingPlan = await Plan.findOne({ name: planData.name });
    if (existingPlan) {
      throw new Error('Já existe um plano com este nome');
    }
  }
  
  Object.assign(plan, planData);
  await plan.save();
  return plan;
};

exports.deletePlan = async (id) => {
  const plan = await Plan.findById(id);
  if (!plan) {
    throw new NotFoundError('Plano não encontrado');
  }
  
  // Verificar se o plano está em uso (implementar lógica específica se necessário)
  
  await Plan.findByIdAndDelete(id);
  return { message: 'Plano removido com sucesso' };
};