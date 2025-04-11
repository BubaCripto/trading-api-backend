const Operation = require('../models/Operation');

const checkOperationOwnership = async (req, res, next) => {
  try {
    const operation = await Operation.findById(req.params.id);
    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    if (req.user.role === 'ADMIN' ||
       (req.user.role === 'TRADER' && operation.userId.toString() === req.user._id.toString())) {
      req.operation = operation;
      next();
    } else {
      res.status(403).json({ message: 'Not authorized to modify this operation' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = checkOperationOwnership;