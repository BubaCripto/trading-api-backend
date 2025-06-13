const mongoose = require('mongoose');
const User = require('../../models/User');
const Community = require('../../models/Community');
const Contract = require('../../models/Contract');
const Operation = require('../../models/Operation');
const Plan = require('../../models/Plan');
const Role = require('../../models/Role');
const Permission = require('../../models/Permission');
const RouteLog = require('../../models/RouteLog');
const Communication = require('../../models/Communication');

/**
 * Obtém estatísticas gerais para o dashboard administrativo
 */
exports.getAdminDashboardStats = async () => {
  try {
    // Estatísticas de usuários
    const [users, activeUsers, admins, traders, communities] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ disabled: false }),  // Já está correto, contando usuários não desativados
      User.countDocuments({ roles: { $in: await Role.find({ name: 'ADMIN' }).distinct('_id') } }),
      User.countDocuments({ roles: { $in: await Role.find({ name: 'TRADER' }).distinct('_id') } }),
      Community.countDocuments()
    ]);

    // Estatísticas de planos
    const plans = await Plan.find();
    const activePlans = plans.filter(plan => plan.active).length;
    const totalPlanValue = plans.reduce((sum, plan) => sum + (plan.priceMonthly || 0), 0);
    
    // Distribuição de planos (mock para demonstração)
    const planDistribution = await Plan.aggregate([
      { $match: { active: true } },
      { $group: {
          _id: '$name',
          count: { $sum: 1 },
          price: { $first: '$priceMonthly' }
        }
      }
    ]);
    
    // Calcular percentagens (assumindo que temos comunidades com planos)
    const communitiesWithPlans = await Community.countDocuments({ plan: { $exists: true } });
    const distribution = planDistribution.map(plan => ({
      name: plan._id,
      percentage: Math.round((plan.count / (communitiesWithPlans || 1)) * 100),
      monthly_price: plan.price || 0
    }));

    // Estatísticas de roles e permissões
    const [totalRoles, totalPermissions] = await Promise.all([
      Role.countDocuments(),
      Permission.countDocuments()
    ]);
    
    // Média de permissões por role
    const roles = await Role.find().populate('permissions');
    const avgPermissionsPerRole = Math.round(
      roles.reduce((sum, role) => sum + (role.permissions?.length || 0), 0) / (roles.length || 1)
    );
    
    // Role mais usada
    const roleUsage = await User.aggregate([
      { $unwind: '$roles' },
      { $group: { _id: '$roles', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    
    const mostUsedRoleId = roleUsage[0]?._id;
    const mostUsedRole = mostUsedRoleId ? 
      await Role.findById(mostUsedRoleId).then(r => r?.name || 'ADMIN') : 'ADMIN';

    // Estatísticas de logs
    const totalRequests = await RouteLog.countDocuments();
    const successes = await RouteLog.countDocuments({ statusCode: { $lt: 400 } });
    const errors = await RouteLog.countDocuments({ statusCode: { $gte: 400 } });
    const uniqueUsers = await RouteLog.distinct('userId').then(ids => ids.length);
    
    // Tempo médio de resposta
    const avgResponseTime = await RouteLog.aggregate([
      { $group: { _id: null, avg: { $avg: '$responseTime' } } }
    ]).then(result => Math.round(result[0]?.avg || 0));
    
    // Rotas mais acessadas
    const topRoutes = await RouteLog.aggregate([
      { $group: { _id: '$route', requests: { $sum: 1 } } },
      { $sort: { requests: -1 } },
      { $limit: 3 }
    ]).then(routes => routes.map(r => ({ route: r._id, requests: r.requests })));
    
    // Últimas atividades
    const latestActivities = await RouteLog.find()
      .sort({ timestamp: -1 })
      .limit(4)
      .populate('userId', 'username email')
      .then(logs => logs.map(log => ({
        route: log.route,
        user: log.userId?.username || 'Anônimo',
        email: log.userId?.email || log.userEmail || 'desconhecido@email.com',
        status: log.statusCode < 400 ? 'Success' : (log.statusCode < 500 ? 'Client Error' : 'Server Error'),
        response_time_ms: log.responseTime || 0,
        ip_address: log.ip || '0.0.0.0',
        timestamp: log.timestamp.toISOString()
      })));

    // Estatísticas de contratos
    const [totalContracts, pendingContracts, activeContracts, rejectedContracts, revokedContracts] = await Promise.all([
      Contract.countDocuments(),
      Contract.countDocuments({ status: 'PENDING' }),
      Contract.countDocuments({ status: 'ACCEPTED' }),
      Contract.countDocuments({ status: 'REJECTED' }),
      Contract.countDocuments({ status: 'REVOKED' })
    ]);

    // Estatísticas de comunidades
    const [totalCommunities, activeCommunities, publicCommunities] = await Promise.all([
      Community.countDocuments(),
      Community.countDocuments({ active: true }),
      Community.countDocuments({ isPrivate: false })
    ]);
    
    // Total de membros em comunidades
    const totalMembers = await Community.aggregate([
      { $project: { memberCount: { $size: { $ifNull: ['$members', []] } } } },
      { $group: { _id: null, total: { $sum: '$memberCount' } } }
    ]).then(result => result[0]?.total || 0);

    // Estatísticas de canais de comunicação
    const [totalChannels, activeChannels, inactiveChannels, disabledChannels, telegramChannels, discordChannels, whatsappChannels] = await Promise.all([
      Communication.countDocuments(),
      Communication.countDocuments({ active: true }),  // Canais realmente ativos
      Communication.countDocuments({ active: false }),  // Inativos mas não desabilitados
      Communication.countDocuments({ disabled: true }),  // Desabilitados
      Communication.countDocuments({ type: 'Telegram' }),
      Communication.countDocuments({ type: 'Discord' }),
      Communication.countDocuments({ type: 'WhatsApp' })
    ]);

    // Estatísticas de operações
    const [totalOperations, openOperations, closedOperations, longOperations, shortOperations, profitableOperations, unprofitableOperations] = await Promise.all([
      Operation.countDocuments(),
      Operation.countDocuments({ 'history.isOpen': true, 'history.isClosed': false }),
      Operation.countDocuments({ 'history.isClosed': true }),
      Operation.countDocuments({ signal: 'LONG' }),
      Operation.countDocuments({ signal: 'SHORT' }),
      Operation.countDocuments({ 'history.isClosed': true, 'history.pnlPercentage': { $gt: 0 } }),  // Operações lucrativas
      Operation.countDocuments({ 'history.isClosed': true, 'history.pnlPercentage': { $lte: 0 } })  // Operações não lucrativas
    ]);

    // Calcular estatísticas adicionais
    const totalPnl = await Operation.aggregate([
      { $match: { 'history.isClosed': true, 'history.pnlPercentage': { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$history.pnlPercentage' } } }
    ]).then(result => result[0]?.total || 0);

    const avgPnl = await Operation.aggregate([
      { $match: { 'history.isClosed': true, 'history.pnlPercentage': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$history.pnlPercentage' } } }
    ]).then(result => result[0]?.avg || 0);

    const winRate = closedOperations > 0 ? (profitableOperations / closedOperations) * 100 : 0;

    // Melhores operações por período
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const [weeklyTopOp, monthlyTopOp, semiannualTopOp] = await Promise.all([
      Operation.find({
        'history.isClosed': true,
        'history.exitDate': { $gte: weekAgo },
        'history.pnlPercentage': { $exists: true }
      }).sort({ 'history.pnlPercentage': -1 }).limit(1),
      
      Operation.find({
        'history.isClosed': true,
        'history.exitDate': { $gte: monthAgo },
        'history.pnlPercentage': { $exists: true }
      }).sort({ 'history.pnlPercentage': -1 }).limit(1),
      
      Operation.find({
        'history.isClosed': true,
        'history.exitDate': { $gte: sixMonthsAgo },
        'history.pnlPercentage': { $exists: true }
      }).sort({ 'history.pnlPercentage': -1 }).limit(1)
    ]);

    // Formatar operações top
    const formatTopOperation = (op) => {
      if (!op || op.length === 0) return null;
      const operation = op[0];
      return {
        pair: operation.pair,
        direction: operation.signal,
        leverage: `${operation.leverage}x`,
        strategy: operation.strategy || 'N/A',
        risk: operation.risk || 'N/A',
        status: operation.status,
        trader: operation.username,
        pnl: `+${operation.history?.pnlPercentage?.toFixed(2) || '0.00'}%`
      };
    };

    // Calcular receita mensal (mock para demonstração)
    const monthlyRevenue = totalPlanValue;
    
    // Calcular taxa de churn (mock para demonstração)
    const churnRate = 8.5;
    
    // Calcular duração média do plano (mock para demonstração)
    const averagePlanDurationMonths = 6.2;

    // Montar o objeto de resposta
    return {
      admin_dashboard: {
        overview: {
          total_users: users,
          active_users: activeUsers,
          admins: admins,
          traders: traders,
          communities: communities,
          active_plans: activePlans,
          monthly_revenue: monthlyRevenue,
          churn_rate: churnRate,
          average_plan_duration_months: averagePlanDurationMonths
        },
        plans: {
          total: plans.length,
          active: activePlans,
          total_value: totalPlanValue,
          distribution: distribution
        },
        users: {
          total: users,
          active: activeUsers,
          admins: admins,
          traders: traders,
          communities: communities
        },
        roles_permissions: {
          total_roles: totalRoles,
          total_permissions: totalPermissions,
          average_permissions_per_role: avgPermissionsPerRole,
          most_used_role: mostUsedRole
        },
        logs: {
          total_requests: totalRequests,
          successes: successes,
          errors: errors,
          unique_users: uniqueUsers,
          average_response_time_ms: avgResponseTime,
          top_routes: topRoutes,
          latest_activities: latestActivities
        },
        contracts: {
          total: totalContracts,
          pending: pendingContracts,
          active: activeContracts,
          rejected: rejectedContracts,
          revoked: revokedContracts,
          rejected_total: rejectedContracts + revokedContracts  // Total de contratos rejeitados e revogados
        },
        communities: {
          total: totalCommunities,
          active: activeCommunities,
          public: publicCommunities,
          total_members: totalMembers
        },
        channels: {
          total: totalChannels,
          active: activeChannels,
          inactive: inactiveChannels,
          disabled: disabledChannels,
          telegram: telegramChannels,
          discord: discordChannels,
          whatsapp: whatsappChannels
        },
        operations: {
          total: totalOperations,
          open: openOperations,
          closed: closedOperations,
          long: longOperations,
          short: shortOperations,
          profitable: profitableOperations,
          unprofitable: unprofitableOperations,
          win_rate: parseFloat(winRate.toFixed(2)),
          total_pnl: parseFloat(totalPnl.toFixed(2)),
          avg_pnl: parseFloat(avgPnl.toFixed(2)),
          top_operations: {
            weekly: weeklyTopOp.length > 0 ? [formatTopOperation(weeklyTopOp)] : [],
            monthly: monthlyTopOp.length > 0 ? [formatTopOperation(monthlyTopOp)] : [],
            semiannual: semiannualTopOp.length > 0 ? [formatTopOperation(semiannualTopOp)] : []
          }
        }
      }
    };
  } catch (error) {
    console.error('Erro ao gerar estatísticas do dashboard:', error);
    throw error;
  }
};