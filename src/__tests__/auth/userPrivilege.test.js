const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

let adminToken;
let traderToken;
let traderId;
let traderEmail;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});

  // Cria ADMIN
  await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN'
  });

  // Login ADMIN
  const adminLogin = await request(app).post('/api/users/login').send({
    email: 'admin@example.com',
    password: 'admin123',
  });
  adminToken = adminLogin.body.token;

  // Cria TRADER com email dinâmico
  traderEmail = `trader_${Date.now()}@example.com`;
  const traderRes = await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      username: 'trader',
      email: traderEmail,
      password: 'trader123',
      role: 'TRADER',
    });

  traderId = traderRes.body._id;

  // Login TRADER
  const traderLogin = await request(app).post('/api/users/login').send({
    email: traderEmail,
    password: 'trader123',
  });
  traderToken = traderLogin.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('🛡️ Escalonamento de Privilégios', () => {
  test('❌ TRADER não pode listar todos os usuários', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${traderToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('✅ ADMIN pode listar todos os usuários', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('❌ TRADER não pode atualizar o próprio role para ADMIN', async () => {
    const res = await request(app)
      .put(`/api/users/${traderId}`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ role: 'ADMIN' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch("Você não pode alterar a role do usuário");
      
  });

  test('✅ ADMIN pode atualizar role do usuário', async () => {
    const res = await request(app)
      .put(`/api/users/${traderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'COMMUNITY' });

    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe('COMMUNITY');
  });

  test('✅ Resposta nunca deve conter campo password', async () => {
    const res = await request(app)
      .get(`/api/users/${traderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).not.toHaveProperty('password');
  });
  test('❌ Qualquer tentativa de criar usuário com role ADMIN deve ser bloqueada', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        username: 'malicious',
        email: `malicious_${Date.now()}@example.com`,
        password: 'malicious123',
        role: 'ADMIN'
      });
  
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/role ADMIN/);
  });
  
});
