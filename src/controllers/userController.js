const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const userController = {
  // Create new user
  async createUser(req, res) {
    try {
      const { username, email, password, role } = req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Username or email already exists'
        });
      }

      const user = new User({ username, email, password, role });
      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json(userResponse);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all users (only admin)
  async getAllUsers(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

      const users = await User.find({}, '-password')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments();

      res.json({
        data: users,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id, '-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update user (only admin can update role)
  async updateUser(req, res) {
    try {
      const { username, email, password, role } = req.body;

      if (username || email) {
        const existingUser = await User.findOne({
          _id: { $ne: req.params.id },
          $or: [
            { email: email || '' },
            { username: username || '' }
          ]
        });

        if (existingUser) {
          return res.status(400).json({
            message: 'Username or email already exists'
          });
        }
      }

      const updateData = { username, email };
      if (password) updateData.password = password;

      if (req.user.role === 'ADMIN' && role) {
        updateData.role = role;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete user (only admin)
  async deleteUser(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // User login
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      const token = generateToken({ userId: user._id, role: user.role });

      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({ user: userResponse, token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = userController;