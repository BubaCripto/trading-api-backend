
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('🧪 Validação de Autenticação', () => {
  afterAll(async () => {
    await User.deleteMany({ email: /@test.com$/ });
    await mongoose.disconnect();
  });

  it('❌ Should fail to register with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'invaliduser',
        email: 'invalid-email',
        password: '123456',
        roles: ['USER'],
        profile: { fullName: 'Test User' }
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('❌ Should fail to register with short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'shortpass',
        email: 'shortpass@test.com',
        password: '123',
        roles: ['USER'],
        profile: { fullName: 'Test User' }
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('✅ Should register successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'validuser',
        email: 'validuser@test.com',
        password: '123456',
        roles: ['USER'],
        profile: { fullName: 'Valid User' }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('validuser@test.com');
  });
});
