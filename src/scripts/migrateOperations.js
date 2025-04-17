require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const operationController = require('../controllers/operations/operationController');

async function migrateViaInternalRoute() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🔗 Conectado ao MongoDB');

  const jsonPath = path.join(__dirname, 'cryptoSignalsNew.currencies.json');
  const operations = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const adminUser = await User.findOne({ email: 'admin@example.com' });
  if (!adminUser) throw new Error('Usuário admin@example.com não encontrado');

  const fakeRes = () => {
    return {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        console.log(`✅ [${this.statusCode}] ${payload.pair || payload.message || 'Operação criada'}`);
      }
    };
  };

  for (const op of operations) {
    const fakeReq = {
      user: adminUser,
      body: {
        pair: op.pair,
        signal: op.signal,
        leverage: op.leverage,
        strategy: op.strategy,
        risk: op.risk,
        entry: op.entry,
        stop: op.stop,
        description: op.description,
        targets: op.targets
      }
    };

    const res = fakeRes();
    await operationController.createOperation(fakeReq, res);
  }

  console.log('🎉 Todas as operações foram processadas via rota interna');
  await mongoose.disconnect();
}

migrateViaInternalRoute();
