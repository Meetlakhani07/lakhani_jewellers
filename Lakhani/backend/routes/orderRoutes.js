// Updated orderRoutes.js with enhanced admin functionality
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateTracking,
  updateOrderNotes,
  cancelOrder
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// Standard user routes
router.post('/', protect, createOrder);
router.get('/myorders', protect, getUserOrders);
router.get('/by-id/:id', protect, getOrderById);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/status/:id', protect, admin, updateOrderStatus);
router.put('/:id/payment', protect, admin, updatePaymentStatus);
router.put('/:id/tracking', protect, admin, updateTracking);
router.put('/:id/notes', protect, admin, updateOrderNotes);
router.put('/:id/cancel', protect, admin, cancelOrder);

module.exports = router;