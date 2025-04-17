const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Community = require('../../models/Community');

let adminToken, traderToken, traderId, communityId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Community.deleteMany({});

  const adminUser = new User({
    username: 'adminUser',
    email: 'admin@example.com',
    password: 'adminpass',
    role: 'ADMIN'
  });
  await adminUser.save();

  const adminLogin = await request(app).post('/api/users/login').send({
    email: 'admin@example.com',
    password: 'adminpass'
  });
  adminToken = adminLogin.body.token;

  const traderRes = await request(app).post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      username: 'traderUser',
      email: 'trader@example.com',
      password: 'traderpass',
      role: 'TRADER'
    });
  traderId = traderRes.body._id;

  const traderLogin = await request(app).post('/api/users/login').send({
    email: 'trader@example.com',
    password: 'traderpass'
  });
  traderToken = traderLogin.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('🔒 Testes de segurança e privilégios - Communities', () => {
  test('❌ Trader NÃO pode criar comunidade', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ name: 'Trader Community', userId: traderId });
    expect(res.statusCode).toBe(403);
  });

  test('❌ Admin NÃO deve poder forçar createdBy no body', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Injeção', createdBy: 'maliciosoID' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.createdBy).not.toBe('maliciosoID');
  });

  test('✅ Admin pode criar comunidade para outro usuário', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Admin Community', userId: traderId });
    expect(res.statusCode).toBe(201);
    communityId = res.body.data._id;
  });

  test('❌ Trader NÃO pode atualizar comunidade que não criou', async () => {
    const res = await request(app)
      .put(`/api/communities/${communityId}`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ name: 'Alterada pelo Trader' });
    expect(res.statusCode).toBe(403);
  });

  test('✅ Admin pode atualizar comunidade', async () => {
    const res = await request(app)
      .put(`/api/communities/${communityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Alterada pelo Admin' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Alterada pelo Admin');
  });

  test('❌ Trader NÃO pode deletar comunidade', async () => {
    const res = await request(app)
      .delete(`/api/communities/${communityId}`)
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('✅ Admin pode deletar comunidade', async () => {
    const res = await request(app)
      .delete(`/api/communities/${communityId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  test('✅ Paginação e ordenação no getAll funciona', async () => {
    const res = await request(app)
      .get('/api/communities?limit=5&page=1&sort=name')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('currentPage', 1);
    expect(res.body).toHaveProperty('totalPages');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('❌ Validação falha com body inválido', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Sem nome obrigatório' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
