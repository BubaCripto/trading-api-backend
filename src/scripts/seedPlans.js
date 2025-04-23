
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Plan = require('../models/Plan');
const connect = require('../config/database');

async function seedPlans() {
  await connect();

  const plans = [
    {
      name: 'BASIC',
      description: 'Plano básico com 1 canal de comunicação ativo',
      maxCommunications: 1,
      priceMonthly: 0,
      features: ['1 canal ativo', 'Suporte limitado']
    },
    {
      name: 'STANDARD',
      description: 'Plano intermediário com até 3 canais de comunicação ativos',
      maxCommunications: 3,
      priceMonthly: 49.90,
      features: ['Até 3 canais', 'Suporte padrão', 'Prioridade em fila']
    },
    {
      name: 'PREMIUM',
      description: 'Plano avançado com até 10 canais de comunicação ativos',
      maxCommunications: 10,
      priceMonthly: 149.90,
      features: ['Até 10 canais', 'Suporte prioritário', 'Acesso a recursos beta']
    }
  ];

  for (const plan of plans) {
    await Plan.findOneAndUpdate(
      { name: plan.name },
      { $set: plan },
      { upsert: true, new: true }
    );
  }

  console.log('🚀 Planos populados com sucesso!');
  process.exit();
}

seedPlans().catch(error => {
  console.error('Erro ao popular planos:', error);
  process.exit(1);
});
