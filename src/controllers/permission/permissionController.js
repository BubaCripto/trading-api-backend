const permissionService = require('./permissionService');

exports.getAllPermissions = async (req, res) => {
  try {
    const result = await permissionService.getAllPermissions(req);
    res.json({
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno', error: error.message });
  }
};

exports.getPermissionById = async (req, res, next) => {
  try {
    const permission = await permissionService.getPermissionById(req.params.id);
    res.status(200).json({
      data: permission
    });
  } catch (err) {
    next(err);
  }
};

exports.createPermission = async (req, res, next) => {
  try {
    const permission = await permissionService.createPermission(req.body);
    res.status(201).json({
      message: 'Permissão criada com sucesso',
      data: permission
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePermission = async (req, res, next) => {
  try {
    const permission = await permissionService.updatePermission(req.params.id, req.body);
    res.status(200).json({
      message: 'Permissão atualizada com sucesso',
      data: permission
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePermission = async (req, res, next) => {
  try {
    const result = await permissionService.deletePermission(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};