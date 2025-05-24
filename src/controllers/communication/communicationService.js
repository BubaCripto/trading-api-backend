const Communication = require('../../models/Communication');
const Community = require('../../models/Community');
const paginateQuery = require('../../utils/paginateQuery');

function isAdminUser(user) {
  return user.roles?.some(r => r.name === 'ADMIN' || r === 'ADMIN');
}

async function createCommunication(data, user) {
  const community = await Community.findById(data.communityId).populate('plan');

  if (!community) {
    throw { status: 404, message: 'Comunidade não encontrada' };
  }

  if (!community.plan) {
    throw { status: 400, message: 'A comunidade não possui um plano ativo' };
  }

  const isOwner = community.createdBy.toString() === user._id.toString();
  const isAdmin = isAdminUser(user);

  if (!isOwner && !isAdmin) {
    throw { status: 403, message: 'Você não tem permissão para criar comunicações nesta comunidade' };
  }

  const count = await Communication.countDocuments({
    communityId: community._id,
    active: true
  });

  const maxAllowed = community.plan.maxCommunications;

  if (count >= maxAllowed) {
    throw {
      status: 403,
      message: `Este plano (${community.plan.name}) permite no máximo ${maxAllowed} canais ativos.`
    };
  }

  const communication = await Communication.create({
    ...data,
    createdBy: user._id
  });

  return communication;
}

async function getCommunications(req, user) {
  const baseFilter = {};

  // Optional filter by communityId
  if (req.query.communityId) {
    baseFilter.communityId = req.query.communityId;
  }

  // If not admin, only show user's communications
  if (!isAdminUser(user)) {
    // If communityId is provided, check if user is owner of that community
    if (req.query.communityId) {
      const community = await Community.findById(req.query.communityId);
      const isOwner = community?.createdBy.toString() === user._id.toString();
      
      if (!isOwner) {
        throw { status: 403, message: 'Você não tem permissão para ver as comunicações desta comunidade' };
      }
    } else {
      // If no communityId, show only communications created by the user
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

async function toggleCommunication(id, user) {
  const communication = await Communication.findById(id).populate('communityId');

  if (!communication) {
    throw { status: 404, message: 'Comunicação não encontrada' };
  }

  const isOwner = communication.communityId.createdBy.toString() === user._id.toString();
  const isAdmin = isAdminUser(user);

  if (!isOwner && !isAdmin) {
    throw { status: 403, message: 'Você não tem permissão para alterar essa comunicação' };
  }

  communication.active = !communication.active;
  await communication.save();

  return communication;
}

async function deleteCommunication(id, user) {
  const communication = await Communication.findById(id).populate('communityId');

  if (!communication) {
    throw { status: 404, message: 'Comunicação não encontrada' };
  }

  const isOwner = communication.communityId.createdBy.toString() === user._id.toString();
  const isAdmin = isAdminUser(user);

  if (!isOwner && !isAdmin) {
    throw { status: 403, message: 'Você não tem permissão para excluir essa comunicação' };
  }

  await communication.deleteOne();

  return { success: true, message: 'Comunicação removida com sucesso' };
}

module.exports = {
  createCommunication,
  getCommunications,
  toggleCommunication,
  deleteCommunication
};
