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
const webhookRoutes = require('./routes/webhook'); // ⚠️ Webhook do Stripe
const operationWebhookRoutes = require('./routes/operationWebhook');
const dashboardRoutes = require('./routes/dashboardRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Inicializa app
const app = express();

// Conecta ao MongoDB
connectDB();

// CORS
app.use(cors());

/**
 * ⚠️ Rota de Webhook Stripe deve vir ANTES do express.json()
 * pois usa express.raw() para manter o buffer do corpo da requisição
 */
app.use('/api/webhook', webhookRoutes);
app.use('/api/operations/webhook', operationWebhookRoutes);

// ⚠️ Apenas depois dos webhooks
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Demais rotas da API
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
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// Tratamento de rota inexistente
app.use(notFound);

// Tratamento de erros globais
app.use(errorHandler);

// Inicializa serviço de trading se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  tradingOperationsService.start();
}

// Encerramento gracioso
process.on('SIGTERM', () => {
  tradingOperationsService.stop();
  process.exit(0);
});

module.exports = app;
