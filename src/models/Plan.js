 
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // Removido: enum: ['BASIC', 'STANDARD', 'PREMIUM']
  },
  description: {
    type: String,
    trim: true
  },
  maxCommunications: {
    type: Number,
    required: true,
    default: 1
  },
  priceMonthly: {
    type: Number,
    required: false
  },
  features: {
    type: [String],
    default: []
  },
  active: {
    type: Boolean,
    default: true
  }, 
  stripePriceId: { 
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
