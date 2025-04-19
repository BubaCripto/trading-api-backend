const profileService = require('./profileService');

const profileController = {
  async createProfile(req, res) {
    try {
      const profile = await profileService.createProfile(req.user._id, req.body);
      res.status(201).json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getProfileByUserId(req, res) {
    try {
      const profile = await profileService.getProfileByUserId(req.params.userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const profile = await profileService.updateProfile(req.params.userId, req.body);
      res.json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async deleteProfile(req, res) {
    try {
      await profileService.deleteProfile(req.params.userId);
      res.json({ success: true, message: 'Perfil removido com sucesso' });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
};

module.exports = profileController;
