
const User = require('../../models/User');
const { ForbiddenError, NotFoundError } = require('../../utils/errors');

function hasRole(user, roleName) {
  return user.roles?.some(role => {
    if (typeof role === 'string') return role === roleName;
    if (typeof role === 'object' && role.name) return role.name === roleName;
    return false;
  });
}

exports.getAllUsers = async (currentUser) => { 
  if (!hasRole(currentUser, 'ADMIN')) { 
    throw new ForbiddenError('Apenas administradores podem listar todos os usuários'); 
  } 

  return User.find() 
    .select('-password') 
    .populate('roles')
    .populate('profile');
}; 

exports.getUserById = async (id) => {
  const user = await User.findById(id)
    .select('-password')
    .populate({
      path: 'roles',
      populate: {
        path: 'permissions',
        model: 'Permission'
      }
    });

  if (!user) throw new NotFoundError('Usuário não encontrado');
  return user;
};

exports.updateUser = async (id, data, currentUser) => {
  const userToUpdate = await User.findById(id);
  if (!userToUpdate) throw new NotFoundError('Usuário não encontrado');

  const isAdmin = hasRole(currentUser, 'ADMIN');
  const isSelfUpdate = currentUser._id.toString() === id;

  if (!isAdmin && !isSelfUpdate) {
    throw new ForbiddenError('Você não tem permissão para editar este usuário');
  }

  // If not admin, restrict which fields can be updated
  if (!isAdmin) {
    const allowedFields = ['username', 'email', 'password'];
    Object.keys(data).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete data[key];
      }
    });
  }

  return User.findByIdAndUpdate(id, data, { new: true })
    .select('-password')
    .populate({
      path: 'roles',
      populate: {
        path: 'permissions',
        model: 'Permission'
      }
    });
};

exports.deleteUser = async (id, currentUser) => {
  if (!hasRole(currentUser, 'ADMIN')) {
    throw new ForbiddenError('Apenas administradores podem deletar usuários');
  }

  const user = await User.findById(id);
  if (!user) throw new NotFoundError('Usuário não encontrado');

  return User.findByIdAndDelete(id);
};
