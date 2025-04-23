
const User = require('../../models/User');

exports.getAllUsers = async () => {
    return User.find().select('-password').populate({
  path: 'roles',
  populate: {
    path: 'permissions',
    model: 'Permission'
  }
});
};

exports.getUserById = async (id) => {
  return User.find().select('-password').populate({
  path: 'roles',
  populate: {
    path: 'permissions',
    model: 'Permission'
  }
});

};

exports.updateUser = async (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};

exports.deleteUser = async (id) => {
  return User.findByIdAndDelete(id);
};
