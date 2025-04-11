const Community = require('../models/Community');
const Communication = require('../models/Communication');
const User = require('../models/User');




exports.createCommunity = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';

    // Impede que usuários forcem createdBy ou userId
    const { name, description, active, hiredTraders = [] } = req.body;

    const community = await Community.create({
      name,
      description,
      active,
      hiredTraders,
      userId: isAdmin ? req.body.userId || req.user._id : req.user._id,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: community });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllCommunities = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
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

    res.json({
      success: true,
      data: communitiesWithComms,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('hiredTraders', 'name email')
      .populate('createdBy', 'name')
      .lean();

    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found' });
    }

    const communications = await Communication.find({
      communityId: community._id,
      active: true
    });

    res.json({
      success: true,
      data: {
        ...community,
        communications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCommunity = async (req, res) => {
  try {
    const query = {
      _id: req.params.id,
      ...(req.user.role !== 'ADMIN' ? { userId: req.user._id } : {})
    };

    const { name, description, active, hiredTraders } = req.body;

    // Bloquear alterações diretas em campos sensíveis
    const safeUpdate = { name, description, active };
    if (req.user.role === 'ADMIN') safeUpdate.hiredTraders = hiredTraders;

    const community = await Community.findOneAndUpdate(query, safeUpdate, {
      new: true,
      runValidators: true
    });

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
    const query = {
      _id: req.params.id,
      ...(req.user.role !== 'ADMIN' ? { userId: req.user._id } : {})
    };

    const community = await Community.findOneAndDelete(query);

    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found or unauthorized' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Contratar trader para uma comunidade
exports.hireTrader = async (req, res) => {
  try {
    const { id } = req.params;
    const { traderId } = req.query;

    if (!traderId) {
      return res.status(400).json({ success: false, message: 'Trader ID é obrigatório' });
    }

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Comunidade não encontrada' });
    }

    const trader = await User.findById(traderId);
    if (!trader || trader.role !== 'TRADER') {
      return res.status(400).json({ success: false, message: 'Usuário não é um trader válido' });
    }

    if (community.hiredTraders.includes(traderId)) {
      return res.status(409).json({ success: false, message: 'Trader já está contratado' });
    }

    community.hiredTraders.push(traderId);
    await community.save();

    res.status(200).json({ success: true, message: 'Trader contratado com sucesso', data: community });
  } catch (error) {
    console.error('Erro ao contratar trader:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remover trader de uma comunidade
exports.fireTrader = async (req, res) => {
  try {
    const { id } = req.params;
    const { traderId } = req.query;

    if (!traderId) {
      return res.status(400).json({ success: false, message: 'Trader ID é obrigatório' });
    }

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Comunidade não encontrada' });
    }

    const index = community.hiredTraders.indexOf(traderId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Trader não está contratado' });
    }

    community.hiredTraders.splice(index, 1);
    await community.save();

    res.status(200).json({ success: true, message: 'Trader removido com sucesso', data: community });
  } catch (error) {
    console.error('Erro ao remover trader:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

