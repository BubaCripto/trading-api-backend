require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const specs = require('./config/swagger');
const connectDB = require('./config/database');
const tradingOperationsService = require('./services/tradingOperationsService');

// Middlewares
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const operationRoutes = require('./routes/operationRoutes');
const communityRoutes = require('./routes/communityRoutes');
const contractRoutes = require('./routes/contractRoutes');
const contractMessageRoutes = require('./routes/contractMessageRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const logRoutes = require('./routes/logRoutes');
const planRoutes = require('./routes/planRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const webhookRoutes = require('./routes/webhook');

// Inicializa app
const app = express();

// Conecta ao MongoDB
connectDB();

// Configuração CORS
app.use(cors());

// IMPORTANTE: Registrar a rota de webhook ANTES do middleware express.json()
app.use('/api/webhook', webhookRoutes);

// Middlewares globais para as demais rotas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Demais rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/contracts', contractMessageRoutes);
app.use('/api/communications', communicationRoutes);

// Middleware de rota não encontrada
app.use(notFound);

// Middleware de tratamento global de erros
app.use(errorHandler);

// Serviço de operações de trading (não roda em teste)
if (process.env.NODE_ENV !== 'test') {
  tradingOperationsService.start();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  tradingOperationsService.stop();
  process.exit(0);
});

module.exports = app;
