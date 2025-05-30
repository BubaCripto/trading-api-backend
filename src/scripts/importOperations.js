
const mongoose = require('mongoose');
const connect = require('../config/database');
const User = require('../models/User');
const Operation = require('../models/Operation');

(async () => {
  await connect();

  const admin = await User.findOne({ email: 'admin@example.com' });
  if (!admin) {
    console.error('Usuário admin não encontrado.');
    process.exit(1);
  }

  const operations = [
    {
      pair: "BTCUSDT",
      signal: "LONG",
      leverage: 3,
      strategy: "Swing",
      risk: "Moderado",
      entry: 82196.78,
      stop: 78000,
      description: "Entrada técnica após correção",
      targets: [85000, 87000],
      status: "Pending"
    },
    {
      pair: "ETHUSDT",
      signal: "SHORT",
      leverage: 2,
      strategy: "Scalping",
      risk: "Alto",
      entry: 1652.93,
      stop: 1700,
      description: "Reversão de tendência",
      targets: [1600, 1550],
      status: "Pending"
    },
    {
      pair: "SOLUSDT",
      signal: "LONG",
      leverage: 4,
      strategy: "Day Trade",
      risk: "Moderado",
      entry: 126.46,
      stop: 120,
      description: "Suporte forte identificado",
      targets: [130, 135],
      status: "Pending"
    },
    {
      pair: "XRPUSDT",
      signal: "SHORT",
      leverage: 3,
      strategy: "Swing",
      risk: "Alto",
      entry: 2.0529,
      stop: 2.1,
      description: "Padrão de reversão detectado",
      targets: [2.0, 1.95],
      status: "Pending"
    },
    {
      pair: "NEARUSDT",
      signal: "LONG",
      leverage: 2,
      strategy: "Position",
      risk: "Baixo",
      entry: 2.219,
      stop: 2.1,
      description: "Tendência de alta contínua",
      targets: [2.3, 2.4],
      status: "Pending"
    },
    {
      pair: "ADAUSDT",
      signal: "SHORT",
      leverage: 3,
      strategy: "Scalping",
      risk: "Moderado",
      entry: 0.6334,
      stop: 0.65,
      description: "Resistência próxima",
      targets: [0.62, 0.6],
      status: "Pending"
    },
    {
      pair: "BCHUSDT",
      signal: "LONG",
      leverage: 2,
      strategy: "Swing",
      risk: "Moderado",
      entry: 294.8,
      stop: 280,
      description: "Recuperação após queda",
      targets: [310, 320],
      status: "Pending"
    },
    {
      pair: "DOTUSDT",
      signal: "SHORT",
      leverage: 3,
      strategy: "Day Trade",
      risk: "Alto",
      entry: 3.691,
      stop: 3.8,
      description: "Volume de venda aumentado",
      targets: [3.6, 3.5],
      status: "Pending"
    },
    {
      pair: "AAVEUSDT",
      signal: "LONG",
      leverage: 2,
      strategy: "Position",
      risk: "Baixo",
      entry: 142.65,
      stop: 140,
      description: "Suporte técnico identificado",
      targets: [145, 150],
      status: "Pending"
    },
    {
      pair: "SUIUSDT",
      signal: "SHORT",
      leverage: 4,
      strategy: "Scalping",
      risk: "Alto",
      entry: 2.2197,
      stop: 2.3,
      description: "Padrão de reversão",
      targets: [2.2, 2.15],
      status: "Pending"
    }
  ];

  const inserted = await Operation.insertMany(
    operations.map(op => ({ ...op, userId: admin._id }))
  );

  console.log(`${inserted.length} operações inseridas com sucesso para o admin.`);
  process.exit();
})();
