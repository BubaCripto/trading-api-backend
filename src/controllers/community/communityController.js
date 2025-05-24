const service = require('./communityService');



exports.createCommunity = async (req, res, next) => {
  try {
    const community = await service.createCommunity(req.body, req.user);
    res.status(201).json(community);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const communities = await service.getAll(req);
    res.status(200).json(communities);
  } catch (err) {
    next(err);
  }
};



exports.getById = async (req, res, next) => {
  try {
    const community = await service.getById(req.params.id);
    res.json(community);
  } catch (err) {
    next(err);
  }
};



exports.updateCommunity = async (req, res, next) => {
  try {
    const community = await service.updateCommunity(req.params.id, req.body, req.user);
    res.json(community);
  } catch (err) {
    next(err);
  }
};

exports.deleteCommunity = async (req, res, next) => {
  try {
    await service.deleteCommunity(req.params.id, req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};




exports.hireTrader = async (req, res, next) => {
  try {
    const community = await service.hireTrader(req.params.id, req.params.traderId, req.user);
    res.json(community);
  } catch (err) {
    next(err);
  }
};

exports.removeTrader = async (req, res, next) => {
  try {
    const community = await service.removeTrader(req.params.id, req.params.traderId, req.user);
    res.json(community);
  } catch (err) {
    next(err);
  }
};

exports.inviteMember = async (req, res, next) => {
  try {
    const community = await service.inviteMember(req.params.id, req.params.userId, req.user);
    res.json(community);
  } catch (err) {
    next(err);
  }
};

// Add after other exports
exports.subscribeToPlan = async (req, res, next) => {
  try {
    const community = await service.subscribeToPlan(
      req.params.id,
      req.params.planId,
      req.user
    );
    res.json(community);
  } catch (err) {
    next(err);
  }
};

