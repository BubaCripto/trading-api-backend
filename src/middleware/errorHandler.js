// Middleware de tratamento global de erros

function errorHandler(err, req, res, next) {
    console.error('Erro:', err);
  
    const status = err.status || 500;
    const message = err.message || 'Erro interno no servidor';
  
    res.status(status).json({
      success: false,
      message,
    });
  }
  
  module.exports = errorHandler;
  