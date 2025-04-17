const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Community = require('../../models/Community');

let adminToken;

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

  const login = await request(app).post('/api/users/login').send({
    email: 'admin@example.com',
    password: 'adminpass'
  });
  adminToken = login.body.token;

  for (let i = 1; i <= 12; i++) {
    await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Community ${i}` });
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('📄 Paginação - Comunidades', () => {
  test('✅ Deve retornar 5 comunidades por página', async () => {
    const res = await request(app)
      .get('/api/communities?limit=5&page=2')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.currentPage).toBe(2);
  });
});
