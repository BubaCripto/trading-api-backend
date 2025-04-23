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
        description: 'Gestão do profile do user'
      },
      {
        name: 'Users',
        description: 'Gestão de usuários, permissões e perfis'
      },
      {
        name: 'Operations',
        description: 'Gestão de operações de trading (sinais)'
      },

      {
        name: 'Communities',
        description: 'Criação e gerenciamento de comunidades'
      },
      {
        name: 'Contracts',
        description: 'Contratação de traders pelas comunidades'
      },
      {
        name: 'ContractMessages',
        description: 'Mensagens entre traders e comunidades em contratos'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };

module.exports = specs;