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
        name: 'Users',
        description: 'Gerenciamento de usuários e autenticação'
      },
      {
        name: 'Profile',
        description: 'Gerenciamento de profiles'
      },
      {
        name: 'Operations',
        description: 'Endpoints relacionados às operações de trading'
      },
      {
        name: 'Communities',
        description: 'Endpoints relacionados às comunidades'
      },
      {
        name: 'Communications',
        description: 'Gerenciamento de comunicações das comunidades'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };

module.exports = specs;