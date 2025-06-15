const Feedback = require('../../models/Feedback');
const Contract = require('../../models/Contract');
const Community = require('../../models/Community');
const User = require('../../models/User');

async function createFeedback(data, user) {
  // Verificar se o contrato existe e está fechado
  const contract = await Contract.findById(data.contractId);
  if (!contract) {
    throw { status: 404, message: 'Contrato não encontrado' };
  }
  
  if (contract.status !== 'CLOSED') {
    throw { status: 400, message: 'Apenas contratos fechados podem receber feedback' };
  }
  
  // Verificar se o usuário tem permissão para dar feedback
  const isCommunityOwner = contract.createdBy.toString() === user._id.toString();
  const isTrader = contract.trader.toString() === user._id.toString();
  
  if (!isCommunityOwner && !isTrader) {
    throw { status: 403, message: 'Apenas participantes do contrato podem dar feedback' };
  }
  
  // Determinar o tipo de avaliador e avaliado
  let reviewerType, reviewedType, reviewedId;
  
  if (isCommunityOwner) {
    reviewerType = 'COMMUNITY';
    reviewedType = 'TRADER';
    reviewedId = contract.trader;
  } else {
    reviewerType = 'TRADER';
    reviewedType = 'COMMUNITY';
    // Buscar o ID da comunidade
    const community = await Community.findById(contract.community);
    reviewedId = community.userId; // Assumindo que a comunidade tem um campo userId que é o dono
  }
  
  // Verificar se já existe um feedback deste avaliador para este contrato
  const existingFeedback = await Feedback.findOne({
    contractId: data.contractId,
    reviewerId: user._id,
    reviewerType
  });
  
  if (existingFeedback) {
    throw { status: 409, message: 'Você já deu feedback para este contrato' };
  }
  
  // Criar o feedback
  const feedback = await Feedback.create({
    contractId: data.contractId,
    reviewerId: user._id,
    reviewerType,
    reviewedId,
    reviewedType,
    scores: data.scores,
    experiencia: data.experiencia || '',
    melhorar: data.melhorar || '',
    denuncia: data.denuncia || ''
  });
  
  return feedback;
}

async function getFeedbacksByContract(contractId) {
  // Verificar se o contrato existe
  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw { status: 404, message: 'Contrato não encontrado' };
  }
  
  // Buscar os feedbacks
  const feedbacks = await Feedback.find({ contractId })
    .populate('reviewerId', 'username email')
    .populate('reviewedId', 'username email')
    .sort({ createdAt: -1 });
  
  return feedbacks;
}

async function getFeedbacksByUser(userId) {
  // Buscar os feedbacks onde o usuário foi avaliado
  const feedbacks = await Feedback.find({ reviewedId: userId })
    .populate('contractId')
    .populate('reviewerId', 'username email')
    .sort({ createdAt: -1 });
  
  return feedbacks;
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
  createFeedback,
  getFeedbacksByContract,
  getFeedbacksByUser,
  hasAdminRole
};