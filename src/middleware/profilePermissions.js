const Profile = require('../models/Profile');

async function canAccessOwnProfile(req, res, next) {
  const { userId } = req.params;
  const isAdmin = req.user.role === 'ADMIN';
  const isSelf = req.user._id.toString() === userId;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ message: 'Você não tem permissão para acessar esse perfil' });
  }

  next();
}

async function canEditOwnProfile(req, res, next) {
  const { userId } = req.params;
  const isAdmin = req.user.role === 'ADMIN';
  const isSelf = req.user._id.toString() === userId;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ message: 'Você não tem permissão para editar esse perfil' });
  }

  next();
}

module.exports = {
  canAccessOwnProfile,
  canEditOwnProfile
};
