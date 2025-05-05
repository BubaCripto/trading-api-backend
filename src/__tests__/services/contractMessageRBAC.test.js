
require('dotenv').config();
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

const User = require('../../../src/models/User');
const Role = require('../../../src/models/Role');
const Community = require('../../../src/models/Community');
const Contract = require('../../../src/models/Contract');
const ContractMessage = require('../../../src/models/ContractMessage');
const jwt = require('../../../src/utils/jwt');

describe('🔐 RBAC em mensagens de contrato', () => {
  let owner, trader, tokenOwner, tokenTrader;
  let otherOwner, otherTrader, tokenOtherOwner, tokenOtherTrader, otherContract;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const roleCommunity = await Role.findOne({ name: 'COMMUNITY' });
    const roleTrader = await Role.findOne({ name: 'TRADER' });

    owner = await User.create({
      username: 'owner-msg-rbac',
      email: 'owner-msg-rbac@mail.com',
      password: '123456',
      roles: [roleCommunity._id]
    });

    trader = await User.create({
      username: 'trader-msg-rbac',
      email: 'trader-msg-rbac@mail.com',
      password: '123456',
      roles: [roleTrader._id]
    });

    const community = await Community.create({
      name: 'Comunidade RBAC',
      userId: owner._id,
      createdBy: owner._id,
      active: true
    });

    const contract = await Contract.create({
      community: community._id,
      trader: trader._id,
      terms: 'Contrato de teste RBAC',
      communityAccepted: true,
      traderAccepted: true,
      status: 'ACCEPTED',
      createdBy: owner._id
    });

    tokenOwner = jwt.generateToken({ _id: owner._id, roles: ['COMMUNITY'] });
    tokenTrader = jwt.generateToken({ _id: trader._id, roles: ['TRADER'] });

    otherOwner = await User.create({
      username: 'other-owner',
      email: 'other-owner@mail.com',
      password: '123456',
      roles: [roleCommunity._id]
    });

    otherTrader = await User.create({
      username: 'other-trader',
      email: 'other-trader@mail.com',
      password: '123456',
      roles: [roleTrader._id]
    });

    const otherCommunity = await Community.create({
      name: 'Outra Comunidade',
      userId: otherOwner._id,
      createdBy: otherOwner._id,
      active: true
    });

    otherContract = await Contract.create({
      community: otherCommunity._id,
      trader: otherTrader._id,
      terms: 'Contrato RBAC',
      communityAccepted: true,
      traderAccepted: true,
      status: 'ACCEPTED',
      createdBy: otherOwner._id
    });

    tokenOtherOwner = jwt.generateToken({ _id: otherOwner._id, roles: ['COMMUNITY'] });
    tokenOtherTrader = jwt.generateToken({ _id: otherTrader._id, roles: ['TRADER'] });
  });

  afterAll(async () => {
    await ContractMessage.deleteMany({});
    await Contract.deleteMany({});
    await Community.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('❌ TRADER de outro contrato não deve acessar mensagens', async () => {
    const res = await request(app)
      .get(`/contracts/${otherContract._id}/messages`)
      .set('Authorization', `Bearer ${tokenTrader}`);
    expect(res.statusCode).toBe(403);
  });

  it('❌ OWNER de outro contrato não deve acessar mensagens', async () => {
    const res = await request(app)
      .get(`/contracts/${otherContract._id}/messages`)
      .set('Authorization', `Bearer ${tokenOwner}`);
    expect(res.statusCode).toBe(403);
  });

  it('❌ TRADER de outro contrato não deve marcar mensagem como lida', async () => {
    const msg = await ContractMessage.create({
      contract: otherContract._id,
      sender: otherOwner._id,
      message: 'Msg outra comunidade'
    });

    const res = await request(app)
      .patch(`/contracts/messages/${msg._id}/read`)
      .set('Authorization', `Bearer ${tokenTrader}`);
    expect(res.statusCode).toBe(403);
  });

  it('❌ OWNER de outro contrato não deve marcar mensagem como lida', async () => {
    const msg = await ContractMessage.create({
      contract: otherContract._id,
      sender: otherTrader._id,
      message: 'Msg trader de fora'
    });

    const res = await request(app)
      .patch(`/contracts/messages/${msg._id}/read`)
      .set('Authorization', `Bearer ${tokenOwner}`);
    expect(res.statusCode).toBe(403);
  });
});
