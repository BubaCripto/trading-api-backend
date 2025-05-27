const { body } = require('express-validator');

exports.validateCreatePlan = [
  body('name')
  .isString().withMessage('Nome deve ser uma string'),
  body('description')
    .optional()
    .isString().withMessage('Descrição deve ser uma string'),
  body('maxCommunications')
    .isInt({ min: 1 }).withMessage('Número máximo de comunicações deve ser um número inteiro maior que zero'),
  body('priceMonthly')
    .optional()
    .isNumeric().withMessage('Preço mensal deve ser um número'),
  body('features')
    .optional()
    .isArray().withMessage('Features deve ser um array de strings'),
  body('active')
    .optional()
    .isBoolean().withMessage('Status ativo deve ser um booleano')
];

exports.validateUpdatePlan = [
  body('name')
    .optional()
    .isString().withMessage('Nome deve ser uma string'),
  body('description')
    .optional()
    .isString().withMessage('Descrição deve ser uma string'),
  body('maxCommunications')
    .optional()
    .isInt({ min: 1 }).withMessage('Número máximo de comunicações deve ser um número inteiro maior que zero'),
  body('priceMonthly')
    .optional()
    .isNumeric().withMessage('Preço mensal deve ser um número'),
  body('features')
    .optional()
    .isArray().withMessage('Features deve ser um array de strings'),
  body('active')
    .optional()
    .isBoolean().withMessage('Status ativo deve ser um booleano')
];