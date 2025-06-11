
const mongoose = require('mongoose');

const SocialSchema = new mongoose.Schema({
  type: { type: String, required: true },
  link: { type: String, required: true }
}, { _id: false });

const AddressSchema = new mongoose.Schema({
  street: String,
  number: String,
  district: String,
  city: String,
  state: String,
  zip: String
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  birthDate: { type: Date },
  documentId: { type: String },
  phone: { type: String },
  address: AddressSchema,
  profileImage: { type: String },
  bio: { type: String },
  socialLinks: [SocialSchema],
  disabled: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', ProfileSchema);
