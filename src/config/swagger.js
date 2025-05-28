const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trading Operations API',
      version: '1.0.0',
      description: 'API for managing trading operations and notifications',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Login e registro de usuários com JWT'
      },
      {
        name: 'Profile',
        description: 'Gestão do profile do user (todos)'
      },
      {
        name: 'Users',
        description: 'Gestão de usuários, permissões e perfis (todos)'
      },
      {
        name: 'Operations',
        description: 'Gestão de operações de trading (sinais) (apenas traders)'
      },

      {
        name: 'Communities',
        description: 'Criação e gerenciamento de comunidades (apenas comunidades)'
      },
      {
        name: 'Communications',
        description: 'Criação e gerenciamento de comunnicação de Discord, Whats e  telegram (apenas comunidades)'
      },
      {
        name: 'Contracts',
        description: 'Contratação de traders pelas comunidades (apenas comunidades e traders)'
      },
      {
        name: 'ContractMessages',
        description: 'Mensagens entre traders e comunidades em contratos (apenas comunidades  e traders)'
      },
      {
        name: 'Dashdoard Trader',
        description: 'gestão de dashboard do trader (todos)'
      },
      {
        name: 'Dashdoard Comunidade',
        description: 'gestão de dashboard do trader (todos)'
      },
      {
        name: 'Admin',
        description: 'Gestão de usuários, permissões Admin'
      }, 
      {
        name: 'Admin User',
        description: 'Gestão de usuários, permissões Admin'
      },
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };

module.exports = specs;