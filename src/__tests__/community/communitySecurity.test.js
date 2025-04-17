const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Community = require('../../models/Community');

let adminToken, traderToken, traderId;

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

describe('🔐 Security - Comunidades', () => {
  test('❌ Deve impedir envio de createdBy forçado pelo admin', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test', createdBy: traderId });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.createdBy).not.toBe(traderId);
  });



  test('❌ Deve falhar ao criar comunidade sem nome', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });
});
