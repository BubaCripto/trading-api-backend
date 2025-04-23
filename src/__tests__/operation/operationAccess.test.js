
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Operation = require('../../models/Operation');
const jwt = require('../../utils/jwt');

let adminToken, traderToken, outsiderToken;
let operationId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const adminRole = await Role.findOne({ name: 'ADMIN' });
  const traderRole = await Role.findOne({ name: 'TRADER' });
  const userRole = await Role.findOne({ name: 'GUEST' });

  const admin = await User.create({
    username: 'adminuser',
    email: 'admin@test.com',
    password: '123456',
    roles: [adminRole._id]
  });

  const trader = await User.create({
    username: 'traderuser',
    email: 'trader@test.com',
    password: '123456',
    roles: [traderRole._id]
  });

  const outsider = await User.create({
    username: 'outsider',
    email: 'outsider@test.com',
    password: '123456',
    roles: [userRole._id]
  });

  adminToken = jwt.generateToken({ _id: admin._id, roles: ['ADMIN'] });
  traderToken = jwt.generateToken({ _id: trader._id, roles: ['TRADER'] });
  outsiderToken = jwt.generateToken({ _id: outsider._id, roles: ['USER'] });

  const op = await Operation.create({
    pair: "BTCUSDT",
    signal: "LONG",
    leverage: 3,
    strategy: "Swing",
    risk: "Moderado",
    entry: 100,
    stop: 90,
    description: "Teste de permissão",
    targets: [110, 120],
    userId: trader._id,
    username: trader.username,
    history: {}
  });

  operationId = op._id;
});

afterAll(async () => {
  await Operation.deleteMany({});
  await User.deleteMany({ email: /@test.com$/ });
  await mongoose.disconnect();
});

describe('🔐 Segurança das rotas de operação', () => {
  it('❌ Não permite listar operações sem token', async () => {
    const res = await request(app).get('/api/operations');
    expect(res.statusCode).toBe(401);
  });

  it('❌ Usuário sem permissão não pode listar', async () => {
    const res = await request(app)
      .get('/api/operations')
      .set('Authorization', `Bearer ${outsiderToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('✅ Admin pode deletar operação', async () => {
    const res = await request(app)
      .delete(`/api/operations/${operationId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });

  it('❌ Usuário sem permissão não pode deletar', async () => {
    const op = await Operation.create({
      pair: "ETHUSDT",
      signal: "SHORT",
      leverage: 2,
      entry: 1600,
      stop: 1650,
      targets: [1550, 1500],
      userId: new mongoose.Types.ObjectId(),
      username: "fake",
      history: {}
    });

    const res = await request(app)
      .delete(`/api/operations/${op._id}`)
      .set('Authorization', `Bearer ${outsiderToken}`);
    expect(res.statusCode).toBe(403);
  });
});
