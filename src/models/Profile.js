const mongoose = require('mongoose');

const SocialSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  link: { type: String, required: true }
}, { _id: false });

const AddressSchema = new mongoose.Schema({
  rua: String,
  numero: String,
  bairro: String,
  cidade: String,
  estado: String,
  cep: String
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  nomeCompleto: { type: String, required: true },
  dataNascimento: { type: Date },
  documento: { type: String }, // CPF ou CNPJ
  telefone: { type: String },
  endereco: AddressSchema,
  imagemPerfil: { type: String }, // URL da imagem
  bio: { type: String },
  redesSociais: [SocialSchema],
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', ProfileSchema);