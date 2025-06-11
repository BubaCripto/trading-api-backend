const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  active: {
    type: Boolean,
    default: true
  },

  // Campos obrigatórios do seu sistema atual
  userId: {                            // Dono da comunidade
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {                         // Redundante mas mantido por legado
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Traders contratados
  hiredTraders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Novos campos opcionais para expansão
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
    plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: false
  },
  disabled: { type: Boolean, default: false },
  bannerImage: String,
  telegramLink: String,
  discordLink: String,
  category: String // Ex: 'Swing Trade', 'Scalping', 'Educacional'
}, {
  timestamps: true
});

module.exports = mongoose.model('Community', communitySchema);
