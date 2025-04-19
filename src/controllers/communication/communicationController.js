const communicationService = require('./communicationService');

const communicationController = {
  async createCommunication(req, res) {
    try {
      const communication = await communicationService.createCommunication(req.user._id, req.body);
      res.status(201).json(communication);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getAllCommunications(req, res) {
    try {
      const { page, limit, sort } = req.query;
      const result = await communicationService.getAllCommunications(page, limit, sort);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getFilteredCommunications(req, res) {
    try {
      const { page, limit, sort, ...filters } = req.query;
      const result = await communicationService.getFilteredCommunications(filters, page, limit, sort);
      res.json(result);
    } catch (error) {
      res.status(error.message.includes('No communications found') ? 404 : 500)
        .json({ message: error.message });
    }
  },

  async getCommunicationById(req, res) {
    try {
      const communication = await communicationService.getCommunicationById(req.params.id);
      res.json(communication);
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 500)
        .json({ message: error.message });
    }
  },

  async updateCommunication(req, res) {
    try {
      const communication = await communicationService.updateCommunication(req.params.id, req.body);
      res.json(communication);
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 400)
        .json({ message: error.message });
    }
  },

  async deleteCommunication(req, res) {
    try {
      await communicationService.deleteCommunication(req.params.id);
      res.json({ message: 'Comunicação excluída com sucesso' });
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 500)
        .json({ message: error.message });
    }
  }
};

module.exports = communicationController;