const Communication = require('../models/Communication');

const communicationController = {
  async createCommunication(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Only admins can create communications' });
      }

      const communication = new Communication({
        ...req.body,
        createdBy: req.user._id
      });
      await communication.save();

      const populatedComm = await Communication.findById(communication._id)
        .populate('communityId', 'name')
        .populate('createdBy', 'name');

      res.status(201).json(populatedComm);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getAllCommunications(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

      const communications = await Communication.find()
        .populate('communityId', 'name')
        .populate('createdBy', 'name')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Communication.countDocuments();

      res.json({
        data: communications,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getFilteredCommunications(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { _id, communityId, type, active, page = 1, limit = 10, sort = '-createdAt' } = req.query;

      const query = {};
      if (_id) query._id = _id;
      if (communityId) query.communityId = communityId;
      if (type) query.type = type;
      if (active !== undefined) query.active = active === 'true';

      const communications = await Communication.find(query)
        .populate('communityId', 'name')
        .populate('createdBy', 'name')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Communication.countDocuments(query);

      if (communications.length === 0) {
        return res.status(404).json({ message: 'No communications found' });
      }

      res.json({
        data: communications,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getCommunicationById(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const communication = await Communication.findById(req.params.id)
        .populate('communityId', 'name')
        .populate('createdBy', 'name');

      if (!communication) {
        return res.status(404).json({ message: 'Communication not found' });
      }

      res.json(communication);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateCommunication(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const communication = await Communication.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
      .populate('communityId', 'name')
      .populate('createdBy', 'name');

      if (!communication) {
        return res.status(404).json({ message: 'Communication not found' });
      }

      res.json(communication);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async deleteCommunication(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const communication = await Communication.findByIdAndDelete(req.params.id);

      if (!communication) {
        return res.status(404).json({ message: 'Communication not found' });
      }

      res.json({ message: 'Communication deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = communicationController;
