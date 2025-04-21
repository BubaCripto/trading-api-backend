
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Role = require('../../models/Role');
const Permission = require('../../models/Permission');
const jwt = require('../../utils/jwt');

describe('🔐 Middleware de Segurança: Acesso às rotas de usuários', () => {
  let token, userId;

  beforeAll(async () => {
    let viewPerm = await Permission.findOne({ name: 'VIEW_USER' });
    if (!viewPerm) {
      viewPerm = await Permission.create({ name: 'VIEW_USER', description: 'Ver usuários' });
    }

    let role = await Role.findOne({ name: 'ADMIN' }).populate('permissions');
    if (!role) {
      role = await Role.create({
        name: 'ADMIN',
        permissions: [viewPerm._id],
        description: 'Administrador'
      });
    } else if (!role.permissions.some(p => p.name === 'VIEW_USER')) {
      role.permissions.push(viewPerm._id);
      await role.save();
    }

    const user = await User.create({
      username: 'testadmin',
      email: `admin_${Date.now()}@test.com`,
      password: '123456',
      roles: [role._id]
    });
    userId = user._id;
    token = jwt.generateToken({ _id: user._id });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test.com$/ });
    await mongoose.connection.close();
  });

  it('✅ Permite acesso à lista de usuários com token e permissão correta', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('❌ Bloqueia acesso sem token de autenticação', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });

  it('❌ Bloqueia acesso de usuário sem permissão de VIEW_USER', async () => {
    const role = await Role.findOneAndUpdate(
      { name: 'TRADER' },
      { $setOnInsert: { description: 'Role de trader', permissions: [] } },
      { new: true, upsert: true }
    );

    const user = await User.create({
      username: `semPermissao_${Date.now()}`,
      email: `sem_${Date.now()}@perm.com`,
      password: '123456',
      roles: [role._id]
    });

    const noPermissionToken = jwt.generateToken({ _id: user._id });

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${noPermissionToken}`);

    expect(res.statusCode).toBe(403);

    await User.findByIdAndDelete(user._id);
  });
});
