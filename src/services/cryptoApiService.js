// services/cryptoApiService.js
const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../utils/logger');

class CryptoApiService {
  constructor() {
    this.apiKeys = process.env.CRYPTO_API_KEYS ? process.env.CRYPTO_API_KEYS.split(',') : [];
    this.currentKeyIndex = 0;
    this.baseUrl = process.env.CRYPTO_API_BASE_URL;
    
    // Configurações de cache mais robustas
    this.cache = new NodeCache({ 
      stdTTL: parseInt(process.env.CRYPTO_CACHE_TTL) || 15, 
      checkperiod: 60,
      useClones: false,
      deleteOnExpire: true
    });
    
    // Configuração de timeout e retry
    this.requestTimeout = parseInt(process.env.CRYPTO_API_TIMEOUT) || 5000;
    this.maxRetries = parseInt(process.env.CRYPTO_API_MAX_RETRIES) || 3;
    
    logger.info(`CryptoAPI Service iniciado`, { 
      keysCount: this.apiKeys.length,
      cacheConfig: { ttl: this.cache.options.stdTTL },
      timeout: this.requestTimeout
    });
  }

  getNextApiKey() {
    if (this.apiKeys.length === 0) {
      throw new Error('No API keys available');
    }
    
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    
    logger.debug(`Alternando para próxima chave API`, { keyIndex: this.currentKeyIndex });
    return key;
  }

  async getPrices(symbols) {
    if (!symbols || (Array.isArray(symbols) && symbols.length === 0)) {
      logger.warn('Tentativa de buscar preços sem fornecer símbolos');
      throw new Error('Symbols parameter is required');
    }
    
    const key = Array.isArray(symbols) ? symbols.sort().join(',') : symbols;

    // Verificação de cache
    if (this.cache.has(key)) {
      logger.debug(`Cache hit para ${key}`);
      return this.cache.get(key);
    }

    if (this.apiKeys.length === 0) {
      logger.error('Nenhuma chave de API disponível');
      throw new Error('No API keys available');
    }

    return this._fetchPricesWithRetry(key, symbols, 0);
  }
  
  async _fetchPricesWithRetry(cacheKey, symbols, retryCount) {
    try {
      const apiKey = this.getNextApiKey();
      logger.info(`Buscando preços`, { symbols: cacheKey, attempt: retryCount + 1 });

      const response = await axios.get(this.baseUrl, {
        timeout: this.requestTimeout,
        params: {
          fsyms: Array.isArray(symbols) ? symbols.join(',') : symbols,
          tsyms: 'USD',
          api_key: apiKey,
        },
      });

      if (!response.data || !response.data.RAW) {
        throw new Error(`Invalid API response: ${JSON.stringify(response.data)}`);
      }

      const result = response.data.RAW;
      this.cache.set(cacheKey, result);
      
      logger.info(`Preços obtidos com sucesso`, { 
        symbolsCount: Object.keys(result).length,
        cacheKey
      });
      
      return result;
    } catch (error) {
      // Tratamento específico para erros de API
      if (error.response) {
        const status = error.response.status;
        
        // Erros de autenticação ou limite de taxa
        if ([401, 403, 429].includes(status)) {
          logger.warn(`Chave API falhou`, { 
            status, 
            message: error.response.data?.Message || error.message,
            remainingKeys: this.apiKeys.length - 1
          });
          
          // Remove a chave atual
          this.apiKeys.splice(this.currentKeyIndex, 1);
          this.currentKeyIndex = this.currentKeyIndex % Math.max(this.apiKeys.length, 1);
          
          // Tenta novamente com outra chave se disponível
          if (this.apiKeys.length > 0) {
            return this.getPrices(symbols);
          }
          
          throw new Error('All API keys have failed');
        }
      }
      
      // Lógica de retry para outros tipos de erros (timeout, rede, etc)
      if (retryCount < this.maxRetries) {
        const nextRetry = retryCount + 1;
        const delay = Math.pow(2, nextRetry) * 1000; // Exponential backoff
        
        logger.warn(`Falha na requisição, tentando novamente`, { 
          attempt: nextRetry, 
          maxRetries: this.maxRetries,
          delay,
          error: error.message 
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._fetchPricesWithRetry(cacheKey, symbols, nextRetry);
      }
      
      logger.error('Falha ao buscar preços após múltiplas tentativas', { 
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }
  
  // Método para limpar o cache manualmente
  clearCache(symbols = null) {
    if (symbols) {
      const key = Array.isArray(symbols) ? symbols.sort().join(',') : symbols;
      this.cache.del(key);
      logger.info(`Cache limpo para símbolos específicos`, { symbols: key });
    } else {
      this.cache.flushAll();
      logger.info('Cache completamente limpo');
    }
  }
  
  // Método para verificar a saúde do serviço
  async healthCheck() {
    try {
      if (this.apiKeys.length === 0) {
        return { status: 'warning', message: 'No API keys available' };
      }
      
      // Testa a API com um símbolo comum
      await this.getPrices('BTC');
      return { status: 'ok', message: 'Service is operational', keysAvailable: this.apiKeys.length };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Service is not operational',
        error: error.message,
        keysAvailable: this.apiKeys.length
      };
    }
  }
}

module.exports = new CryptoApiService();
