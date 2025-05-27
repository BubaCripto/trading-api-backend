const { body } = require('express-validator');

exports.validateCreateRole = [
  body('name')
    .isString().withMessage('Nome deve ser uma string')
    .isIn(['ADMIN', 'TRADER', 'COMMUNITY', 'MODERATOR', 'USER', 'GUEST'])
    .withMessage('Nome deve ser um dos valores permitidos: ADMIN, TRADER, COMMUNITY, MODERATOR, USER, GUEST'),
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
    .isIn(['ADMIN', 'TRADER', 'COMMUNITY', 'MODERATOR', 'USER', 'GUEST'])
    .withMessage('Nome deve ser um dos valores permitidos: ADMIN, TRADER, COMMUNITY, MODERATOR, USER, GUEST'),
  body('permissions')
    .optional()
    .isArray().withMessage('Permissões devem ser um array')
    .notEmpty().withMessage('Permissões não podem estar vazias'),
  body('description')
    .optional()
    .isString().withMessage('Descrição deve ser uma string')
];