
const { body, param } = require('express-validator');

const validateCreateCommunication = [
  body('communityId')
    .notEmpty().withMessage('O ID da comunidade é obrigatório')
    .isMongoId().withMessage('ID da comunidade inválido'),
  body('type')
    .notEmpty().withMessage('O tipo de comunicação é obrigatório')
    .isIn(['Telegram', 'Discord', 'WhatsApp']).withMessage('Tipo de comunicação inválido'),
  body('credentials').custom((value, { req }) => {
    if (!value || typeof value !== 'object') {
      throw new Error('As credenciais são obrigatórias');
    }

    // Validações específicas por tipo
    if (req.body.type === 'Telegram') {
      if (!value.botToken || !value.chatId) {
        throw new Error('Telegram exige botToken e chatId');
      }
    }

    if (req.body.type === 'WhatsApp') {
      if (!value.accountSid || !value.authToken || !value.fromNumber || !value.toNumber) {
        throw new Error('WhatsApp exige accountSid, authToken, fromNumber e toNumber');
      }
    }

    return true;
  })
];

const validateToggleCommunication = [
  param('id')
    .notEmpty().withMessage('O ID é obrigatório')
    .isMongoId().withMessage('ID inválido')
];

const validateAdminCommunication = [
  body('communityId')
    .notEmpty().withMessage('O ID da comunidade é obrigatório')
    .isMongoId().withMessage('ID da comunidade inválido'),
  body('type')
    .notEmpty().withMessage('O tipo de comunicação é obrigatório')
    .isIn(['Telegram', 'Discord', 'WhatsApp']).withMessage('Tipo de comunicação inválido'),
  body('credentials').custom((value, { req }) => {
    if (!value || typeof value !== 'object') {
      throw new Error('As credenciais são obrigatórias');
    }

    // Validações específicas por tipo
    if (req.body.type === 'Telegram') {
      if (!value.botToken || !value.chatId) {
        throw new Error('Telegram exige botToken e chatId');
      }
    }

    if (req.body.type === 'WhatsApp') {
      if (!value.accountSid || !value.authToken || !value.fromNumber || !value.toNumber) {
        throw new Error('WhatsApp exige accountSid, authToken, fromNumber e toNumber');
      }
    }

    return true;
  })
];

// Adicionar ao módulo de exportação
module.exports = {
  validateCreateCommunication,
  validateToggleCommunication,
  validateAdminCommunication // Nova validação
};
