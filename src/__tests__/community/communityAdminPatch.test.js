
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const jwt = require('../../utils/jwt');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Community = require('../../models/Community');

let adminToken, communityId, traderId, memberId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const adminRole = await Role.findOne({ name: 'ADMIN' });
  const communityRole = await Role.findOne({ name: 'COMMUNITY' });
  const traderRole = await Role.findOne({ name: 'TRADER' });

  const admin = await User.create({ username: 'adminPatch', email: 'admin@patch.com', password: '123456', roles: [adminRole._id] });
  const trader = await User.create({ username: 'traderPatch', email: 'trader@patch.com', password: '123456', roles: [traderRole._id] });
  const member = await User.create({ username: 'memberPatch', email: 'member@patch.com', password: '123456', roles: [communityRole._id] });

  adminToken = jwt.generateToken({ _id: admin._id, roles: ['ADMIN'] });
  traderId = trader._id;
  memberId = member._id;

  const community = await Community.create({
    name: 'Admin Patch Community',
    userId: admin._id,
    createdBy: admin._id,
  });

  communityId = community._id;
});

afterAll(async () => {
  await Community.deleteMany({});
  await User.deleteMany({ email: /@patch.com$/ });
  await mongoose.disconnect();
});

describe('🔐 PATCH - ADMIN exclusivo - Comunidades', () => {
  it('✅ ADMIN pode contratar trader', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/hire/${traderId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.hiredTraders).toContainEqual(traderId.toString());
  });

  it('✅ ADMIN pode remover trader', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/remove/${traderId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.hiredTraders).not.toContainEqual(traderId.toString());
  });

  it('✅ ADMIN pode convidar membro', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/invite/${memberId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.members).toContainEqual(memberId.toString());
  });
});
