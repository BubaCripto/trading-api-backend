const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('ID inválido');
  }
  return true;
};

exports.validateCreateContract = [
  body('communityId')
    .notEmpty().withMessage('communityId é obrigatório')
    .custom(isValidObjectId),
  body('traderId')
    .notEmpty().withMessage('traderId é obrigatório')
    .custom(isValidObjectId),
  body('terms')
    .notEmpty().withMessage('terms é obrigatório')
    .isString().withMessage('terms deve ser um texto')
];

exports.validateContractIdParam = [
  param('id')
    .notEmpty().withMessage('ID do contrato é obrigatório')
    .custom(isValidObjectId)
];

exports.validateGetContractsQuery = [
  query('community')
    .optional()
    .custom(isValidObjectId),
  query('trader')
    .optional()
    .custom(isValidObjectId),
  query('status')
    .optional()
    .isIn(['PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED'])
    .withMessage('Status inválido')
];
