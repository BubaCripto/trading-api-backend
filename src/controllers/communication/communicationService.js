const Communication = require('../../models/Communication');
const Community = require('../../models/Community');
const Plan = require('../../models/Plan');
const paginateQuery = require('../../utils/paginateQuery');

function isAdminUser(user) {
  return user.roles?.some(r => r.name === 'ADMIN' || r === 'ADMIN');
}

// 🔥 Validação centralizada de limite de conexões
async function checkMaxCommunications(communityId) {
  const community = await Community.findById(communityId).populate('plan');

  if (!community) {
    throw { status: 404, message: 'Comunidade não encontrada' };
  }

  if (!community.plan) {
    throw { status: 400, message: 'A comunidade não possui um plano ativo' };
  }

  const count = await Communication.countDocuments({
    communityId,
    active: true
  });

  const maxAllowed = community.plan.maxCommunications;

  if (count >= maxAllowed) {
    throw {
      status: 403,
      message: `Este plano (${community.plan.name}) permite no máximo ${maxAllowed} canais ativos.`
    };
  }

  return community;
}

// 🔥 Validação para downgrade
async function checkBeforeDowngrade(communityId, newPlanId) {
  const community = await Community.findById(communityId);
  const newPlan = await Plan.findById(newPlanId);

  if (!community) {
    throw { status: 404, message: 'Comunidade não encontrada' };
  }

  if (!newPlan) {
    throw { status: 404, message: 'Plano não encontrado' };
  }

  const activeCount = await Communication.countDocuments({
    communityId,
    active: true
  });

  if (activeCount > newPlan.maxCommunications) {
    throw {
      status: 403,
      message: `Este plano (${newPlan.name}) permite no máximo ${newPlan.maxCommunications} conexões ativas. Sua comunidade possui atualmente ${activeCount} comunicações ativas. Desative ou exclua comunicações para prosseguir com o downgrade.`
    };
  }

  return newPlan;
}

// ✅ Criar comunicação
async function createCommunication(data, user) {
  const community = await checkMaxCommunications(data.communityId);

  const isOwner = community.createdBy.toString() === user._id.toString();
  const isAdmin = isAdminUser(user);

  if (!isOwner && !isAdmin) {
    throw {
      status: 403,
      message: 'Você não tem permissão para criar comunicações nesta comunidade'
    };
  }

  const communication = await Communication.create({
    ...data,
    createdBy: user._id
  });

  return communication;
}

// ✅ Listar comunicações
async function getCommunications(req, user) {
  const baseFilter = {};

  if (req.query.communityId) {
    baseFilter.communityId = req.query.communityId;
  }

  if (!isAdminUser(user)) {
    if (req.query.communityId) {
      const community = await Community.findById(req.query.communityId);
      const isOwner = community?.createdBy.toString() === user._id.toString();

      if (!isOwner) {
        throw {
          status: 403,
          message: 'Você não tem permissão para ver as comunicações desta comunidade'
        };
      }
    } else {
      baseFilter.createdBy = user._id;
    }
  }

  return await paginateQuery(Communication, req, {
    baseFilter,
    populate: [
      {
        path: 'communityId',
        select: 'name description'
      },
      {
        path: 'createdBy',
        select: 'username email -_id'
      }
    ],
    select: '-__v',
    defaultSort: '-createdAt'
  });
}

// ✅ Ativar/Desativar comunicação
async function toggleCommunication(id, user) {
  const communication = await Communication.findById(id).populate({
    path: 'communityId',
    populate: { path: 'plan' }
  });

  if (!communication) {
    throw { status: 404, message: 'Comunicação não encontrada' };
  }

  const isOwner = communication.communityId.createdBy.toString() === user._id.toString();
  const isAdmin = isAdminUser(user);

  if (!isOwner && !isAdmin) {
    throw {
      status: 403,
      message: 'Você não tem permissão para alterar essa comunicação'
    };
  }

  // 🔥 Verificar limite apenas ao ativar
  if (!communication.active) {
    const count = await Communication.countDocuments({
      communityId: communication.communityId._id,
      active: true
    });

    const maxAllowed = communication.communityId.plan?.maxCommunications || 0;

    if (count >= maxAllowed) {
      throw {
        status: 403,
        message: `Este plano (${communication.communityId.plan.name}) permite no máximo ${maxAllowed} canais ativos.`
      };
    }
  }

  communication.active = !communication.active;
  await communication.save();

  return communication;
}

// ✅ Deletar comunicação
async function deleteCommunication(id, user) {
  const communication = await Communication.findById(id).populate('communityId');

  if (!communication) {
    throw { status: 404, message: 'Comunicação não encontrada' };
  }

  const isOwner = communication.communityId.createdBy.toString() === user._id.toString();
  const isAdmin = isAdminUser(user);

  if (!isOwner && !isAdmin) {
    throw {
      status: 403,
      message: 'Você não tem permissão para excluir essa comunicação'
    };
  }

  await communication.deleteOne();

  return { success: true, message: 'Comunicação removida com sucesso' };
}

// ✅ Alterar plano com validação de downgrade
async function changeCommunityPlan(communityId, newPlanId, user) {
  const community = await Community.findById(communityId);

  if (!community) {
    throw { status: 404, message: 'Comunidade não encontrada' };
  }

  const isOwner = community.createdBy.toString() === user._id.toString();
  const isAdmin = isAdminUser(user);

  if (!isOwner && !isAdmin) {
    throw {
      status: 403,
      message: 'Você não tem permissão para alterar o plano desta comunidade'
    };
  }

  const newPlan = await checkBeforeDowngrade(communityId, newPlanId);

  community.plan = newPlan._id;
  await community.save();

  return community;
}

module.exports = {
  createCommunication,
  getCommunications,
  toggleCommunication,
  deleteCommunication,
  changeCommunityPlan
};
