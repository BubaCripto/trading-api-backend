const communicationService = require('./communicationService');

async function createCommunication(req, res, next) {
  try {
    const data = {
      ...req.body,
      communityId: req.body.communityId,
    };

    const communication = await communicationService.createCommunication(data, req.user);
    res.status(201).json(communication);
  } catch (error) {
    next(error);
  }
}

async function getCommunications(req, res, next) {
  try {
    const result = await communicationService.getCommunications(req, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function toggleCommunication(req, res, next) {
  try {
    const result = await communicationService.toggleCommunication(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function deleteCommunication(req, res, next) {
  try {
    const result = await communicationService.deleteCommunication(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function createCommunicationAsAdmin(req, res, next) {
  try {
    const data = {
      ...req.body,
      communityId: req.body.communityId,
    };

    const communication = await communicationService.createCommunicationAsAdmin(data, req.user);
    res.status(201).json({
      message: 'Comunicação criada com sucesso pelo administrador',
      data: communication
    });
  } catch (error) {
    next(error);
  }
}

// Adicionar a nova função ao módulo de exportação
module.exports = {
  createCommunication,
  getCommunications,
  toggleCommunication,
  deleteCommunication,
  createCommunicationAsAdmin // Nova função
};
