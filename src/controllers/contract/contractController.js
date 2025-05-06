const contractService = require('./contractService');
const paginateQuery = require('../../utils/paginateQuery');


async function requestContract(req, res) {
  try {
    const contract = await contractService.requestContract(req.body, req.user);
    return res.status(201).json(contract);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function acceptContract(req, res) {
  try {
    const contract = await contractService.acceptContract(req.params.id, req.user);
    return res.status(200).json(contract);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function rejectContract(req, res) {
  try {
    const contract = await contractService.rejectContract(req.params.id, req.user);
    return res.status(200).json(contract);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function revokeContract(req, res) {
  try {
    const contract = await contractService.revokeContract(req.params.id, req.user);
    return res.status(200).json(contract);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function getContracts(req, res) {
  try {
    const contracts = await contractService.getContracts(req.user);
    return res.status(200).json({
      success: true,
      data: contracts
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}


module.exports = {
  requestContract,
  acceptContract,
  rejectContract,
  revokeContract,
  getContracts
};
