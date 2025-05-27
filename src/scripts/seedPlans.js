
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
      priceMonthly: 500.90,
      features: ['1 canal ativo', 'Suporte limitado']
    },
    {
      name: 'STANDARD',
      description: 'Plano intermediário com até 3 canais de comunicação ativos',
      maxCommunications: 3,
      priceMonthly: 990.90,
      features: ['Até 3 canais', 'Suporte padrão', 'Prioridade em fila']
    },
    {
      name: 'PREMIUM',
      description: 'Plano avançado com até 5 canais de comunicação ativos',
      maxCommunications: 5,
      priceMonthly: 1149.90,
      features: ['Até 5 canais', 'Suporte prioritário', 'Acesso a recursos beta']
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
