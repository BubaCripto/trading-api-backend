
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Permission = require('../../models/Permission');
const jwt = require('../../utils/jwt');

describe('📘 Testes completos de regras RBAC + ABAC no módulo de usuários', () => {
  let adminToken, traderToken, adminUserId, traderUserId;

  beforeAll(async () => {
    const permsMap = {
      VIEW_USER: 'Ver usuários',
      UPDATE_USER: 'Atualizar usuário',
      DELETE_USER: 'Deletar usuário'
    };

    const permDocs = {};
    for (const [key, desc] of Object.entries(permsMap)) {
      let perm = await Permission.findOne({ name: key });
      if (!perm) {
        perm = await Permission.create({ name: key, description: desc });
      }
      permDocs[key] = perm;
    }

    // Role ADMIN (garantindo que tenha as permissões necessárias)
    let adminRole = await Role.findOne({ name: 'ADMIN' }).populate('permissions');
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'ADMIN',
        description: 'Administrador',
        permissions: Object.values(permDocs).map(p => p._id)
      });
    } else {
      const adminPermIds = Object.values(permDocs).map(p => p._id.toString());
      const rolePermIds = adminRole.permissions.map(p => p._id.toString());

      const missing = adminPermIds.filter(id => !rolePermIds.includes(id));
      if (missing.length > 0) {
        adminRole.permissions.push(...missing);
        await adminRole.save();
      }
    }

    // Role TRADER
    const traderRole = await Role.findOneAndUpdate(
      { name: 'TRADER' },
      {
        $setOnInsert: { description: 'Trader', permissions: [] }
      },
      { new: true, upsert: true }
    );

    const adminUser = await User.create({
      username: `admin_${Date.now()}`,
      email: `admin_${Date.now()}@test.com`,
      password: '123456',
      roles: [adminRole._id]
    });

    const traderUser = await User.create({
      username: `trader_${Date.now()}`,
      email: `trader_${Date.now()}@test.com`,
      password: '123456',
      roles: [traderRole._id]
    });

    adminUserId = adminUser._id;
    traderUserId = traderUser._id;

    adminToken = jwt.generateToken({ _id: adminUser._id });
    traderToken = jwt.generateToken({ _id: traderUser._id });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test.com$/ });
    await mongoose.connection.close();
  });

  it('✅ ADMIN pode listar usuários (VIEW_USER)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('❌ TRADER sem VIEW_USER não pode listar usuários', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('✅ ADMIN pode editar outro usuário (UPDATE_USER)', async () => {
    const res = await request(app)
      .put(`/api/users/${traderUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'updatedByAdmin' });
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('updatedByAdmin');
  });

  it('✅ Usuário pode editar a si mesmo (UPDATE_USER)', async () => {
    const res = await request(app)
      .put(`/api/users/${adminUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'adminSelfEdit' });
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('adminSelfEdit');
  });

  it('❌ TRADER não pode editar outro usuário', async () => {
    const res = await request(app)
      .put(`/api/users/${adminUserId}`)
      .set('Authorization', `Bearer ${traderToken}`)
      .send({ username: 'hackerTry' });
    expect(res.statusCode).toBe(403);
  });

  it('✅ ADMIN pode deletar um usuário (DELETE_USER)', async () => {
    const toDelete = await User.create({
      username: `todelete_${Date.now()}`,
      email: `todelete_${Date.now()}@test.com`,
      password: '123456',
      roles: []
    });

    const res = await request(app)
      .delete(`/api/users/${toDelete._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });

  it('❌ TRADER não pode deletar outro usuário', async () => {
    const res = await request(app)
      .delete(`/api/users/${adminUserId}`)
      .set('Authorization', `Bearer ${traderToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('❌ DELETE sem token deve falhar', async () => {
    const res = await request(app)
      .delete(`/api/users/${adminUserId}`);
    expect(res.statusCode).toBe(401);
  });
});
