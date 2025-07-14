const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentId: {
    type: String
  },
  paymentDetails: {
    type: Object
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Order Confirmed', 'Payment Processing', 'Order Processing', 'Order Shipped', 'Delivered', 'Cancelled'],
    default: 'Order Confirmed'
  },
  statusHistory: [
    {
      status: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        required: true,
        default: Date.now
      },
      note: {
        type: String
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ],
  tracking: {
    trackingNumber: {
      type: String
    },
    carrier: {
      type: String
    },
    trackingUrl: {
      type: String
    },
    updatedAt: {
      type: Date
    }
  },
  adminNotes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);