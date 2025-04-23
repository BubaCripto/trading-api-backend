
const { body } = require('express-validator');

exports.validateRegister = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail().withMessage('Invalid email'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('roles')
    .isArray().withMessage('Roles must be an array'),
  body('profile.fullName')
    .notEmpty().withMessage('Full name is required'),
  body('profile.phone')
    .optional().isString().withMessage('Phone must be a string'),
  body('profile.documentId')
    .optional().isString().withMessage('Document ID must be a string')
];

exports.validateLogin = [
  body('email')
    .isEmail().withMessage('Invalid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
];
