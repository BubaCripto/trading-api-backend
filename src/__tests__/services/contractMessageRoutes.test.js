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

describe('📬 ContractMessage Routes', () => {
  let tokenOwner, tokenTrader, tokenOutsider, contract, owner, trader;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const roleCommunity = await Role.findOne({ name: 'COMMUNITY' });
    const roleTrader = await Role.findOne({ name: 'TRADER' });

    owner = await User.create({
      username: 'owner-msg-route',
      email: 'owner-msg-route@mail.com',
      password: '123456',
      roles: [roleCommunity._id]
    });

    trader = await User.create({
      username: 'trader-msg-route',
      email: 'trader-msg-route@mail.com',
      password: '123456',
      roles: [roleTrader._id]
    });

    const outsider = await User.create({
      username: 'outsider-msg-route',
      email: 'x-msg-route@mail.com',
      password: '123456',
      roles: []
    });

    const community = await Community.create({
      name: 'Community Route',
      userId: owner._id,
      createdBy: owner._id,
      active: true
    });

    contract = await Contract.create({
      community: community._id,
      trader: trader._id,
      terms: 'Contrato rota teste',
      communityAccepted: true,
      traderAccepted: true,
      status: 'ACCEPTED',
      createdBy: owner._id
    });

    tokenOwner = jwt.generateToken({ _id: owner._id, roles: ['COMMUNITY'] });
    tokenTrader = jwt.generateToken({ _id: trader._id, roles: ['TRADER'] });
    tokenOutsider = jwt.generateToken({ _id: outsider._id, roles: ['USER'] });
  });

  afterAll(async () => {
    await ContractMessage.deleteMany({});
    await Contract.deleteMany({});
    await Community.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('✅ deve permitir que trader envie mensagem via rota', async () => {
    const res = await request(app)
      .post(`/contracts/${contract._id}/messages`)
      .set('Authorization', `Bearer ${tokenTrader}`)
      .send({ message: 'Mensagem via rota' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });

  it('❌ deve impedir envio por usuário não envolvido via rota', async () => {
    const res = await request(app)
      .post(`/contracts/${contract._id}/messages`)
      .set('Authorization', `Bearer ${tokenOutsider}`)
      .send({ message: 'Sou intruso' });

    expect(res.statusCode).toBe(403);
  });

  it('✅ deve listar mensagens do contrato via rota', async () => {
    const res = await request(app)
      .get(`/contracts/${contract._id}/messages`)
      .set('Authorization', `Bearer ${tokenOwner}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('✅ deve permitir marcar mensagem como lida via rota', async () => {
    const nova = await ContractMessage.create({
      contract: contract._id,
      sender: owner._id,
      message: 'Ler via rota'
    });

    const res = await request(app)
      .patch(`/contracts/messages/${nova._id}/read`)
      .set('Authorization', `Bearer ${tokenTrader}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it('❌ deve retornar 404 ao tentar listar mensagens de contrato inexistente', async () => {
    const res = await request(app)
      .get(`/contracts/000000000000000000000000/messages`)
      .set('Authorization', `Bearer ${tokenTrader}`);
    expect(res.statusCode).toBe(404);
  });

  it('❌ deve retornar 403 ao tentar acessar mensagens de contrato de terceiros', async () => {
    const res = await request(app)
      .get(`/contracts/${contract._id}/messages`)
      .set('Authorization', `Bearer ${tokenOutsider}`);
    expect(res.statusCode).toBe(403);
  });

  it('❌ deve retornar 404 ao tentar marcar mensagem inexistente como lida', async () => {
    const res = await request(app)
      .patch(`/contracts/messages/000000000000000000000000/read`)
      .set('Authorization', `Bearer ${tokenTrader}`);
    expect(res.statusCode).toBe(404);
  });

  it('❌ deve retornar 403 ao tentar marcar como lida mensagem de contrato que não pertence ao usuário', async () => {
    const msg = await ContractMessage.create({
      contract: contract._id,
      sender: owner._id,
      message: 'Mensagem oculta'
    });

    const res = await request(app)
      .patch(`/contracts/messages/${msg._id}/read`)
      .set('Authorization', `Bearer ${tokenOutsider}`);
    expect(res.statusCode).toBe(403);
  });
});
