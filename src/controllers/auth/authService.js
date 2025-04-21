
const User = require('../../models/User');
const Role = require('../../models/Role');
const jwt = require('../../utils/jwt');
const bcrypt = require('bcryptjs');
const Permission = require('../../models/Permission');

exports.registerUser = async ({ username, email, password, roleNames }) => {
  // Busca as roles pelo nome
  const roles = await Role.find({ name: { $in: roleNames } });
  if (roles.length === 0) {
    throw new Error('Nenhuma role válida encontrada.');
  }

  // Verifica se o usuário já existe
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new Error('Email ou nome de usuário já cadastrado.');
  }

  // Cria o usuário
  const user = new User({ username, email, password, roles: roles.map(r => r._id) });
  await user.save();

  return user;
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).populate({
    path: 'roles',
    populate: {
    path: 'permissions',
    model: 'Permission' // <- ESSENCIAL
  }
  });

  if (!user) {
    throw new Error('Credenciais inválidas.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Credenciais inválidas.');
  }

  const token = jwt.generateToken({ _id: user._id });

  return {
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(r => r.name),
      permissions: user.roles.flatMap(r => r.permissions.map(p => p.name))
    }
  };
};
