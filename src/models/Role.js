const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['ADMIN', 'TRADER','COMMUNITY', 'MODERATOR', 'USER, GUEST'],
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
