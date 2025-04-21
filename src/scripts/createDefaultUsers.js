
const mongoose = require('mongoose');
const connect = require('../config/database');
const User = require('../models/User');
const Role = require('../models/Role');

(async () => {
  await connect();

  const roles = await Role.find({ name: { $in: ['ADMIN', 'TRADER'] } });

  const roleMap = {};
  for (const role of roles) {
    roleMap[role.name] = role._id;
  }

  const users = [
    {
      username: 'admin_user',
      email: 'admin@example.com',
      password: '123456',
      roles: [roleMap.ADMIN]
    },
    {
      username: 'trader_user',
      email: 'trader@example.com',
      password: '123456',
      roles: [roleMap.TRADER]
    }
  ];

  for (const userData of users) {
    const exists = await User.findOne({ email: userData.email });
    if (!exists) {
      await User.create(userData);
      console.log(`Usuário criado: ${userData.username}`);
    } else {
      console.log(`Usuário já existe: ${userData.username}`);
    }
  }

  console.log('Criação de usuários finalizada!');
  process.exit();
})();
