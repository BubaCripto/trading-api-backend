
const mongoose = require('mongoose');
const connect = require('../config/database');
const Permission = require('../models/Permission');
const Role = require('../models/Role');

(async () => {
  await connect();

  // 🛡️ Todas as permissões do sistema
  const permissionsMap = {
    // Usuários
    CREATE_USER: 'Criar novo usuário',
    VIEW_USER: 'Visualizar usuário',
    UPDATE_USER: 'Atualizar dados de usuário',
    DELETE_USER: 'Excluir usuário',
    MANAGE_USERS: 'Gerenciar usuários',

    // Comunidades
    CREATE_COMMUNITY: 'Criar comunidade',
    VIEW_COMMUNITY: 'Visualizar comunidade',
    UPDATE_COMMUNITY: 'Atualizar comunidade',
    DELETE_COMMUNITY: 'Excluir comunidade',
    MANAGE_COMMUNITIES: 'Gerenciar comunidades',
    INVITE_MEMBER: 'Convidar membro para comunidade',
    HIRE_TRADER: 'Contratar trader',
    REMOVE_TRADER: 'Remover trader',

    // Operações
    CREATE_OPERATION: 'Criar operação',
    VIEW_OPERATION: 'Visualizar operação',
    UPDATE_OPERATION: 'Atualizar operação',
    DELETE_OPERATION: 'Excluir operação',
    MANAGE_OPERATIONS: 'Gerenciar operações',
    CLOSE_OPERATION_MANUALLY: 'Fechar operação manualmente',

    // Notificações
    SEND_ALERT: 'Enviar alerta',
    MANAGE_CHANNELS: 'Gerenciar canais de notificação',
    VIEW_COMMUNICATIONS: 'Visualizar histórico de notificações',

    // Permissões e Sistema
    VIEW_PERMISSION: 'Visualizar permissões',
    EDIT_PERMISSION: 'Editar permissões',
    DELETE_PERMISSION: 'Excluir permissões',
    MANAGE_PERMISSIONS: 'Gerenciar permissões',
    ACCESS_ADMIN_PANEL: 'Acessar painel administrativo',
    VIEW_SYSTEM_LOGS: 'Visualizar logs do sistema',
    MANAGE_SETTINGS: 'Gerenciar configurações',
    RESET_PASSWORDS: 'Resetar senhas de usuários'
  };

  const permissionDocs = {};

  // Criar todas as permissões
  for (const [name, description] of Object.entries(permissionsMap)) {
    const permission = await Permission.findOneAndUpdate(
      { name },
      { $setOnInsert: { description } },
      { new: true, upsert: true }
    );
    permissionDocs[name] = permission;
  }

  // Definição de roles e suas permissões
  const rolesMap = {
    ADMIN: Object.keys(permissionsMap),
    TRADER: [
      'CREATE_OPERATION', 'UPDATE_OPERATION', 'DELETE_OPERATION', 'VIEW_COMMUNITY'
    ],
    COMMUNITY: [
      'CREATE_COMMUNITY', 'UPDATE_COMMUNITY', 'HIRE_TRADER', 'REMOVE_TRADER', 'VIEW_OPERATION', 'INVITE_MEMBER'
    ],
    MODERATOR: [
      'VIEW_USER', 'VIEW_OPERATION', 'SEND_ALERT'
    ],
    USER: [
      'VIEW_COMMUNITY', 'VIEW_OPERATION', 'CLOSE_OPERATION_MANUALLY'
    ],
    GUEST: [
      'VIEW_COMMUNITY'
    ]
  };

  // Criar roles e associar permissões
  for (const [roleName, permNames] of Object.entries(rolesMap)) {
    const permissions = permNames.map(name => permissionDocs[name]._id);

    await Role.findOneAndUpdate(
      { name: roleName },
      {
        name: roleName,
        permissions,
        description: `${roleName} role`
      },
      { upsert: true }
    );
  }

  console.log('Roles e permissões criadas com sucesso!');
  process.exit();
})();
