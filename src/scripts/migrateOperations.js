require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Operation = require('../models/Operation');

async function migrateOperations() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    // Fazer login como admin
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      throw new Error('Usuário admin não encontrado');
    }

    // Ler o arquivo JSON
    const jsonPath = path.join(__dirname, 'cryptoSignalsNew.currencies.json');
    const operations = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    console.log(`Encontradas ${operations.length} operações para migrar`);

    // Migrar cada operação
    for (const op of operations) {
      const newOperation = new Operation({
        date: op.date,
        message_id: op.message_id,
        pair: op.pair,
        signal: op.signal,
        leverage: op.leverage,
        strategy: op.strategy,
        risk: op.risk,
        entry: op.entry,
        entry2: op.entry2,
        stop: op.stop,
        description: op.description,
        notes: op.notes,
        targets: Array.isArray(op.targets) ? op.targets : JSON.parse(op.targets),
        userId: adminUser._id,
        username: adminUser.username,
        status: mapStatus(op.status),
        status_signal: op.status_signal,
        history: typeof op.history === 'string' ? JSON.parse(op.history) : {
          isOpen: op.history.isOpen || false,
          isNew: false,
          isClosed: op.history.isClosed || false,
          isStop: op.history.isStop || false,
          stop: op.history.stop || false,
          isCancelled: op.history.isCancelled || false,
          entry: parseFloat(op.history.entry) || null,
          exit: parseFloat(op.history.exit) || null,
          events: Array.isArray(op.history.events) ? op.history.events : [],
          entryDate: new Date(op.history.entryDate || op.date),
          exitDate: op.history.exitDate ? new Date(op.history.exitDate) : null
        }
      });

      await newOperation.save();
    }

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await mongoose.connection.close();
  }
}

function mapStatus(oldStatus) {
  if (typeof oldStatus === 'number') {
    return 'Closed';
  }
  switch (oldStatus) {
    case 'New':
      return 'Pending';
    case 'Closed':
    case 'Fechado Manualmente':
    case 'Fechado depois de alcançar alvos':
    case 'Fechado depois de alcançar todos os alvos':
    case 'Stop Alcançado':
      return 'Closed';
    case 'Operação cancelada':
      return 'Cancelled';
    default:
      return 'Pending';
  }
}

function mapTargetEvents(targets) {
  if (!Array.isArray(targets)) return [];
  
  return targets.map(target => ({
    event: 'TARGET_REACHED',
    price: target.target,
    target: target.target,
    reason: target.status,
    timestamp: new Date(target.date),
    details: `Alvo atingido: $${target.target}`
  }));
}

migrateOperations();