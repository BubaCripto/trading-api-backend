
const userService = require('./userService');
const authorization = require('../../services/authorizationService');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userToEdit = await userService.getUserById(req.params.id);
    if (!userToEdit) return res.status(404).json({ message: 'Usuário não encontrado' });

    const isAllowed = authorization.canEditUser(req.user, userToEdit);
    if (!isAllowed) return res.status(403).json({ message: 'Acesso negado' });

    const updated = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const isAllowed = authorization.canDeleteUser(req.user);
    if (!isAllowed) return res.status(403).json({ message: 'Apenas administradores podem deletar usuários' });

    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
