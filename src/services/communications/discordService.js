const axios = require('axios');

class DiscordService {
  async sendMessage(webhookUrl, message) {
    try {
      await axios.post(webhookUrl, {
        content: "@everyone",
                    tts: false,
                    embeds: [{
                        title: "",
                        description: message
                    }]
      });
    } catch (error) {
      console.error('Discord sending error:', error);
      throw error;
    }
  }
}

module.exports = new DiscordService();