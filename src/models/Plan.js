
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['BASIC', 'STANDARD', 'PREMIUM']
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
