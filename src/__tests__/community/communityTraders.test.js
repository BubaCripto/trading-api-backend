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

  // Criar ADMIN
  const adminUser = new User({
    username: 'adminUser',
    email: 'admin@test.com',
    password: 'adminpass',
    role: 'ADMIN'
  });
  await adminUser.save();

  const adminLogin = await request(app).post('/api/users/login').send({
    email: 'admin@test.com',
    password: 'adminpass'
  });
  adminToken = adminLogin.body.token;

  // Criar TRADER
  const traderRes = await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      username: 'traderUser',
      email: 'trader@test.com',
      password: 'traderpass',
      role: 'TRADER'
    });
  traderId = traderRes.body._id;

  const traderLogin = await request(app).post('/api/users/login').send({
    email: 'trader@test.com',
    password: 'traderpass'
  });
  traderToken = traderLogin.body.token;

  // Criar comunidade
  const res = await request(app)
    .post('/api/communities')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Sala de Operações' });

  communityId = res.body.data._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('👥 Contratação de Traders pela Comunidade', () => {
  test('✅ Admin pode contratar um trader', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/hire?traderId=${traderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.hiredTraders).toContain(traderId);
  });

  test('❌ Admin não pode contratar o mesmo trader duas vezes', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/hire?traderId=${traderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message', 'Trader já está contratado');

  });

  test('✅ Admin pode remover um trader contratado', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/fire?traderId=${traderId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.hiredTraders).not.toContain(traderId);
  });

  test('❌ Trader não pode contratar outro trader', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/hire?traderId=${traderId}`)
      .set('Authorization', `Bearer ${traderToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('❌ Trader não pode remover outro trader', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/fire?traderId=${traderId}`)
      .set('Authorization', `Bearer ${traderToken}`);

    expect(res.statusCode).toBe(403);
  });
});