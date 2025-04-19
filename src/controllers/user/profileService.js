const Profile = require('../../models/Profile');

const profileService = {
  async createProfile(userId, data) {
    const existing = await Profile.findOne({ userId });
    if (existing) throw new Error('Perfil já existe para este usuário');

    const profile = new Profile({ userId, ...data });
    await profile.save();
    return profile;
  },

  async getProfileByUserId(userId) {
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new Error('Perfil não encontrado');
    return profile;
  },

  async updateProfile(userId, updates) {
    const profile = await Profile.findOneAndUpdate(
      { userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!profile) throw new Error('Perfil não encontrado');
    return profile;
  },

  async deleteProfile(userId) {
    const deleted = await Profile.findOneAndDelete({ userId });
    if (!deleted) throw new Error('Perfil não encontrado');
    return true;
  }
};

module.exports = profileService;
