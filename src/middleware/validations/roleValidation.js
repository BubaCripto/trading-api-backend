const { body } = require('express-validator');

exports.validateCreateRole = [
  body('name')
    .isString().withMessage('Nome deve ser uma string')
    .notEmpty().withMessage('Nome não pode estar vazio'),
  body('permissions')
    .isArray().withMessage('Permissões devem ser um array')
    .notEmpty().withMessage('Permissões não podem estar vazias'),
  body('description')
    .optional()
    .isString().withMessage('Descrição deve ser uma string')
];

exports.validateUpdateRole = [
  body('name')
    .optional()
    .isString().withMessage('Nome deve ser uma string')
    .notEmpty().withMessage('Nome não pode estar vazio'),
  body('permissions')
    .optional()
    .isArray().withMessage('Permissões devem ser um array')
    .notEmpty().withMessage('Permissões não podem estar vazias'),
  body('description')
    .optional()
    .isString().withMessage('Descrição deve ser uma string')
];