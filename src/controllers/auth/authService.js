
const User = require('../../models/User');
const Role = require('../../models/Role');
const Profile = require('../../models/Profile');
const jwt = require('../../utils/jwt');
const bcrypt = require('bcryptjs');
const Permission = require('../../models/Permission');

exports.registerUser = async ({ username, email, password, roleNames, profileData }) => {
  const roles = await Role.find({ name: { $in: roleNames } });
  if (roles.length === 0) {
    throw new Error('Nenhuma role válida encontrada.');
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new Error('Email ou nome de usuário já cadastrado.');
  }

  const user = new User({ username, email, password, roles: roles.map(r => r._id) });
  await user.save();

  try {
    await Profile.create({
      userId: user._id,
      ...profileData
    });
  } catch (err) {
    throw new Error('Erro ao criar perfil: ' + err.message);
  }

  const populatedUser = await User.findById(user._id).populate([
    {
      path: 'roles',
      populate: { path: 'permissions', model: 'Permission' }
    },
    {
      path: 'profile',
      model: 'Profile'
    }
  ]);

  const token = jwt.generateToken({ _id: user._id });

  return {
    token,
    user: {
      _id: populatedUser._id,
      username: populatedUser.username,
      email: populatedUser.email,
      roles: populatedUser.roles.map(r => r.name),
      permissions: populatedUser.roles.flatMap(r => r.permissions.map(p => p.name)),
      profile: populatedUser.profile
    }
  };
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).populate([
    {
      path: 'roles',
      populate: { path: 'permissions', model: 'Permission' }
    },
    {
      path: 'profile',
      model: 'Profile'
    }
  ]);

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
      permissions: user.roles.flatMap(r => r.permissions.map(p => p.name)),
      profile: user.profile
    }
  };
};
