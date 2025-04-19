// middlewares/userValidation.js
const userValidator = require('../controllers/user/validators/userValidator');

function validateUserCreation(req, res, next) {
  try {
    req.body = userValidator.validateCreate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: error.message, details: error.details });
  }
}

function validateUserUpdate(req, res, next) {
  try {
    req.body = userValidator.validateUpdate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: error.message, details: error.details });
  }
}

module.exports = {
  validateUserCreation,
  validateUserUpdate
};
