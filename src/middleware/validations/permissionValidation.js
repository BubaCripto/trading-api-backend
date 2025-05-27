const { body } = require('express-validator');

exports.validateCreatePermission = [
  body('name')
    .isString().withMessage('Nome deve ser uma string'),
  body('description')
    .optional()
    .isString().withMessage('Descrição deve ser uma string')
];

exports.validateUpdatePermission = [
  body('description')
    .optional()
    .isString().withMessage('Descrição deve ser uma string')
];