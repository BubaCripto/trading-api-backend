// __tests__/profile.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app');
const User = require('../../../models/User');
const Profile = require('../../../models/Profile');

let token;
let userId;
let otherUserId;
let otherToken;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Profile.deleteMany({});

  const user = await User.create({
    username: 'tester',
    email: 'tester@example.com',
    password: '123456',
    role: 'TRADER'
  });
  userId = user._id;

  const login = await request(app)
    .post('/api/users/login')
    .send({ email: 'tester@example.com', password: '123456' });

  token = login.body.token;

  const otherUser = await User.create({
    username: 'invasor',
    email: 'invader@example.com',
    password: '123456',
    role: 'TRADER'
  });
  otherUserId = otherUser._id;

  const otherLogin = await request(app)
    .post('/api/users/login')
    .send({ email: 'invader@example.com', password: '123456' });

  otherToken = otherLogin.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('🔒 Testes de Perfil', () => {
  test('✅ Criar perfil', async () => {
    const res = await request(app)
      .post('/api/profiles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nomeCompleto: 'Tester de Perfil',
        telefone: '11999999999',
        bio: 'Sou um trader dedicado'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.nomeCompleto).toBe('Tester de Perfil');
  });

  test('✅ Buscar perfil criado', async () => {
    const res = await request(app)
      .get(`/api/profiles/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.telefone).toBe('11999999999');
  });

  test('✅ Atualizar perfil', async () => {
    const res = await request(app)
      .put(`/api/profiles/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nomeCompleto: 'Nome Atualizado',
        telefone: '11900000000'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.nomeCompleto).toBe('Nome Atualizado');
  });

  test('❌ Usuário externo não pode acessar perfil de outro', async () => {
    const res = await request(app)
      .get(`/api/profiles/${userId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('❌ Usuário externo não pode editar perfil de outro', async () => {
    const res = await request(app)
      .put(`/api/profiles/${userId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ nomeCompleto: 'Hackeado' });

    expect(res.statusCode).toBe(403);
  });

  test('✅ ADMIN pode editar qualquer perfil', async () => {
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'ADMIN'
    });

    const adminLogin = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@example.com', password: 'admin123' });

    const adminToken = adminLogin.body.token;

    await request(app)
      .post('/api/profiles')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        nomeCompleto: 'Perfil do Invasor',
        telefone: '11111111111'
      });

    const res = await request(app)
      .put(`/api/profiles/${otherUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nomeCompleto: 'Editado pelo Admin' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.nomeCompleto).toBe('Editado pelo Admin');
  });

  test('✅ Deletar perfil', async () => {
    const res = await request(app)
      .delete(`/api/profiles/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removido/);
  });
});
