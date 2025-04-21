
const { body } = require('express-validator');

exports.validateRegister = [
  body('username')
    .notEmpty().withMessage('Username é obrigatório')
    .isLength({ min: 3 }).withMessage('Username deve ter pelo menos 3 caracteres'),
  body('email')
    .isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres'),
  body('roles')
    .isArray().withMessage('Roles deve ser um array'),
  body('profile.nomeCompleto')
    .notEmpty().withMessage('Nome completo é obrigatório'),
  body('profile.telefone')
    .optional().isString().withMessage('Telefone deve ser uma string'),
  body('profile.documento')
    .optional().isString().withMessage('Documento deve ser uma string')
];

exports.validateLogin = [
  body('email')
    .isEmail().withMessage('Email inválido'),
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
];
