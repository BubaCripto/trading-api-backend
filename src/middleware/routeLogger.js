// src/middleware/routeLogger.js
const RouteLog = require('../models/RouteLog');

const routeLogger = async (req, res, next) => {
  const startTime = Date.now();
  
  // Clonar o objeto original da resposta json
  const originalJson = res.json;
  let responseBody;

  // Sobrescrever o método json para capturar a resposta
  res.json = function(body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Quando a resposta terminar
  res.on('finish', async () => {
    try {
      const logData = {
        method: req.method,
        route: req.originalUrl,
        params: req.params,
        query: req.query,
        // Remover dados sensíveis do body
        body: sanitizeRequestBody(req.body),
        userId: req.user?._id,
        userEmail: req.user?.email,
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
        // Remover dados sensíveis da resposta
        responseData: sanitizeResponseData(responseBody),
        ip: req.ip,
        userAgent: req.get('user-agent')
      };

      // Se houver erro, registrar
      if (res.statusCode >= 400) {
        logData.error = responseBody;
      }

      await RouteLog.create(logData);
    } catch (error) {
      console.error('Erro ao criar log:', error);
    }
  });

  next();
};

// Função para remover dados sensíveis do body
const sanitizeRequestBody = (body) => {
  if (!body) return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'senha', 'token', 'secret', 'creditCard'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// Função para remover dados sensíveis da resposta
const sanitizeResponseData = (data) => {
  if (!data) return data;
  
  // Se for um erro, retornar apenas a mensagem
  if (data.stack) {
    return { message: data.message };
  }
  
  // Clonar para não modificar a resposta original
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Remover campos sensíveis
  const sensitiveFields = ['password', 'senha', 'token', 'secret', 'creditCard'];
  
  const recursiveSanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.keys(obj).forEach(key => {
      if (sensitiveFields.includes(key)) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        recursiveSanitize(obj[key]);
      }
    });
  };
  
  recursiveSanitize(sanitized);
  return sanitized;
};

module.exports = routeLogger;