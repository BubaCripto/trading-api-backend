const profileValidator = require('../controllers/user/validators/profileValidator');

function validateProfileCreation(req, res, next) {
  try {
    req.body = profileValidator.validateCreate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: error.message, details: error.details });
  }
}

function validateProfileUpdate(req, res, next) {
  try {
    req.body = profileValidator.validateUpdate(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: error.message, details: error.details });
  }
}

module.exports = {
  validateProfileCreation,
  validateProfileUpdate
};
