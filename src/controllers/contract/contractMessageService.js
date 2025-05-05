const Contract = require('../../models/Contract');
const ContractMessage = require('../../models/ContractMessage');

async function sendMessage({ contractId, message }, sender) {
  const contract = await Contract.findById(contractId);
  if (!contract) throw { status: 404, message: 'Contrato não encontrado' };

  const isAllowed = [contract.trader.toString(), contract.createdBy.toString()].includes(sender._id.toString());
  if (!isAllowed) {
    throw { status: 403, message: 'Você não faz parte deste contrato' };
  }

  const newMessage = await ContractMessage.create({
    contract: contract._id,
    sender: sender._id,
    message
  });

  return newMessage;
}

async function getMessagesByContract(contractId, user) {
  const contract = await Contract.findById(contractId);
  if (!contract) throw { status: 404, message: 'Contrato não encontrado' };

  const isAllowed = [contract.trader.toString(), contract.createdBy.toString()].includes(user._id.toString());
  if (!isAllowed) {
    throw { status: 403, message: 'Acesso negado às mensagens deste contrato' };
  }

  return ContractMessage.find({ contract: contractId })
    .populate('sender', 'username')
    .sort({ createdAt: 1 });
}

async function markMessageAsRead(messageId, user) {
  const message = await ContractMessage.findById(messageId).populate('contract');

  if (!message) throw { status: 404, message: 'Mensagem não encontrada' };

  const contract = message.contract;
  const isAllowed = [contract.trader.toString(), contract.createdBy.toString()].includes(user._id.toString());
  if (!isAllowed) {
    throw { status: 403, message: 'Você não pode alterar esta mensagem' };
  }

  message.read = true;
  await message.save();

  return message;
}

module.exports = {
  sendMessage,
  getMessagesByContract,
  markMessageAsRead
};
