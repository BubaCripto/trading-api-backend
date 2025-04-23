const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const Operation = require('../../models/Operation');
const Role = require('../../models/Role');
const User = require('../../models/User');
const jwt = require('../../utils/jwt');

let token;
let user;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const traderRole = await Role.findOne({ name: 'TRADER' });
  user = await User.create({
    username: 'opuser',
    email: 'opuser@test.com',
    password: '123456',
    roles: [traderRole._id]
  });

  token = jwt.generateToken({ _id: user._id, roles: ['TRADER'] });
});

afterAll(async () => {
  await Operation.deleteMany({});
  await User.deleteMany({ email: /@test.com$/ });
  await mongoose.disconnect();
});

describe('🧪 Operações - POST /api/operations', () => {
  const basePayload = {
    pair: "BTCUSDT",
    signal: "LONG",
    leverage: 3,
    strategy: "Swing",
    risk: "Moderado",
    entry: 100,
    stop: 90,
    description: "Operação técnica",
    targets: [110, 120]
  };

  it('✅ Deve criar operação válida', async () => {
    const res = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${token}`)
      .send(basePayload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.pair).toBe('BTCUSDT');
  });

  it('❌ Deve bloquear sem token', async () => {
    const res = await request(app)
      .post('/api/operations')
      .send(basePayload);

    expect(res.statusCode).toBe(401);
  });

 it('❌ Deve rejeitar leverage > 200', async () => {
    const res = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...basePayload, leverage: 202 });

    expect(res.statusCode).toBe(400);
  });

  it('❌ Deve rejeitar stop acima do entry (LONG)', async () => {
    const res = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...basePayload, stop: 105 });

    expect(res.statusCode).toBe(400);
  });

  it('❌ Deve rejeitar targets não crescentes (LONG)', async () => {
    const res = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...basePayload, targets: [120, 110] });

    expect(res.statusCode).toBe(400);
  });
});
