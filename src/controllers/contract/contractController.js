const contractService = require('./contractService');

async function requestContract(req, res, next) {
  try {
    const contract = await contractService.requestContract(req.body, req.user);
    return res.status(201).json(contract);
  } catch (err) {
    next(err);
  }
}

async function acceptContract(req, res, next) {
  try {
    const contract = await contractService.acceptContract(req.params.id, req.user);
    return res.status(200).json(contract);
  } catch (err) {
    next(err);
  }
}

async function rejectContract(req, res, next) {
  try {
    const contract = await contractService.rejectContract(req.params.id, req.user);
    return res.status(200).json(contract);
  } catch (err) {
    next(err);
  }
}

async function revokeContract(req, res, next) {
  try {
    const contract = await contractService.revokeContract(req.params.id, req.user);
    return res.status(200).json(contract);
  } catch (err) {
    next(err);
  }
}

async function getContracts(req, res, next) {
  try {
    const contracts = await contractService.getContracts(req.user);
    return res.status(200).json({
      success: true,
      data: contracts
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requestContract,
  acceptContract,
  rejectContract,
  revokeContract,
  getContracts
};
