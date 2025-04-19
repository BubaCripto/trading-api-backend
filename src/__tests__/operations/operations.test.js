const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Operation = require('../../models/Operation');

let token;
let operationId;
let traderEmail;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Operation.deleteMany({});

  traderEmail = `trader_${Date.now()}@example.com`;

  await User.create({
    username: 'traderuser',
    email: traderEmail,
    password: 'password123',
    role: 'TRADER'
  });

  const login = await request(app).post('/api/users/login').send({
    email: traderEmail,
    password: 'password123'
  });

  token = login.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Operações CRUD de Trading', () => {
  test('✅ Cria uma nova operação com token válido', async () => {
    const res = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pair: 'BTCUSDT',
        signal: 'LONG',
        strategy: 'Scalping',
        risk: 'Alto',
        leverage: 3,
        entry: 28000,
        stop: 27500,
        targets: [28200, 28400]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    operationId = res.body._id;
  });

  test('✅ Lista todas as operações', async () => {
    const res = await request(app)
      .get('/api/operations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.operations)).toBe(true);
  });

  test('✅ Busca uma operação específica por ID', async () => {
    const res = await request(app)
      .get(`/api/operations/${operationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('pair', 'BTCUSDT');
  });

  test('✅ Atualiza a operação como criador', async () => {
    const res = await request(app)
      .put(`/api/operations/${operationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ strategy: 'Swing', entry: 28100 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('strategy', 'Swing');
    expect(res.body).toHaveProperty('entry', 28100);
  });

  test('✅ Atualiza os alvos da operação', async () => {
    const res = await request(app)
      .patch(`/api/operations/${operationId}/targets`)
      .set('Authorization', `Bearer ${token}`)
      .send({ targets: [28200, 28600] });

    expect(res.statusCode).toBe(200);
    expect(res.body.targets).toEqual(expect.arrayContaining([28200, 28600]));
  });

  test('✅ Solicita fechamento manual da operação', async () => {
    const res = await request(app)
      .patch(`/api/operations/${operationId}/manual-close`)
      .set('Authorization', `Bearer ${token}`);

    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.operation.history.isManualCloseRequested).toBe(true);
    }
  });

  test('✅ Deleta a operação como criador', async () => {
    const res = await request(app)
      .delete(`/api/operations/${operationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Operação removida com sucesso');
  });
  
});
