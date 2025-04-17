const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

let traderToken, traderId, anotherTraderId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});

  // Create 2 traders
  const traderOne = await request(app).post('/api/users').send({
    username: 'trader1', email: `trader1@ex.com`, password: '123456', role: 'TRADER'
  });

  const traderTwo = await request(app).post('/api/users').send({
    username: 'trader2', email: `trader2@ex.com`, password: '123456', role: 'TRADER'
  });

  const loginOne = await request(app).post('/api/users/login').send({
    email: `trader1@ex.com`, password: '123456'
  });

  traderToken = loginOne.body.token;
  traderId = traderOne.body._id;
  anotherTraderId = traderTwo.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('🔐 Security - Privilege Escalation and Unauthorized Access', () => {

  test('❌ Trader cannot register as ADMIN', async () => {
    const res = await request(app).post('/api/users').send({
      username: 'malicious', email: `admin@hack.com`, password: '123456', role: 'ADMIN'
    });

    expect(res.body.role).not.toBe('ADMIN');
  });

  test('❌ Trader cannot access another trader\'s profile', async () => {
    const res = await request(app)
      .get(`/api/users/${anotherTraderId}`)
      .set('Authorization', `Bearer ${traderToken}`);

    expect([403, 404]).toContain(res.statusCode);
  });

  test('❌ Trader cannot modify another user\'s profile', async () => {
    const res = await request(app)
      .put(`/api/users/${anotherTraderId}`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ username: 'hacked' });

    expect([403, 404]).toContain(res.statusCode);
  });

  test('❌ Trader cannot set sensitive fields in update', async () => {
    const res = await request(app)
      .put(`/api/users/${traderId}`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ _id: 'injected', role: 'ADMIN', email: 'forced@admin.com' });

    expect(res.body.role).not.toBe('ADMIN');
    expect(res.body.email).not.toBe('forced@admin.com');
  });

  test('❌ Requests with invalid token should be blocked', async () => {
    const res = await request(app)
      .get(`/api/users/${traderId}`)
      .set('Authorization', `Bearer INVALIDTOKEN`);

    expect(res.statusCode).toBe(401);
  });

});
