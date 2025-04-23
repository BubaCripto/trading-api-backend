const { body } = require('express-validator');

/**
 * Validação para criação de comunidades
 */
exports.validateCreateCommunity = [
  body('name')
    .trim()
    .notEmpty().withMessage('O nome da comunidade é obrigatório.')
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres.'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('A descrição pode ter no máximo 500 caracteres.'),
  body('telegramLink')
    .optional()
    .isURL().withMessage('O link do Telegram deve ser uma URL válida.'),
  body('discordLink')
    .optional()
    .isURL().withMessage('O link do Discord deve ser uma URL válida.'),
  body('bannerImage')
    .optional()
    .isURL().withMessage('A imagem de capa deve ser uma URL válida.'),
  body('category')
    .optional()
    .isString().withMessage('A categoria deve ser uma string.'),
  body('isPrivate')
    .optional()
    .isBoolean().withMessage('isPrivate deve ser verdadeiro ou falso.')
];

/**
 * Validação para atualização de comunidades
 */
exports.validateUpdateCommunity = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres.'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('A descrição pode ter no máximo 500 caracteres.'),
  body('telegramLink')
    .optional()
    .isURL().withMessage('O link do Telegram deve ser uma URL válida.'),
  body('discordLink')
    .optional()
    .isURL().withMessage('O link do Discord deve ser uma URL válida.'),
  body('bannerImage')
    .optional()
    .isURL().withMessage('A imagem de capa deve ser uma URL válida.'),
  body('category')
    .optional()
    .isString().withMessage('A categoria deve ser uma string.'),
  body('isPrivate')
    .optional()
    .isBoolean().withMessage('isPrivate deve ser verdadeiro ou falso.')
];
