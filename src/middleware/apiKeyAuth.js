const crypto = require('crypto');

// Função para gerar uma API key (use apenas para criar novas chaves)
exports.generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware de autenticação por API key
exports.apiKeyAuth = (req, res, next) => {
  const apiKey = req.query.apiKey || req.headers['x-api-key'];
  
  // Verifique se a API key foi fornecida
  if (!apiKey) {
    return res.status(401).json({ error: 'API key não fornecida' });
  }
  
  // Verifique se a API key é válida (compare com a chave armazenada em variável de ambiente)
  const validApiKey = process.env.WEBHOOK_API_KEY;
  
  if (!validApiKey || apiKey !== validApiKey) {
    return res.status(403).json({ error: 'API key inválida' });
  }
  
  // Se chegou aqui, a API key é válida
  next();
};