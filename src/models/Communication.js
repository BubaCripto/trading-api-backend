const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Telegram', 'Discord', 'WhatsApp']
  },
  credentials: {
    botToken: String,
    chatId: String,
    webhookUrl: String,
    accountSid: String,
    authToken: String,
    fromNumber: String,
    toNumber: String
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Communication', communicationSchema);