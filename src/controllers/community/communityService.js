const Community = require('../../models/Community');
const Plan = require('../../models/Plan');
const Communication = require('../../models/Communication'); // Adicionar importação
const paginateQuery = require('../../utils/paginateQuery');
const { ForbiddenError, NotFoundError } = require('../../utils/errors');

function hasAdminRole(user) {
  return user.roles?.some(role => {
    if (typeof role === 'string') return role === 'ADMIN';
    if (typeof role === 'object' && role.name) return role.name === 'ADMIN';
    return false;
  });
}

exports.createCommunity = async (data, currentUser) => {
  const community = new Community({
    ...data,
    userId: currentUser._id,
    createdBy: currentUser._id,
  });
  return await community.save();
};

exports.getAll = async (req) => {
  return await paginateQuery(Community, req, {
    baseFilter: { active: true },
    select: '-__v',
    populate: [
      {
        path: 'createdBy',
        select: '-password -__v',
        populate: {
          path: 'roles',
          select: 'name description'
        }
      },
      {
        path: 'hiredTraders',
        select: '-password -__v'
      },
      'plan'
    ],
    defaultSort: '-createdAt'
  });
};

exports.getById = async (id) => {
  const community = await Community.findById(id);
  if (!community) {
    const error = new Error('Comunidade não encontrada');
    error.status = 404;
    throw error;
  }
  return community;
};

exports.updateCommunity = async (id, data, currentUser) => {
  const community = await Community.findById(id);
  if (!community) throw new NotFoundError('Comunidade não encontrada');

  const isOwner = community.userId.toString() === currentUser._id.toString();
  const isAdmin = hasAdminRole(currentUser);

  if (!isOwner && !isAdmin) throw new ForbiddenError('Permissão negada');

  Object.assign(community, data);
  return await community.save();
};

exports.deleteCommunity = async (id, currentUser) => {
  const community = await Community.findById(id);
  if (!community) throw new NotFoundError('Comunidade não encontrada');

  const isOwner = community.userId.toString() === currentUser._id.toString();
  const isAdmin = hasAdminRole(currentUser);

  if (!isOwner && !isAdmin) throw new ForbiddenError('Permissão negada');

  return await Community.findByIdAndDelete(id);
};

exports.hireTrader = async (id, traderId, currentUser) => {
  const community = await Community.findById(id);
  if (!community) throw new NotFoundError('Comunidade não encontrada');

  const isAdmin = hasAdminRole(currentUser);
  if (!isAdmin) throw new ForbiddenError('Apenas administradores podem contratar traders');

  if (!community.hiredTraders.includes(traderId)) {
    community.hiredTraders.push(traderId);
    await community.save();
  }
  return community;
};

exports.removeTrader = async (id, traderId, currentUser) => {
  const community = await Community.findById(id);
  if (!community) throw new NotFoundError('Comunidade não encontrada');

  const isAdmin = hasAdminRole(currentUser);
  if (!isAdmin) throw new ForbiddenError('Apenas administradores podem remover traders');

  community.hiredTraders = community.hiredTraders.filter(t => t.toString() !== traderId);
  await community.save();
  return community;
};

exports.inviteMember = async (id, userId, currentUser) => {
  const community = await Community.findById(id);
  if (!community) throw new NotFoundError('Comunidade não encontrada');

  const isAdmin = hasAdminRole(currentUser);
  if (!isAdmin) throw new ForbiddenError('Apenas administradores podem convidar membros');

  if (!community.members) community.members = [];
  if (!community.members.includes(userId)) {
    community.members.push(userId);
    await community.save();
  }
  return community;
};

// Add after other exports
exports.subscribeToPlan = async (communityId, planId, currentUser) => {
  const community = await Community.findById(communityId);
  if (!community) throw new NotFoundError('Comunidade não encontrada');

  const plan = await Plan.findById(planId);
  if (!plan) throw new NotFoundError('Plano não encontrado');

  const isAdmin = hasAdminRole(currentUser);
  const isOwner = community.userId.toString() === currentUser._id.toString();

  if (!isAdmin && !isOwner) {
    throw new ForbiddenError('Apenas administradores ou o criador da comunidade podem assinar um plano');
  }

  community.plan = planId;
  await community.save();

  return await community.populate('plan');
};

// Adicionar este novo método
exports.getMyCommunities = async (req, currentUser) => {
  // Busca comunidades onde o usuário é o dono
  const result = await paginateQuery(Community, req, {
    baseFilter: { userId: currentUser._id },
    select: '-__v',
    populate: [
      {
        path: 'createdBy',
        select: '-password -__v',
        populate: {
          path: 'roles',
          select: 'name description'
        }
      },
      {
        path: 'hiredTraders',
        select: '-password -__v'
      },
      'plan'
    ],
    defaultSort: '-createdAt'
  });

  // Para cada comunidade, contar quantas comunicações ativas existem
  const communitiesWithCommunicationCount = await Promise.all(
    result.data.map(async (community) => {
      const communicationCount = await Communication.countDocuments({
        communityId: community._id,
        active: true
      });
  
      // Converter para objeto para poder adicionar propriedades
      const communityObj = community.toObject();
      
      // Verificar se o plano existe antes de adicionar a propriedade
      if (communityObj.plan) {
        communityObj.plan.inUseCommunications = communicationCount;
      } else {
        // Se não existir plano, criar um objeto com apenas a contagem
        communityObj.plan = {
          inUseCommunications: communicationCount
        };
      }
      
      return communityObj;
    })
  );

  // Retornar o resultado com as comunidades atualizadas
  return {
    data: communitiesWithCommunicationCount,
    meta: result.meta
  };
};


