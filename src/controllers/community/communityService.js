const Community = require('../../models/Community');
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

exports.getAll = async () => {
  return await Community.find({ active: true }).populate('hiredTraders userId');
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

