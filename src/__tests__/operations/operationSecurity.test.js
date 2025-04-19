
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Operation = require('../../models/Operation');

let token, token2, operationId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Operation.deleteMany({});

  const userOneEmail = `userone_${Date.now()}@test.com`;
  const userTwoEmail = `usertwo_${Date.now()}@test.com`;

  await Promise.all([
    request(app).post('/api/users').send({ username: 'userone', email: userOneEmail, password: '123456', role: 'TRADER' }),
    request(app).post('/api/users').send({ username: 'usertwo', email: userTwoEmail, password: '123456', role: 'TRADER' })
  ]);

  const [login1, login2] = await Promise.all([
    request(app).post('/api/users/login').send({ email: userOneEmail, password: '123456' }),
    request(app).post('/api/users/login').send({ email: userTwoEmail, password: '123456' })
  ]);

  token = login1.body.token;
  token2 = login2.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('🔒 Segurança - Operações', () => {
  test('❌ Não deve criar operação sem autenticação', async () => {
    const res = await request(app).post('/api/operations').send({
      pair: 'BTCUSDT', signal: 'LONG', entry: 28000, stop: 27500, targets: [28200]
    });
    expect(res.statusCode).toBe(401);
  });

  test('✅ Deve validar campos obrigatórios e inválidos', async () => {
    const res = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pair: '', signal: 'LONG', entry: 'abc', stop: 27500, targets: 'not array'
      });
    expect(res.statusCode).toBe(400);
  });

  test('❌ Deve impedir injeção de userId', async () => {
    const res = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pair: 'BTCUSDT', signal: 'LONG', entry: 28000, stop: 27500,
        targets: [28200], userId: 'fakeUserId'
      });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.statusCode).toBeLessThan(500);
  });

  test('❌ Usuário não deve acessar operação de outro', async () => {
    const create = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${token}`)
      .send({ pair: 'ETHUSDT', signal: 'SHORT', entry: 1800, stop: 1850, targets: [1750], leverage: 2 });

    operationId = create.body._id;

    const res = await request(app)
      .get(`/api/operations/${operationId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.statusCode).toBe(403);
  });

  test('❌ Deve impedir lógica inválida - LONG com entry < stop', async () => {
    const res = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pair: 'BTCUSDT', signal: 'LONG', entry: 27000, stop: 27500, targets: [28000], leverage: 2
      });
    expect(res.statusCode).toBe(400);
  });

  test('✅ Suporte a paginação e ordenação', async () => {
    const res = await request(app)
      .get('/api/operations?page=1&limit=1&sort=-createdAt')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.operations)).toBe(true);
  });

  test('❌ COMMUNITY não pode criar operação', async () => {
    // Criação manual
    await User.create({
      username: 'community1',
      email: 'comm1@example.com',
      password: '123456',
      role: 'COMMUNITY'
    });
  
    const login = await request(app).post('/api/users/login').send({
      email: 'comm1@example.com',
      password: '123456',
    });
  
    const res = await request(app)
      .post('/api/operations')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({
        pair: 'BTCUSDT',
        signal: 'LONG',
        entry: 28000,
        stop: 27500,
        targets: [28200],
        leverage: 2
      });
  
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/apenas traders/i);
  });
  
});
