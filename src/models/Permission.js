const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    // Adicione 'MANAGE_PLANS' ao enum de permissões
    enum: [
      // Usuários
      'CREATE_USER', 'VIEW_USER', 'UPDATE_USER', 'DELETE_USER', 'MANAGE_USERS',

      // Comunidades
      'CREATE_COMMUNITY', 'VIEW_COMMUNITY', 'UPDATE_COMMUNITY', 'DELETE_COMMUNITY',
      'MANAGE_COMMUNITIES', 'INVITE_MEMBER', 'HIRE_TRADER', 'REMOVE_TRADER',

      // Operações
      'CREATE_OPERATION', 'VIEW_OPERATION', 'UPDATE_OPERATION',
      'DELETE_OPERATION', 'MANAGE_OPERATIONS',

      // Notificações e comunicação
      'SEND_ALERT', 'MANAGE_CHANNELS', 'VIEW_COMMUNICATIONS',

      // Permissões e sistema
      'VIEW_PERMISSION', 'EDIT_PERMISSION', 'DELETE_PERMISSION',
      'MANAGE_PERMISSIONS', 'ACCESS_ADMIN_PANEL', 'RESET_PASSWORDS','MANAGE_PLANS'
    ],
  },
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema);
