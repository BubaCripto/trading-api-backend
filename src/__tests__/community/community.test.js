
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const jwt = require('../../utils/jwt');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Community = require('../../models/Community');

let token, user, communityId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const role = await Role.findOne({ name: 'COMMUNITY' });
  user = await User.create({ username: 'crudUser', email: 'crud@com.com', password: '123456', roles: [role._id] });
  token = jwt.generateToken({ _id: user._id, roles: ['COMMUNITY'] });
});

afterAll(async () => {
  await Community.deleteMany({});
  await User.deleteMany({ email: /@com.com$/ });
  await mongoose.disconnect();
});

describe('📘 CRUD básico de Comunidade', () => {
  it('✅ Deve criar comunidade com dados válidos', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Comunidade CRUD', description: 'Testando criação' });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Comunidade CRUD');
    communityId = res.body._id;
  });

  it('❌ Deve rejeitar criação sem nome', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Sem nome' });

    expect(res.statusCode).toBe(422);
  });

  it('✅ Deve retornar todas comunidades públicas', async () => {
    const res = await request(app).get('/api/communities');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('✅ Deve buscar uma comunidade por ID', async () => {
    const res = await request(app).get(`/api/communities/${communityId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(communityId);
  });

  it('❌ Deve retornar 404 para comunidade inexistente', async () => {
    const res = await request(app).get('/api/communities/000000000000000000000000');
    expect(res.statusCode).toBe(404);
  });

  it('✅ Deve atualizar comunidade existente', async () => {
    const res = await request(app)
      .put(`/api/communities/${communityId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Atualizada' });

    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe('Atualizada');
  });

  it('✅ Deve deletar a comunidade', async () => {
    const res = await request(app)
      .delete(`/api/communities/${communityId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
  });
});
