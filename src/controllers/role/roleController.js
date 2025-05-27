const roleService = require('./roleService');

exports.getAllRoles = async (req, res) => {
  try {
    const result = await roleService.getAllRoles(req);
    res.json({
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoleById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    res.status(200).json({
      data: role
    });
  } catch (err) {
    next(err);
  }
};

exports.createRole = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json({
      message: 'Role criada com sucesso',
      data: role
    });
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    res.status(200).json({
      message: 'Role atualizada com sucesso',
      data: role
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const result = await roleService.deleteRole(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};