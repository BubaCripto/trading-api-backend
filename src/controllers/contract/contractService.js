const Contract = require('../../models/Contract');
const Community = require('../../models/Community');
const User = require('../../models/User');

async function requestContract({ communityId, traderId, terms }, requester) {
  const community = await Community.findById(communityId);
  if (!community || !community.active) {
    throw { status: 404, message: 'Comunidade não encontrada ou inativa' };
  }

  if (community.userId.toString() !== requester._id.toString()) {
    throw { status: 403, message: 'Apenas o dono da comunidade pode solicitar contratos' };
  }

  const trader = await User.findById(traderId).populate('roles');
  const isTrader = trader?.roles?.some(role => role.name === 'TRADER');
  if (!isTrader) {
    throw { status: 400, message: 'Usuário selecionado não é um trader válido' };
  }

  const existing = await Contract.findOne({
    community: communityId,
    trader: traderId,
    status: { $in: ['PENDING', 'ACCEPTED'] }
  });

  if (existing) {
    throw { status: 409, message: 'Contrato já existente entre essa comunidade e trader' };
  }

  const contract = await Contract.create({
    community: communityId,
    trader: traderId,
    terms,
    communityAccepted: true,
    createdBy: requester._id
  });

  return contract;
}

async function acceptContract(contractId, user) {
  const contract = await Contract.findById(contractId);

  if (!contract) throw { status: 404, message: 'Contrato não encontrado' };
  if (contract.status !== 'PENDING') throw { status: 400, message: 'Contrato já processado' };
  if (contract.trader.toString() !== user._id.toString())
    throw { status: 403, message: 'Apenas o trader convidado pode aceitar' };
  if (!contract.communityAccepted)
    throw { status: 400, message: 'A comunidade ainda não confirmou este contrato' };

  contract.traderAccepted = true;
  contract.status = 'ACCEPTED';
  await contract.save();

  await Community.updateOne(
    { _id: contract.community },
    { $addToSet: { hiredTraders: user._id } }
  );

  return contract;
}

async function rejectContract(contractId, user) {
  const contract = await Contract.findById(contractId);

  if (!contract) throw { status: 404, message: 'Contrato não encontrado' };
  if (contract.status !== 'PENDING') throw { status: 400, message: 'Contrato já processado' };
  if (contract.trader.toString() !== user._id.toString())
    throw { status: 403, message: 'Apenas o trader convidado pode rejeitar' };

  contract.traderAccepted = false;
  contract.status = 'REJECTED';
  await contract.save();

  return contract;
}

async function revokeContract(contractId, user) {
  const contract = await Contract.findById(contractId);

  if (!contract) throw { status: 404, message: 'Contrato não encontrado' };
  const isCommunityOwner = contract.createdBy.toString() === user._id.toString();
  const isTrader = contract.trader.toString() === user._id.toString();

  if (!isCommunityOwner && !isTrader) {
    throw { status: 403, message: 'Apenas o trader ou a comunidade pode revogar este contrato' };
  }

  if (contract.status !== 'ACCEPTED' && contract.status !== 'PENDING') {
    throw { status: 400, message: 'Contrato não está em estado revogável' };
  }

  contract.status = 'REVOKED';
  contract.revokedBy = user._id;
  contract.revokedAt = new Date();
  await contract.save();

  await Community.updateOne(
    { _id: contract.community },
    { $pull: { hiredTraders: contract.trader } }
  );

  return contract;
}

async function getContracts(user) {
  // Verificar se o usuário é administrador
  const isAdmin = hasAdminRole(user);
  
  // Se for admin, retorna todos os contratos
  // Caso contrário, retorna apenas os contratos do usuário
  const query = isAdmin 
    ? {} 
    : {
        $or: [
          { trader: user._id },
          { createdBy: user._id }
        ]
      };
  
  const contracts = await Contract.find(query)
    .populate('community', 'name description')
    .populate('trader', 'username email')
    .populate('createdBy', 'username email')
    .sort({ createdAt: -1 });

  return contracts;
}

// Função para verificar se o usuário tem role de ADMIN
function hasAdminRole(user) { 
  return user.roles?.some(role => { 
    if (typeof role === 'string') return role === 'ADMIN'; 
    if (typeof role === 'object' && role.name) return role.name === 'ADMIN'; 
    return false; 
  }); 
}

module.exports = {
  requestContract,
  acceptContract,
  rejectContract,
  revokeContract,
  getContracts,
  hasAdminRole // Exportando a função para uso em outros lugares se necessário
};
