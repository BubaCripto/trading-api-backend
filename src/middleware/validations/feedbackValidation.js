const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('ID inválido');
  }
  return true;
};

exports.validateCreateFeedback = [
  body('contractId')
    .notEmpty().withMessage('contractId é obrigatório')
    .custom(isValidObjectId),
  body('scores')
    .notEmpty().withMessage('scores é obrigatório')
    .isObject().withMessage('scores deve ser um objeto'),
  body('experiencia')
    .optional()
    .isString().withMessage('experiencia deve ser um texto'),
  body('melhorar')
    .optional()
    .isString().withMessage('melhorar deve ser um texto'),
  body('denuncia')
    .optional()
    .isString().withMessage('denuncia deve ser um texto')
];

exports.validateContractIdParam = [
  param('contractId')
    .notEmpty().withMessage('ID do contrato é obrigatório')
    .custom(isValidObjectId)
];

exports.validateUserIdParam = [
  param('userId')
    .notEmpty().withMessage('ID do usuário é obrigatório')
    .custom(isValidObjectId)
];