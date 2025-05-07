require('dotenv').config(); // ← Adicione isso no topo!
const mongoose = require('mongoose');
const contractService = require('../../controllers/contract/contractService');

const User = require('../../../src/models/User');
const Role = require('../../../src/models/Role');
const Community = require('../../../src/models/Community');
const Contract = require('../../../src/models/Contract');

describe('📦 Service: contractService', () => {
  let owner, trader, outsider, community, contract;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const roleCommunity = await Role.findOne({ name: 'COMMUNITY' });
    const roleTrader = await Role.findOne({ name: 'TRADER' });

    owner = await User.create({
      username: 'owner',
      email: 'owner@mail.com',
      password: '123456',
      roles: [roleCommunity._id]
    });

    trader = await User.create({
      username: 'trader',
      email: 'trader@mail.com',
      password: '123456',
      roles: [roleTrader._id]
    });

    outsider = await User.create({
      username: 'outsider',
      email: 'x@mail.com',
      password: '123456',
      roles: []
    });

    community = await Community.create({
      name: 'Test Community',
      userId: owner._id,
      createdBy: owner._id,
      active: true
    });
  });

  afterAll(async () => {
    //await Contract.deleteMany({});
    //await Community.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('✅ deve criar contrato com sucesso', async () => {
    contract = await contractService.requestContract({
      communityId: community._id,
      traderId: trader._id,
      terms: 'Regras do contrato'
    }, owner);

    expect(contract).toHaveProperty('_id');
    expect(contract.terms).toBe('Regras do contrato');
    expect(contract.status).toBe('PENDING');
  });

  it('❌ deve impedir criação duplicada', async () => {
    await expect(contractService.requestContract({
      communityId: community._id,
      traderId: trader._id,
      terms: 'Duplicado'
    }, owner)).rejects.toMatchObject({ status: 409 });
  });

  it('✅ trader deve aceitar o contrato', async () => {
    const accepted = await contractService.acceptContract(contract._id, trader);
    expect(accepted.status).toBe('ACCEPTED');
    expect(accepted.traderAccepted).toBe(true);
  });

  it('❌ não pode aceitar contrato já aceito', async () => {
    await expect(contractService.acceptContract(contract._id, trader))
      .rejects.toMatchObject({ status: 400 });
  });

  it('✅ trader pode revogar contrato aceito', async () => {
    const revoked = await contractService.revokeContract(contract._id, trader);
    expect(revoked.status).toBe('REVOKED');
    expect(revoked.revokedBy.toString()).toBe(trader._id.toString());
  });

  it('❌ outsider não pode revogar contrato', async () => {
    await expect(contractService.revokeContract(contract._id, outsider))
      .rejects.toMatchObject({ status: 403 });
  });

  it('✅ deve buscar contratos do usuário', async () => {
    const result = await contractService.getContracts( owner);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('status');
  });
});
