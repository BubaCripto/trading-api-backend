const Community = require('../models/Community');
const Communication = require('../models/Communication');
const messageFormatter = require('./messageFormatterService');
const telegramService = require('./communications/telegramService');
const discordService = require('./communications/discordService');
const whatsappService = require('./communications/whatsappService');

class NotificationService {
  async notify(type, operation = {}) {
    try {
      // Get active communities where the trader is hired
      const communities = await Community.find({
        active: true,
        hiredTraders: operation.userId
      });

      if (!communities.length) {
        console.log('No active communities found for trader:', operation.userId);
        return;
      }

      // Format the message
      const message = messageFormatter.formatOperationMessage(type, operation);

      // Process each community
      for (const community of communities) {
        await this.processCommunityCommunications(community._id, message);
      }
    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  async processCommunityCommunications(communityId, message) {
    try {
      // Get active communication channels for the community
      const communications = await Communication.find({
        communityId,
        active: true
      });

      // Send message through each active channel
      for (const comm of communications) {
        await this.sendMessage(comm, message);
      }
    } catch (error) {
      console.error(`Error processing communications for community ${communityId}:`, error);
    }
  }

  async sendMessage(communication, message) {
    try {
      switch (communication.type) {
        case 'Telegram':
          await this.sendTelegramMessage(communication.credentials, message);
          break;
        case 'Discord':
          await this.sendDiscordMessage(communication.credentials, message);
          break;
        case 'WhatsApp':
          await this.sendWhatsAppMessage(communication.credentials, message);
          break;
        default:
          console.warn(`Unsupported communication type: ${communication.type}`);
      }
    } catch (error) {
      console.error(`Error sending ${communication.type} message:`, error);
    }
  }

  async sendTelegramMessage(credentials, message) {
    const { botToken, chatId } = credentials;
    await telegramService.sendMessage(botToken, chatId, message);
  }

  async sendDiscordMessage(credentials, message) {
    const { webhookUrl } = credentials;
    await discordService.sendMessage(webhookUrl, message);
  }

  async sendWhatsAppMessage(credentials, message) {
    const { accountSid, authToken, fromNumber, toNumber } = credentials;
    await whatsappService.sendMessage(accountSid, authToken, fromNumber, toNumber, message);
  }
}

module.exports = new NotificationService();