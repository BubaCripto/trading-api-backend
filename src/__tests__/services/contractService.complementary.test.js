
require('dotenv').config();
const mongoose = require('mongoose');
const contractService = require('../../controllers/contract/contractService');

const User = require('../../../src/models/User');
const Role = require('../../../src/models/Role');
const Community = require('../../../src/models/Community');
const Contract = require('../../../src/models/contract');

describe('📦 Service: contractService (complementares)', () => {
  let owner, trader, outsider, inactiveCommunity, community;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const roleCommunity = await Role.findOne({ name: 'COMMUNITY' });
    const roleTrader = await Role.findOne({ name: 'TRADER' });

    owner = await User.create({
      username: 'owner2',
      email: 'owner2@mail.com',
      password: '123456',
      roles: [roleCommunity._id]
    });

    trader = await User.create({
      username: 'trader2',
      email: 'trader2@mail.com',
      password: '123456',
      roles: [roleTrader._id]
    });

    outsider = await User.create({
      username: 'outsider2',
      email: 'outsider2@mail.com',
      password: '123456',
      roles: []
    });

    community = await Community.create({
      name: 'Ativa',
      userId: owner._id,
      createdBy: owner._id,
      active: true
    });

    inactiveCommunity = await Community.create({
      name: 'Inativa',
      userId: owner._id,
      createdBy: owner._id,
      active: false
    });
  });

  afterAll(async () => {
    await Contract.deleteMany({});
    await Community.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('❌ deve recusar contrato com comunidade inativa', async () => {
    await expect(contractService.requestContract({
      communityId: inactiveCommunity._id,
      traderId: trader._id,
      terms: 'Contrato com inativa'
    }, owner)).rejects.toMatchObject({ status: 404 });
  });

  it('❌ deve recusar contrato se não for dono da comunidade', async () => {
    await expect(contractService.requestContract({
      communityId: community._id,
      traderId: trader._id,
      terms: 'Tentativa de fora'
    }, outsider)).rejects.toMatchObject({ status: 403 });
  });

  it('❌ deve recusar contrato se trader não tiver role TRADER', async () => {
    await expect(contractService.requestContract({
      communityId: community._id,
      traderId: outsider._id,
      terms: 'Sem permissão'
    }, owner)).rejects.toMatchObject({ status: 400 });
  });

  it('✅ deve buscar contratos filtrando por status', async () => {
    const contract = await contractService.requestContract({
      communityId: community._id,
      traderId: trader._id,
      terms: 'Filtro por status'
    }, owner);

    await contractService.acceptContract(contract._id, trader);
    await contractService.revokeContract(contract._id, trader);

    const result = await contractService.getContracts({ status: 'REVOKED' }, trader);
    expect(result.every(c => c.status === 'REVOKED')).toBe(true);
  });

  it('❌ não deve permitir revogar contrato já revogado', async () => {
    const contract = await contractService.requestContract({
      communityId: community._id,
      traderId: trader._id,
      terms: 'Para revogar duas vezes'
    }, owner);

    await contractService.acceptContract(contract._id, trader);
    await contractService.revokeContract(contract._id, trader);

    await expect(contractService.revokeContract(contract._id, trader))
      .rejects.toMatchObject({ status: 400 });
  });

  it('❌ deve impedir aceitar contrato se comunidade ainda não confirmou', async () => {
    const pending = await Contract.create({
      community: community._id,
      trader: trader._id,
      terms: 'Teste sem confirmação',
      createdBy: owner._id,
      communityAccepted: false
    });

    await expect(contractService.acceptContract(pending._id, trader))
      .rejects.toMatchObject({ status: 400 });
  });
});
