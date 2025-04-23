const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const jwt = require('../../utils/jwt');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Community = require('../../models/Community');

let communityToken, traderId, communityId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const communityRole = await Role.findOne({ name: 'COMMUNITY' });
  const traderRole = await Role.findOne({ name: 'TRADER' });

  const communityUser = await User.create({ username: 'communityPatch', email: 'com@patch.com', password: '123456', roles: [communityRole._id] });
  const trader = await User.create({ username: 'traderNeg', email: 'trader@neg.com', password: '123456', roles: [traderRole._id] });

  communityToken = jwt.generateToken({ _id: communityUser._id, roles: ['COMMUNITY'] });
  traderId = trader._id;

  const community = await Community.create({
    name: 'Negative Test Community',
    userId: communityUser._id,
    createdBy: communityUser._id,
  });

  communityId = community._id;
});

afterAll(async () => {
  await Community.deleteMany({});
  await User.deleteMany({ email: /@patch.com$|@neg.com$/ });
  await mongoose.disconnect();
});

describe('🚫 PATCH - Acesso Negado para não-ADMIN - Comunidades', () => {
  it('❌ COMMUNITY não pode contratar trader', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/hire/${traderId}`)
      .set('Authorization', `Bearer ${communityToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('❌ COMMUNITY não pode remover trader', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/remove/${traderId}`)
      .set('Authorization', `Bearer ${communityToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('❌ COMMUNITY não pode convidar membro', async () => {
    const res = await request(app)
      .patch(`/api/communities/${communityId}/invite/${traderId}`)
      .set('Authorization', `Bearer ${communityToken}`);
    expect(res.statusCode).toBe(403);
  });
});
