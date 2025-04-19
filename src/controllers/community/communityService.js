const Community = require('../../models/Community');
const Communication = require('../../models/Communication');
const User = require('../../models/User');

exports.createCommunity = async (isAdmin, userData, communityData) => {
  const { name, description, active, hiredTraders = [] } = communityData;
  return await Community.create({
    name,
    description,
    active,
    hiredTraders,
    userId: isAdmin ? communityData.userId || userData._id : userData._id,
    createdBy: userData._id
  });
};

exports.getAllCommunities = async (page = 1, limit = 10, sort = '-createdAt') => {
  const communities = await Community.find()
    .populate('userId', 'name email')
    .populate('hiredTraders', 'name email')
    .populate('createdBy', 'name')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Community.countDocuments();

  const communitiesWithComms = await Promise.all(
    communities.map(async (community) => {
      const communications = await Communication.find({
        communityId: community._id,
        active: true
      });
      return {
        ...community,
        communications
      };
    })
  );

  return {
    communities: communitiesWithComms,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    total
  };
};

exports.getCommunityById = async (id) => {
  const community = await Community.findById(id)
    .populate('userId', 'name email')
    .populate('hiredTraders', 'name email')
    .populate('createdBy', 'name')
    .lean();

  if (!community) return null;

  const communications = await Communication.find({
    communityId: community._id,
    active: true
  });

  return { ...community, communications };
};

exports.updateCommunity = async (id, userRole, userId, updateData) => {
  const query = {
    _id: id,
    ...(userRole !== 'ADMIN' ? { userId } : {})
  };

  const { name, description, active, hiredTraders } = updateData;
  const safeUpdate = { name, description, active };
  if (userRole === 'ADMIN') safeUpdate.hiredTraders = hiredTraders;

  return await Community.findOneAndUpdate(query, safeUpdate, {
    new: true,
    runValidators: true
  });
};

exports.deleteCommunity = async (id, userRole, userId) => {
  const query = {
    _id: id,
    ...(userRole !== 'ADMIN' ? { userId } : {})
  };

  return await Community.findOneAndDelete(query);
};

exports.hireTrader = async (communityId, traderId) => {
  const community = await Community.findById(communityId);
  if (!community) return { error: 'Comunidade não encontrada', status: 404 };

  const trader = await User.findById(traderId);
  if (!trader || trader.role !== 'TRADER') {
    return { error: 'Usuário não é um trader válido', status: 400 };
  }

  if (community.hiredTraders.includes(traderId)) {
    return { error: 'Trader já está contratado', status: 409 };
  }

  community.hiredTraders.push(traderId);
  await community.save();
  return { community, status: 200 };
};

exports.fireTrader = async (communityId, traderId) => {
  const community = await Community.findById(communityId);
  if (!community) return { error: 'Comunidade não encontrada', status: 404 };

  const index = community.hiredTraders.indexOf(traderId);
  if (index === -1) {
    return { error: 'Trader não está contratado', status: 404 };
  }

  community.hiredTraders.splice(index, 1);
  await community.save();
  return { community, status: 200 };
};