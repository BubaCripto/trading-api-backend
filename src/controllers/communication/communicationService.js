const Communication = require('../../models/Communication');

class CommunicationService {
  async createCommunication(userId, communicationData) {
    const communication = new Communication({
      ...communicationData,
      createdBy: userId
    });
    await communication.save();

    return await Communication.findById(communication._id)
      .populate('communityId', 'name')
      .populate('createdBy', 'name');
  }

  async getAllCommunications(page = 1, limit = 10, sort = '-createdAt') {
    const communications = await Communication.find()
      .populate('communityId', 'name')
      .populate('createdBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Communication.countDocuments();

    return {
      data: communications,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    };
  }

  async getFilteredCommunications(filters, page = 1, limit = 10, sort = '-createdAt') {
    const query = {};
    const { _id, communityId, type, active } = filters;

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
      throw new Error('No communications found');
    }

    return {
      data: communications,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    };
  }

  async getCommunicationById(id) {
    const communication = await Communication.findById(id)
      .populate('communityId', 'name')
      .populate('createdBy', 'name');

    if (!communication) {
      throw new Error('Communication not found');
    }

    return communication;
  }

  async updateCommunication(id, updateData) {
    const communication = await Communication.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('communityId', 'name')
    .populate('createdBy', 'name');

    if (!communication) {
      throw new Error('Communication not found');
    }

    return communication;
  }

  async deleteCommunication(id) {
    const communication = await Communication.findByIdAndDelete(id);

    if (!communication) {
      throw new Error('Communication not found');
    }

    return communication;
  }
}

module.exports = new CommunicationService();