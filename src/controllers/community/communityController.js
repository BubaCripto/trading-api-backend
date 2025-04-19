const communityService = require('./communityService');

exports.createCommunity = async (req, res) => {
  try {
    const community = await communityService.createCommunity(
      req.user.role === 'ADMIN',
      req.user,
      req.body
    );
    res.status(201).json({ success: true, data: community });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllCommunities = async (req, res) => {
  try {
    const { page, limit, sort } = req.query;
    const result = await communityService.getAllCommunities(page, limit, sort);
    res.json({
      success: true,
      data: result.communities,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      total: result.total
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCommunityById = async (req, res) => {
  try {
    const community = await communityService.getCommunityById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found' });
    }
    res.json({ success: true, data: community });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCommunity = async (req, res) => {
  try {
    const community = await communityService.updateCommunity(
      req.params.id,
      req.user.role,
      req.user._id,
      req.body
    );
    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found or unauthorized' });
    }
    res.json({ success: true, data: community });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteCommunity = async (req, res) => {
  try {
    const community = await communityService.deleteCommunity(
      req.params.id,
      req.user.role,
      req.user._id
    );
    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found or unauthorized' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.hireTrader = async (req, res) => {
  try {
    const { id } = req.params;
    const { traderId } = req.query;

    if (!traderId) {
      return res.status(400).json({ success: false, message: 'Trader ID é obrigatório' });
    }

    const result = await communityService.hireTrader(id, traderId);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    res.status(200).json({ success: true, message: 'Trader contratado com sucesso', data: result.community });
  } catch (error) {
    console.error('Erro ao contratar trader:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.fireTrader = async (req, res) => {
  try {
    const { id } = req.params;
    const { traderId } = req.query;

    if (!traderId) {
      return res.status(400).json({ success: false, message: 'Trader ID é obrigatório' });
    }

    const result = await communityService.fireTrader(id, traderId);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    res.status(200).json({ success: true, message: 'Trader removido com sucesso', data: result.community });
  } catch (error) {
    console.error('Erro ao remover trader:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

