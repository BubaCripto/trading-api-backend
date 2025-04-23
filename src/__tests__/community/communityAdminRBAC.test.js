
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const jwt = require('../../utils/jwt');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Community = require('../../models/Community');

let adminToken, communityToken;
let adminUser, communityUser;
let communityId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const adminRole = await Role.findOne({ name: 'ADMIN' });
  const communityRole = await Role.findOne({ name: 'COMMUNITY' });

  adminUser = await User.create({ username: 'admin', email: 'admin@test.com', password: '123456', roles: [adminRole._id] });
  communityUser = await User.create({ username: 'comm', email: 'comm@test.com', password: '123456', roles: [communityRole._id] });

  adminToken = jwt.generateToken({ _id: adminUser._id, roles: ['ADMIN'] });
  communityToken = jwt.generateToken({ _id: communityUser._id, roles: ['COMMUNITY'] });
});

afterAll(async () => {
  await Community.deleteMany({});
  await User.deleteMany({ email: /@test.com$/ });
  await mongoose.disconnect();
});

describe('🔐 RBAC ADMIN - Comunidades', () => {
  beforeEach(async () => {
    await Community.deleteMany({});
    const community = await Community.create({
      name: 'Community X',
      userId: communityUser._id,
      createdBy: communityUser._id
    });
    communityId = community._id;
  });

  it('✅ ADMIN pode criar comunidade', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nova Comunidade', description: 'Admin criada' });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Nova Comunidade');
  });

  it('✅ ADMIN pode editar comunidade de outro usuário', async () => {
    const res = await request(app)
      .put(`/api/communities/${communityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Editada pelo admin' });

    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe('Editada pelo admin');
  });

  it('✅ ADMIN pode deletar comunidade de outro usuário', async () => {
    const res = await request(app)
      .delete(`/api/communities/${communityId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
  });
});
