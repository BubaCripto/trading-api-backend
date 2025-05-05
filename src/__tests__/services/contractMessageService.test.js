
require('dotenv').config();
const mongoose = require('mongoose');
const contractMessageService = require('../../controllers/contract/contractMessageService');
const Contract = require('../../models/Contract');
const ContractMessage = require('../../models/ContractMessage');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Community = require('../../models/Community');

describe('📬 ContractMessage Service', () => {
  let owner, trader, outsider, contract;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const roleCommunity = await Role.findOne({ name: 'COMMUNITY' });
    const roleTrader = await Role.findOne({ name: 'TRADER' });

    owner = await User.create({
      username: 'owner-msg',
      email: 'owner-msg@mail.com',
      password: '123456',
      roles: [roleCommunity._id]
    });

    trader = await User.create({
      username: 'trader-msg',
      email: 'trader-msg@mail.com',
      password: '123456',
      roles: [roleTrader._id]
    });

    outsider = await User.create({
      username: 'outsider-msg',
      email: 'x-msg@mail.com',
      password: '123456',
      roles: []
    });

    const community = await Community.create({
      name: 'Community Msg',
      userId: owner._id,
      createdBy: owner._id,
      active: true
    });

    contract = await Contract.create({
      community: community._id,
      trader: trader._id,
      terms: 'Contrato de testes',
      communityAccepted: true,
      traderAccepted: true,
      status: 'ACCEPTED',
      createdBy: owner._id
    });
  });

  afterAll(async () => {
    await ContractMessage.deleteMany({});
    await Contract.deleteMany({});
    await Community.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('✅ deve permitir envio de mensagem entre envolvidos no contrato', async () => {
    const msg = await contractMessageService.sendMessage({
      contractId: contract._id,
      message: 'Olá, começamos hoje?'
    }, trader);

    expect(msg).toHaveProperty('_id');
    expect(msg.message).toBe('Olá, começamos hoje?');
  });

  it('❌ deve recusar mensagem para contrato inexistente', async () => {
    await expect(contractMessageService.sendMessage({
      contractId: new mongoose.Types.ObjectId(),
      message: 'Mensagem inválida'
    }, trader)).rejects.toMatchObject({ status: 404 });
  });

  it('❌ deve recusar envio por usuário não envolvido', async () => {
    await expect(contractMessageService.sendMessage({
      contractId: contract._id,
      message: 'Intruso aqui'
    }, outsider)).rejects.toMatchObject({ status: 403 });
  });

  it('✅ deve listar mensagens de contrato corretamente', async () => {
    await contractMessageService.sendMessage({
      contractId: contract._id,
      message: 'Verifique a estratégia'
    }, owner);

    const messages = await contractMessageService.getMessagesByContract(contract._id, trader);
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
  });

  it('✅ deve marcar uma mensagem como lida', async () => {
    const created = await contractMessageService.sendMessage({
      contractId: contract._id,
      message: 'Marcar como lida'
    }, owner);

    const read = await contractMessageService.markMessageAsRead(created._id, trader);
    expect(read.read).toBe(true);
  });
});
