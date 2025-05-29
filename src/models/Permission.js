const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    // enum removido
  },
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema);
