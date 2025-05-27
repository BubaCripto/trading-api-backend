const Permission = require('../../models/Permission');
const { NotFoundError } = require('../../utils/errors');
const paginateQuery = require('../../utils/paginateQuery');

exports.getAllPermissions = async (req) => {
  return await paginateQuery(Permission, req, {
    baseFilter: {}, 
    select: '-__v',
    defaultSort: '-createdAt'
  });
};

exports.getPermissionById = async (id) => {
  const permission = await Permission.findById(id);
  if (!permission) {
    throw new NotFoundError('Permissão não encontrada');
  }
  return permission;
};

exports.createPermission = async (permissionData) => {
  // Verificar se já existe uma permissão com o mesmo nome
  const existingPermission = await Permission.findOne({ name: permissionData.name });
  if (existingPermission) {
    throw new Error('Já existe uma permissão com este nome');
  }
  
  const permission = new Permission(permissionData);
  await permission.save();
  return permission;
};

exports.updatePermission = async (id, permissionData) => {
  const permission = await Permission.findById(id);
  if (!permission) {
    throw new NotFoundError('Permissão não encontrada');
  }
  
  // Não permitimos alterar o nome da permissão, apenas a descrição
  if (permissionData.name && permissionData.name !== permission.name) {
    throw new Error('Não é possível alterar o nome de uma permissão existente');
  }
  
  // Atualizar apenas a descrição
  if (permissionData.description) {
    permission.description = permissionData.description;
  }
  
  await permission.save();
  return permission;
};

exports.deletePermission = async (id) => {
  const permission = await Permission.findById(id);
  if (!permission) {
    throw new NotFoundError('Permissão não encontrada');
  }
  
  // Verificar se a permissão está em uso por alguma role
  // Implementar esta verificação quando necessário
  
  await Permission.findByIdAndDelete(id);
  return { message: 'Permissão removida com sucesso' };
};