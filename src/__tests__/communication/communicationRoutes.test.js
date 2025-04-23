
require('dotenv').config();
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

const User = require('../../../src/models/User');
const Role = require('../../../src/models/Role');
const Plan = require('../../../src/models/Plan');
const Community = require('../../../src/models/Community');
const Communication = require('../../../src/models/Communication');
const jwt = require('../../../src/utils/jwt');

describe('📡 Communication Routes', () => {
  let tokenOwner, tokenAdmin, tokenOutsider;
  let owner, admin, outsider;
  let communityWithPlan, communityNoPlan;
  let communicationId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const roleCommunity = await Role.findOne({ name: 'COMMUNITY' });
    const roleAdmin = await Role.findOne({ name: 'ADMIN' });

    const planStandard = await Plan.findOne({ name: 'STANDARD' });

    owner = await User.create({ username: 'owner', email: 'owner@mail.com', password: '123456', roles: [roleCommunity._id] });
    admin = await User.create({ username: 'admin', email: 'admin@mail.com', password: '123456', roles: [roleAdmin._id] });
    outsider = await User.create({ username: 'outsider', email: 'out@mail.com', password: '123456', roles: [] });

    communityWithPlan = await Community.create({
      name: 'Com Plano',
      userId: owner._id,
      createdBy: owner._id,
      plan: planStandard._id,
      active: true
    });

    communityNoPlan = await Community.create({
      name: 'Sem Plano',
      userId: owner._id,
      createdBy: owner._id,
      active: true
    });

    tokenOwner = jwt.generateToken({ _id: owner._id, roles: ['COMMUNITY'] });
    tokenAdmin = jwt.generateToken({ _id: admin._id, roles: ['ADMIN'] });
    tokenOutsider = jwt.generateToken({ _id: outsider._id, roles: ['USER'] });
  });

  afterAll(async () => {
    await Communication.deleteMany({});
    await Community.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('✅ deve criar comunicação com sucesso', async () => {
    const res = await request(app)
      .post('/communications')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({
        communityId: communityWithPlan._id,
        type: 'Telegram',
        credentials: {
          botToken: 'token-123',
          chatId: '-100999'
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    communicationId = res.body._id;
  });

  it('❌ deve bloquear criação se comunidade não tiver plano', async () => {
    const res = await request(app)
      .post('/communications')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({
        communityId: communityNoPlan._id,
        type: 'Telegram',
        credentials: {
          botToken: 'token-000',
          chatId: '-100000'
        }
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/plano/i);
  });

  it('❌ deve bloquear criação se usuário não for dono nem admin', async () => {
    const res = await request(app)
      .post('/communications')
      .set('Authorization', `Bearer ${tokenOutsider}`)
      .send({
        communityId: communityWithPlan._id,
        type: 'Discord',
        credentials: {
          webhookUrl: 'https://discord.com/webhook'
        }
      });

    expect(res.statusCode).toBe(403);
  });

  it('✅ deve listar comunicações como owner', async () => {
    const res = await request(app)
      .get('/communications?communityId=' + communityWithPlan._id)
      .set('Authorization', `Bearer ${tokenOwner}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('page');

  });

  it('✅ deve permitir toggle como admin', async () => {
    const res = await request(app)
      .patch(`/communications/${communicationId}/toggle`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.active).toBe('boolean');
  });

  it('❌ deve bloquear toggle por usuário externo', async () => {
    const res = await request(app)
      .patch(`/communications/${communicationId}/toggle`)
      .set('Authorization', `Bearer ${tokenOutsider}`);

    expect(res.statusCode).toBe(403);
  });

  it('✅ deve deletar comunicação como admin', async () => {
    const res = await request(app)
      .delete(`/communications/${communicationId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
  });
});
