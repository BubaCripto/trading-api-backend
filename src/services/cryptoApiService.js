// services/cryptoApiService.js
const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../utils/logger'); // precisa ser criado ou adaptado

class CryptoApiService {
  constructor() {
    this.apiKeys = process.env.CRYPTO_API_KEYS.split(',');
    this.currentKeyIndex = 0;
    this.baseUrl = process.env.CRYPTO_API_BASE_URL;
    this.cache = new NodeCache({ stdTTL: 15 }); // 15 segundos de cache

    logger.info(`🔑 CryptoAPI Service iniciado com ${this.apiKeys.length} chaves`);
  }

  getNextApiKey() {
    const key = this.apiKeys[this.currentKeyIndex];
    logger.info(`🔁 Trocando para chave de API índice ${this.currentKeyIndex + 1}`);
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  async getPrices(symbols) {
    const key = Array.isArray(symbols) ? symbols.sort().join(',') : symbols;

    if (this.cache.has(key)) {
      logger.info(`⚡ Cache hit para ${key}`);
      return this.cache.get(key);
    }

    if (this.apiKeys.length === 0) {
      logger.error('❌ Nenhuma chave de API disponível');
      throw new Error('No API keys available');
    }

    try {
      const apiKey = this.getNextApiKey();
      logger.info(`🌐 Buscando preços para: ${key}`);

      const response = await axios.get(this.baseUrl, {
        timeout: 5000,
        params: {
          fsyms: key,
          tsyms: 'USD',
          api_key: apiKey,
        },
      });

      const result = response.data.RAW;
      this.cache.set(key, result);
      logger.info(`✅ Preços obtidos para ${Object.keys(result).length} símbolos`);
      return result;
    } catch (error) {
      if (error.response && [403, 429].includes(error.response.status)) {
        logger.warn(`⚠️ Chave falhou (${error.response.status}), tentando próxima...`);
        this.apiKeys.splice(this.currentKeyIndex, 1);
        if (this.apiKeys.length > 0) {
          return this.getPrices(symbols);
        }
      }
      logger.error('❌ Erro ao buscar preços:', error);
      throw error;
    }
  }
}

module.exports = new CryptoApiService();
