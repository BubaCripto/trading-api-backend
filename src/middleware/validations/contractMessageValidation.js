const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('ID inválido');
  }
  return true;
};

exports.validateSendMessage = [
  param('id')
    .notEmpty().withMessage('O ID do contrato é obrigatório')
    .custom(isValidObjectId),
  body('message')
    .notEmpty().withMessage('A mensagem é obrigatória')
    .isString().withMessage('A mensagem deve ser um texto')
];

exports.validateGetMessages = [
  param('id')
    .notEmpty().withMessage('O ID do contrato é obrigatório')
    .custom(isValidObjectId)
];

exports.validateMarkAsRead = [
  param('messageId')
    .notEmpty().withMessage('O ID da mensagem é obrigatório')
    .custom(isValidObjectId)
];
