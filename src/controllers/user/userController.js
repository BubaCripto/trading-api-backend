
const userService = require('./userService');

exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.user, req);
    res.status(200).json({
      data: result.data,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user._id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updated = await userService.updateUser(req.params.id, req.body, req.user);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
