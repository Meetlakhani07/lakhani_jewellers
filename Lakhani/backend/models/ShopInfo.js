const mongoose = require('mongoose');

const ShopInfoSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  storeHours: [
    {
      day: { type: String, required: true },
      openTime: { type: String, required: true },
      closeTime: { type: String, required: true },
      isClosed: { type: Boolean, default: false }
    }
  ],
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    pinterest: { type: String, default: '' }
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ShopInfo', ShopInfoSchema);