
const { body } = require('express-validator');
const Operation = require('../../models/Operation');

const MAX_LEVERAGE = 125;
const MAX_CONCURRENT_OPERATIONS = 9999999999999999;

exports.validateCreateOperation = [
  body('signal')
    .isIn(['LONG', 'SHORT']).withMessage('Signal deve ser LONG ou SHORT'),
  body('leverage')
    .isNumeric().withMessage('Leverage deve ser um número')
    .custom(value => value > 0 && value <= MAX_LEVERAGE)
    .withMessage(`Leverage deve estar entre 1 e ${MAX_LEVERAGE}`),
  body('entry')
    .isNumeric().withMessage('Preço de entrada (entry) deve ser numérico')
    .custom(value => value > 0).withMessage('Preço de entrada deve ser positivo'),
  body('stop')
    .isNumeric().withMessage('Stop deve ser numérico')
    .custom(value => value > 0).withMessage('Stop deve ser positivo'),
  body('targets')
    .isArray({ min: 1 }).withMessage('Targets deve ser uma lista de preços')
    .custom(value => value.every(t => t > 0)).withMessage('Todos os targets devem ser positivos'),
  body('strategy').optional().isString(),
  body('risk').optional().isIn(['Baixo', 'Moderado', 'Alto']),
  body('description').optional().isString(),

 

  // Custom validation for concurrent operations limit
  body().custom(async (value, { req }) => {
    const activeOperations = await Operation.countDocuments({
      userId: req.user._id,
      status: { $nin: ['CLOSED', 'CANCELLED'] }
    });
    if (activeOperations >= MAX_CONCURRENT_OPERATIONS) {
      throw new Error('Limite máximo de operações simultâneas atingido');
    }
    return true;
  })
];

// Update validation remains the same
exports.validateUpdateOperation = [
  body('entry').optional().isNumeric(),
  body('stop').optional().isNumeric(),
  body('signal').optional().isIn(['LONG', 'SHORT']),
  body('strategy').optional().isString(),
  body('risk').optional().isIn(['Baixo', 'Moderado', 'Alto']),
  body('description').optional().isString(),
  body('leverage').optional().isNumeric()
];
