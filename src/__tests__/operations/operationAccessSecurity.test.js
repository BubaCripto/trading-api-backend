const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Operation = require('../../models/Operation');

let token1, token2, operationId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Operation.deleteMany({});

  const user1 = await request(app).post('/api/users').send({
    username: 'user1', email: 'user1@test.com', password: '123456', role: 'TRADER'
  });
  const user2 = await request(app).post('/api/users').send({
    username: 'user2', email: 'user2@test.com', password: '123456', role: 'TRADER'
  });

  const login1 = await request(app).post('/api/users/login').send({ email: 'user1@test.com', password: '123456' });
  const login2 = await request(app).post('/api/users/login').send({ email: 'user2@test.com', password: '123456' });
  
  token1 = login1.body.token;
  token2 = login2.body.token;

  // user1 cria uma operação
  const op = await request(app)
    .post('/api/operations')
    .set('Authorization', `Bearer ${token1}`)
    .send({
      pair: 'BTCUSDT', signal: 'LONG', entry: 28000, stop: 27500,
      targets: [28500], leverage: 3, strategy: 'Swing', risk: 'Alto'
    });

  operationId = op.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('🔐 Segurança - Restrição de acesso entre traders', () => {

  test('❌ Trader não pode atualizar operação de outro trader', async () => {
    const res = await request(app)
      .put(`/api/operations/${operationId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ strategy: 'Invasao', entry: 100 });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/not authorized|forbidden/i);

  });

  test('❌ Trader não pode deletar operação de outro trader', async () => {
    const res = await request(app)
      .delete(`/api/operations/${operationId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/not authorized|forbidden/i);

  });
});
