require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const connectDB = require('./config/database');
const tradingOperationsService = require('./services/tradingOperationsService');



//rotas
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
// Importar as novas rotas
const roleRoutes = require('./routes/roleRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/logs', logRoutes); 
app.use('/api/roles', roleRoutes);

app.use('/contracts', contractRoutes);
app.use('/contracts', contractMessageRoutes);
app.use('/communications', communicationRoutes); 




// Start trading operations service (only if not testing)
if (process.env.NODE_ENV !== 'test') {
  tradingOperationsService.start();
}



// Error handling middleware
app.use((err, req, res, next) => {
  if (!err.status || err.status >= 500) {
    console.error(err); // Loga apenas se for erro crítico (500+)
  }

  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  res.status(500).json({ message: 'Something went wrong!' });
});


// Graceful shutdown
process.on('SIGTERM', () => {
  tradingOperationsService.stop();
  process.exit(0);
});

module.exports = app; // Export app for testing and server