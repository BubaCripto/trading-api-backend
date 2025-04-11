const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

class TelegramService {
  async sendMessage(botToken, chatId, message) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Telegram sending error:', error);
      throw error;
    }
  }
}

module.exports = new TelegramService();