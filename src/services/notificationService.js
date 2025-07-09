const Community = require('../models/Community');
const Communication = require('../models/Communication');
const SignalDispatchLog = require('../models/SignalDispatchLog');
const messageFormatter = require('./messageFormatterService');
const telegramService = require('./communications/telegramService');
const discordService = require('./communications/discordService');
const whatsappService = require('./communications/whatsappService');

class NotificationService {
  async notify(type, operation = {}) {
    try {
      // Comunidades ativas que contrataram o trader
      const communities = await Community.find({
        active: true,
        hiredTraders: operation.userId
      });

      if (!communities.length) {
        console.log('No active communities found for trader:', operation.userId);
        return;
      }

      // Mensagem formatada
      const message = messageFormatter.formatOperationMessage(type, operation);

      // Enviar para cada comunidade + registrar o envio
      for (const community of communities) {
        // ✅ Registra o envio (se ainda não existir)
        await SignalDispatchLog.findOneAndUpdate(
          {
            operationId: operation._id,
            communityId: community._id
          },
          {
            operationId: operation._id,
            communityId: community._id,
            traderId: operation.userId
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Envia para canais ativos
        await this.processCommunityCommunications(community._id, message);
      }
    } catch (error) {
      console.error('Notification error:', error);
    }
  }

  async processCommunityCommunications(communityId, message) {
    try {
      const communications = await Communication.find({
        communityId,
        active: true
      });

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
