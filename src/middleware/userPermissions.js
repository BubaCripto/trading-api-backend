function canCreateUser(req, res, next) {
    if (req.body.role === 'ADMIN') {
      return res.status(403).json({ message: 'Você não pode criar um usuário com role ADMIN' });
    }
    next();
  }
  
  function canUpdateUser(req, res, next) {
    const userId = req.params.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isSelf = req.user._id.toString() === userId;
  
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Você não tem permissão para editar este usuário' });
    }
  
    if (!isAdmin && req.body.role) {
      return res.status(403).json({ message: 'Você não pode alterar a role do usuário' });
    }
  
    if (!isAdmin && req.body.email) {
      return res.status(403).json({ message: 'Você não pode alterar o email do usuário' });
    }
  
    next();
  }
  
  module.exports = {
    canCreateUser,
    canUpdateUser
  };
  