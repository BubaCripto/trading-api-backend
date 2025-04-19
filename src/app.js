require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const connectDB = require('./config/database');
const operationRoutes = require('./routes/operationRoutes');
const userRoutes = require('./routes/userRoutes');
const communityRoutes = require('./routes/communityRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const tradingOperationsService = require('./services/tradingOperationsService');
const profileRoutes = require('./routes/profileRoutes'); 



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

// Routes
app.use('/api/operations', operationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/communications', communicationRoutes);

// Protected admin routes (redundant?)
app.use('/communities', communityRoutes);
app.use('/communications', communicationRoutes);

// Start trading operations service (only if not testing)
if (process.env.NODE_ENV !== 'test') {
  tradingOperationsService.start();
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  tradingOperationsService.stop();
  process.exit(0);
});

module.exports = app; // Export app for testing and server