// src/middleware/checkPermission.js
const User = require('../models/User');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Verifica se o usuário está autenticado
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
      }

      // Carrega o usuário com roles e permissões
      const user = await User.findById(req.user._id).populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: 'Permission'
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      // Junta todas as permissões do usuário
      const userPermissions = user.roles.flatMap(role =>
        role.permissions.map(perm => perm.name)
      );

      // Verifica se tem a permissão necessária
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Permissão negada.' });
      }

      next();
    } catch (err) {
      console.error('Erro ao verificar permissão:', err);
      return res.status(500).json({ message: 'Erro interno ao verificar permissões.' });
    }
  };
};

module.exports = checkPermission;
