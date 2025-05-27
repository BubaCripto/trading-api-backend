const Role = require('../../models/Role');
const Permission = require('../../models/Permission');
const { NotFoundError } = require('../../utils/errors');
const paginateQuery = require('../../utils/paginateQuery');

exports.getAllRoles = async (req) => {
  return await paginateQuery(Role, req, {
    baseFilter: {}, 
    select: '-__v',
    defaultSort: '-createdAt',
    populate: 'permissions'
  });
};

exports.getRoleById = async (id) => {
  const role = await Role.findById(id).populate('permissions');
  if (!role) {
    throw new NotFoundError('Role não encontrada');
  }
  return role;
};

exports.createRole = async (roleData) => {
  // Verificar se já existe uma role com o mesmo nome
  const existingRole = await Role.findOne({ name: roleData.name });
  if (existingRole) {
    throw new Error('Já existe uma role com este nome');
  }
  
  // Verificar se todas as permissões existem
  if (roleData.permissions && roleData.permissions.length > 0) {
    const permissionsExist = await Permission.countDocuments({
      _id: { $in: roleData.permissions }
    });
    
    if (permissionsExist !== roleData.permissions.length) {
      throw new Error('Uma ou mais permissões não existem');
    }
  }
  
  const role = new Role(roleData);
  await role.save();
  return role;
};

exports.updateRole = async (id, roleData) => {
  const role = await Role.findById(id);
  if (!role) {
    throw new NotFoundError('Role não encontrada');
  }
  
  // Se estiver tentando mudar o nome, verificar se já existe outra role com este nome
  if (roleData.name && roleData.name !== role.name) {
    const existingRole = await Role.findOne({ name: roleData.name });
    if (existingRole) {
      throw new Error('Já existe uma role com este nome');
    }
  }
  
  // Verificar se todas as permissões existem
  if (roleData.permissions && roleData.permissions.length > 0) {
    const permissionsExist = await Permission.countDocuments({
      _id: { $in: roleData.permissions }
    });
    
    if (permissionsExist !== roleData.permissions.length) {
      throw new Error('Uma ou mais permissões não existem');
    }
  }
  
  Object.assign(role, roleData);
  await role.save();
  return role;
};

exports.deleteRole = async (id) => {
  const role = await Role.findById(id);
  if (!role) {
    throw new NotFoundError('Role não encontrada');
  }
  
  // Verificar se a role está em uso por algum usuário
  // Implementar esta verificação se necessário
  
  await Role.findByIdAndDelete(id);
  return { message: 'Role removida com sucesso' };
};