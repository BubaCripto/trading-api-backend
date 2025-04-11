// src/utils/logger.js
const chalk = require('chalk');

const logger = {
  info: (msg) => console.log(chalk.blue('ℹ️ [INFO]'), msg),
  success: (msg) => console.log(chalk.green('✅ [SUCCESS]'), msg),
  warn: (msg) => console.warn(chalk.yellow('⚠️ [WARN]'), msg),
  error: (msg) => console.error(chalk.red('❌ [ERROR]'), msg)
};

module.exports = logger;
