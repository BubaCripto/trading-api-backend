
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const jwt = require('../../utils/jwt');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Community = require('../../models/Community');

let tokenA, tokenB;
let userA, userB;
let communityIdA, communityIdB;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const role = await Role.findOne({ name: 'COMMUNITY' });

  userA = await User.create({ username: 'userA', email: 'a@a.com', password: '123456', roles: [role._id] });
  userB = await User.create({ username: 'userB', email: 'b@b.com', password: '123456', roles: [role._id] });

  tokenA = jwt.generateToken({ _id: userA._id, roles: ['COMMUNITY'] });
  tokenB = jwt.generateToken({ _id: userB._id, roles: ['COMMUNITY'] });
});

afterAll(async () => {
  await Community.deleteMany({});
  await User.deleteMany({ email: /@a.com|@b.com/ });
  await mongoose.disconnect();
});

describe('🔐 RBAC e ABAC - Comunidades', () => {
  beforeEach(async () => {
    await Community.deleteMany({});

    const communityA = await Community.create({
      name: 'A Community',
      userId: userA._id,
      createdBy: userA._id
    });

    const communityB = await Community.create({
      name: 'B Community',
      userId: userB._id,
      createdBy: userB._id
    });

    communityIdA = communityA._id;
    communityIdB = communityB._id;
  });

  it('✅ UserA pode deletar sua própria comunidade', async () => {
    const res = await request(app)
      .delete(`/api/communities/${communityIdA}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(204);
  });

  it('❌ UserA não pode deletar comunidade de UserB', async () => {
    const res = await request(app)
      .delete(`/api/communities/${communityIdB}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(403);
  });

  it('✅ UserB pode editar sua própria comunidade', async () => {
    const res = await request(app)
      .put(`/api/communities/${communityIdB}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ description: 'Atualizada' });
    expect(res.statusCode).toBe(200);
  });

  it('❌ UserA não pode editar comunidade de UserB', async () => {
    const res = await request(app)
      .put(`/api/communities/${communityIdB}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ description: 'Hackeada' });
    expect(res.statusCode).toBe(403);
  });
});
