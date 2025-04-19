const userService = require('./userService');

const userController = {
  async createUser(req, res) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getAllUsers(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }
      const result = await userService.getAllUsers(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const targetId = req.params.id;
      if (req.user.role !== 'ADMIN' && req.user._id.toString() !== targetId) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      const user = await userService.getUserById(targetId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const updated = await userService.updateUser(userId, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }
      await userService.deleteUser(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async loginUser(req, res) {
    try {
      const result = await userService.loginUser(req.body);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
};

module.exports = userController;