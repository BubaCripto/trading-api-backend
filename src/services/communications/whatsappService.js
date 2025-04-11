const twilio = require('twilio');

class WhatsAppService {
  async sendMessage(accountSid, authToken, fromNumber, toNumber, message) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: message,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${toNumber}`
      });
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();