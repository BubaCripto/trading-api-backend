const request = require('supertest');
const app = require('../../app'); // ajuste esse caminho se necessário
const mongoose = require('mongoose');
const User = require('../../models/User');

let server;

beforeAll(async () => {
  server = app.listen(4000);
  await mongoose.connect(process.env.MONGODB_URI);

  // Cria um usuário para teste de login
  await User.create({
    username: 'testuser',
    email: 'testuser@example.com',
    password: '123456',
    role: 'TRADER'
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
  server.close();
});

describe('POST /api/users/login', () => {
  it('deve retornar token e dados do usuário com credenciais válidas', async () => {
    const res = await request(server)
      .post('/api/users/login')
      .send({ email: 'testuser@example.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
  });

  it('deve retornar erro com credenciais inválidas', async () => {
    const res = await request(server)
      .post('/api/users/login')
      .send({ email: 'testuser@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
