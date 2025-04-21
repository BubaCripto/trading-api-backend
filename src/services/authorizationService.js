
module.exports = {
  canEditUser: (currentUser, targetUser) => {
    const isAdmin = currentUser.roles?.some(role => role.name === 'ADMIN');
    const isSelf = String(currentUser._id) === String(targetUser._id);
    return isAdmin || isSelf;
  },

  canDeleteUser: (currentUser) => {
    return currentUser.roles?.some(role => role.name === 'ADMIN');
  },

  isSelf: (currentUser, targetUserId) => {
    return String(currentUser._id) === String(targetUserId);
  }
};
