const mongoose = require('mongoose');

const SignalDispatchLogSchema = new mongoose.Schema({
  operationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  communityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  traderId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, {
  timestamps: true
});

SignalDispatchLogSchema.index({ operationId: 1, communityId: 1 }, { unique: true });

module.exports = mongoose.model('SignalDispatchLog', SignalDispatchLogSchema);
