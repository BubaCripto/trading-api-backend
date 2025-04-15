const mongoose = require('mongoose');

const targetHistorySchema = new mongoose.Schema({
  target: Number,
  date: Date,
  status: String
});

const historySchema = new mongoose.Schema({
  targetsReachedDetails: [targetHistorySchema],
  status: String,
  isOpen: Boolean,
  isStop: Boolean,
  isCancelled: Boolean,
  stopWithTargets: Boolean,
  allTargetsReached: Boolean,
  isClosed: Boolean,
  targets: [targetHistorySchema],
  entry: Number,
  exit: Number
});

const operationSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  message_id: Number,
  pair: {
    type: String,
    required: true
  },
  signal: {
    type: String,
    enum: ['LONG', 'SHORT'],
    required: true
  },
  leverage: {
    type: Number,
    required: true
  },
  strategy: String,
  risk: String,
  entry: {
    type: Number,
    required: true
  },
  entry2: Number,
  stop: {
    type: Number,
    required: true
  },
  description: String,
  notes: String,
  targets: [Number],
  history: historySchema,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String,
  status: {
    type: String,
    enum: ['Pending', 'Open', 'Closed', 'Cancelled'],
    default: 'Pending'
  },
  history: {
    isOpen: { type: Boolean, default: false },
    isNew: { type: Boolean, default: true },
    isClosed: { type: Boolean, default: false },
    isStop: { type: Boolean, default: false },
    stop: Boolean,
    isCancelled: { type: Boolean, default: false },
    isManualCloseRequested: { type: Boolean, default: false },
    manualClose: Boolean,
    entry: Number,
    exit: Number,
    pnlPercentage: Number,    // Novo campo para % de lucro/prejuízo
    pnlAmount: Number,        // Novo campo para valor absoluto
    riskRewardRatio: Number,  // Novo campo para risk/reward
    entryDate: Date,
    exitDate: Date,
    events: [{
      event: String,
      price: Number,
      target: Number,
      reason: String,
      timestamp: { type: Date, default: Date.now },
      details: String
    }]
  },
  status_signal: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Operation', operationSchema);