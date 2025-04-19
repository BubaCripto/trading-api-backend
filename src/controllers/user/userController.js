const userService = require('./userService');
const userValidator = require('./validators/userValidator');

const userController = {
  async createUser(req, res) {
    try {
      const validated = userValidator.validateCreate(req.body);
      const user = await userService.createUser(validated);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message, details: error.details });
    }
  },

  async getAllUsers(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { page, limit, sort } = req.query;
      const users = await userService.getAllUsers({ page, limit, sort });
      res.json(users);
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

      if (req.user.role !== 'ADMIN' && req.user._id.toString() !== userId) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      if (req.body.role && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Não autorizado a alterar a role' });
      }

      if (req.body.email && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Não autorizado a alterar o email' });
      }

      const validated = userValidator.validateUpdate(req.body);

      const user = await userService.updateUser({
        userId,
        ...validated,
        currentUserRole: req.user.role
      });

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message, details: error.details });
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
      const { email, password } = req.body;
      const result = await userService.loginUser({ email, password });
      res.json(result);
    } catch (error) {
      if (error.message === 'Invalid email or password') {
        res.status(401).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }
};

module.exports = userController;
