
const User = require('../../models/User');

exports.getAllUsers = async () => {
  return User.find().select('-password').populate('roles');
};

exports.getUserById = async (id) => {
  return User.findById(id).populate('roles');
};

exports.updateUser = async (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};

exports.deleteUser = async (id) => {
  return User.findByIdAndDelete(id);
};
