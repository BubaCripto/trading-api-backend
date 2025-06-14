// src/models/Contract.js
const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  trader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED','CLOSED'],
    default: 'PENDING'
  },
  terms: {
    type: String,
    required: true,
    trim: true
  },
  communityAccepted: {
    type: Boolean,
    default: false
  },
  traderAccepted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revokedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contract', contractSchema);
