const User = require('../../models/User');
const { generateToken } = require('../../utils/jwt');

const userService = {
  async createUser({ username, email, password, role }) {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    if (role && role === 'ADMIN') {
      throw new Error('Não é permitido criar usuário com role ADMIN');
    }

    const user = new User({ username, email, password, role: role || 'TRADER' });
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return userResponse;
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

  async getUserById(targetId) {
    const user = await User.findById(targetId, '-password');
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user;
  },

  async updateUser({ userId, username, email, password, role, currentUserRole }) {
    const existingUserCheck = await User.findById(userId);
    if (!existingUserCheck) {
      throw new Error('Usuário não encontrado');
    }

    const updateData = {};
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          { email: email || '' },
          { username: username || '' }
        ]
      });

      if (existingUser) {
        throw new Error('Username ou email já existe');
      }

      if (username) updateData.username = username;
      if (email) updateData.email = email.toLowerCase();
    }

    if (password) {
      updateData.password = password;
    }

    if (currentUserRole === 'ADMIN' && role) {
      const validRoles = ['TRADER', 'USER', 'COMMUNITY'];
      if (!validRoles.includes(role)) {
        throw new Error('Role inválida');
      }
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return user;
  },

  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async loginUser({ email, password }) {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({ userId: user._id, role: user.role });

    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token };
  }
};

module.exports = userService;