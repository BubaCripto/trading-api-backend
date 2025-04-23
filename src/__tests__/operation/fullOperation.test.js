
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Operation = require('../../models/Operation');
const jwt = require('../../utils/jwt');

let adminToken, traderToken, outsiderToken, otherTraderToken;
let otherTrader;
let trader, outsider, admin;
let ownOperationId, otherOperationId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const adminRole = await Role.findOne({ name: 'ADMIN' });
  const traderRole = await Role.findOne({ name: 'TRADER' });
  const guestRole = await Role.findOne({ name: 'GUEST' });

  admin = await User.create({
    username: 'admin-op',
    email: 'admin@op.com',
    password: '123456',
    roles: [adminRole._id]
  });

  trader = await User.create({
    username: 'trader-op',
    email: 'trader@op.com',
    password: '123456',
    roles: [traderRole._id]
  });

  outsider =  await Role.findOne({ name: 'TRADER' });
  otherTrader = await User.create({
    username: 'trader-abac',
    email: 'trader2@op.com',
    password: '123456',
    roles: [traderRole._id]
  });

  otherTraderToken = jwt.generateToken({ _id: otherTrader._id, roles: ['TRADER'] });

  await User.create({
    username: 'guest-op',
    email: 'guest@op.com',
    password: '123456',
    roles: [guestRole._id]
  });

  adminToken = jwt.generateToken({ _id: admin._id, roles: ['ADMIN'] });
  traderToken = jwt.generateToken({ _id: trader._id, roles: ['TRADER'] });
  outsiderToken = jwt.generateToken({ _id: outsider._id, roles: ['GUEST'] });

  const ownOp = await Operation.create({
    pair: "BTCUSDT",
    signal: "LONG",
    leverage: 3,
    strategy: "Swing",
    risk: "Moderado",
    entry: 100,
    stop: 90,
    targets: [110, 120],
    userId: trader._id,
    username: trader.username,
    history: {}
  });

  const otherOp = await Operation.create({
    pair: "ETHUSDT",
    signal: "SHORT",
    leverage: 2,
    entry: 1600,
    stop: 1650,
    targets: [1550, 1500],
    userId: admin._id,
    username: admin.username,
    history: {}
  });

  ownOperationId = ownOp._id;
  otherOperationId = otherOp._id;
});

afterAll(async () => {
  await Operation.deleteMany({});
  await User.deleteMany({ email: /@op.com$/ });
  await mongoose.disconnect();
});

describe('📘 Testes completos de regras RBAC + ABAC no módulo de operações', () => {
  it('✅ ADMIN pode editar qualquer operação', async () => {
    const res = await request(app)
      .put(`/api/operations/${ownOperationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stop: 88 });

    expect(res.statusCode).toBe(200);
  });

  it('✅ TRADER pode editar sua própria operação', async () => {
    const res = await request(app)
      .put(`/api/operations/${ownOperationId}`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ stop: 85 });

    expect(res.statusCode).toBe(200);
  });

  it('❌ TRADER não pode editar operação de outro usuário', async () => {
    const res = await request(app)
      .put(`/api/operations/${otherOperationId}`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ stop: 100 });

    expect(res.statusCode).toBe(403);
  });

  it('✅ ADMIN pode deletar operação de qualquer trader', async () => {
    const res = await request(app)
      .delete(`/api/operations/${ownOperationId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });

  it('✅ TRADER pode deletar sua própria operação', async () => {
    const op = await Operation.create({
      pair: "SOLUSDT",
      signal: "LONG",
      leverage: 2,
      entry: 30,
      stop: 25,
      targets: [35, 40],
      userId: trader._id,
      username: trader.username,
      history: {}
    });

    const res = await request(app)
      .delete(`/api/operations/${op._id}`)
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.statusCode).toBe(204);
  });

  it('❌ GUEST não pode criar operação (CREATE_OPERATION)', async () => {
    const guestRole = await Role.findOne({ name: 'GUEST' });
    const guestUser = await User.create({
      username: 'guest-final',
      email: 'guestfinal@op.com',
      password: '123456',
      roles: [guestRole._id]
    });
    const guestToken = jwt.generateToken({ _id: guestUser._id, roles: ['GUEST'] });

    const res = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        pair: "ADAUSDT",
        signal: "LONG",
        leverage: 2,
        strategy: "Scalping",
        risk: "Moderado",
        entry: 0.5,
        stop: 0.4,
        targets: [0.55, 0.6]
      });

    expect(res.statusCode).toBe(403);
  });
  it('✅ ADMIN pode editar targets de qualquer operação', async () => {
    const op = await Operation.create({
      pair: "LTCUSDT",
      signal: "LONG",
      leverage: 3,
      entry: 100,
      stop: 90,
      targets: [110, 120],
      userId: trader._id,
      username: trader.username,
      history: {}
    });

    const res = await request(app)
      .patch(`/api/operations/${op._id}/targets`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ targets: [115, 125] });

    expect(res.statusCode).toBe(200);
    expect(res.body.targets).toEqual([115, 125]);
  });

  it('✅ Dono da operação pode editar os targets', async () => {
    const op = await Operation.create({
      pair: "LTCUSDT",
      signal: "LONG",
      leverage: 3,
      entry: 100,
      stop: 90,
      targets: [110, 120],
      userId: trader._id,
      username: trader.username,
      history: {}
    });

    const res = await request(app)
      .patch(`/api/operations/${op._id}/targets`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ targets: [112, 122] });

    expect(res.statusCode).toBe(200);
    expect(res.body.targets).toEqual([112, 122]);
  });

  it('❌ Outro trader não pode editar targets de operação alheia', async () => {
    const op = await Operation.create({
      pair: "LTCUSDT",
      signal: "LONG",
      leverage: 3,
      entry: 100,
      stop: 90,
      targets: [110, 120],
      userId: admin._id,
      username: admin.username,
      history: {}
    });

    const res = await request(app)
      .patch(`/api/operations/${op._id}/targets`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ targets: [114, 124] });

    expect(res.statusCode).toBe(403);
  });

  it('✅ Dono pode solicitar fechamento manual', async () => {
    const op = await Operation.create({
      pair: "AAVEUSDT",
      signal: "SHORT",
      leverage: 2,
      entry: 150,
      stop: 160,
      targets: [145, 140],
      userId: trader._id,
      username: trader.username,
      history: {}
    });

    const res = await request(app)
      .patch(`/api/operations/${op._id}/request-manual-close`)
      .set('Authorization', `Bearer ${traderToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.history.isManualCloseRequested).toBe(true);
  });

  it('✅ ADMIN pode solicitar fechamento manual de qualquer operação', async () => {
    const op = await Operation.create({
      pair: "AAVEUSDT",
      signal: "SHORT",
      leverage: 2,
      entry: 150,
      stop: 160,
      targets: [145, 140],
      userId: trader._id,
      username: trader.username,
      history: {}
    });

    const res = await request(app)
      .patch(`/api/operations/${op._id}/request-manual-close`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.history.isManualCloseRequested).toBe(true);
  });

  it('❌ Outro trader não pode solicitar fechamento manual de operação alheia', async () => {
    const op = await Operation.create({
      pair: "XRPUSDT",
      signal: "SHORT",
      leverage: 2,
      entry: 1,
      stop: 1.1,
      targets: [0.95, 0.9],
      userId: admin._id,
      username: admin.username,
      history: {}
    });

    const res = await request(app)
      .patch(`/api/operations/${op._id}/request-manual-close`)
      .set('Authorization', `Bearer ${traderToken}`);

    expect(res.statusCode).toBe(403);
  });

});
