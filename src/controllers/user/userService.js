const User = require('../../models/User');
const { generateToken } = require('../../utils/jwt');

const userService = {
  async createUser(data) {
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }]
    });

    if (existingUser) throw new Error('Username ou email já existe');

    const user = new User({
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role || 'TRADER'
    });

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  },

  async getAllUsers({ page = 1, limit = 10, sort = '-createdAt' }) {
    const users = await User.find({}, '-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments();

    return {
      data: users,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    };
  },

  async getUserById(userId) {
    const user = await User.findById(userId, '-password');
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  },

  async updateUser(userId, updates) {
    const conflict = await User.findOne({
      _id: { $ne: userId },
      $or: [
        { email: updates.email || '' },
        { username: updates.username || '' }
      ]
    });
    if (conflict) throw new Error('Username ou email já existe');

    const updateData = {};
    if (updates.username) updateData.username = updates.username;
    if (updates.email) updateData.email = updates.email;
    if (updates.password) updateData.password = updates.password;
    if (updates.role) updateData.role = updates.role;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    return user;
  },

  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new Error('User not found');
    return true;
  },

  async loginUser({ email, password }) {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Email ou senha inválidos');
    }

    const token = generateToken({ userId: user._id, role: user.role });
    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, token };
  }
};

module.exports = userService;