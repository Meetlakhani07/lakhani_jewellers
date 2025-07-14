const Order = require('../models/Order');

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'Order Confirmed', // Initial status
      statusHistory: [
        { 
          status: 'Order Confirmed', 
          date: Date.now(), 
          note: 'Order has been successfully placed.'
        }
      ]
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the requesting user is the order owner or an admin
    if (req.user.isAdmin || order.user._id.toString() === req.user._id.toString()) {
      res.json(order);
    } else {
      res.status(403).json({ message: 'Not authorized to view this order' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get logged-in user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get all orders with optional filtering
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Count total documents for pagination
    const total = await Order.countDocuments(filter);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;
    
    // Execute query with pagination and sorting
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status transition
    const validStatuses = ['Order Confirmed', 'Payment Processing', 'Order Processing', 'Order Shipped', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // Update order status
    order.status = status;
    
    // Add to status history
    order.statusHistory.push({
      status,
      date: Date.now(),
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id
    });

    // Update delivery status if necessary
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (status === 'Order Shipped') {
      // Don't mark as delivered, but could set other flags here
    }

    const updatedOrder = await order.save();
    res.json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { isPaid, paymentId, paymentDetails } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update payment status
    order.isPaid = isPaid;
    order.paidAt = isPaid ? Date.now() : null;
    
    // If provided, update payment details
    if (paymentId) {
      order.paymentId = paymentId;
    }
    
    if (paymentDetails) {
      order.paymentDetails = paymentDetails;
    }

    // Add to status history if payment status changed
    const statusNote = isPaid ? 'Payment confirmed' : 'Payment marked as pending';
    order.statusHistory.push({
      status: isPaid ? 'Payment Processing' : order.status,
      date: Date.now(),
      note: statusNote,
      updatedBy: req.user._id
    });

    // If payment is confirmed, update status to Payment Processing if still in Order Confirmed
    if (isPaid && order.status === 'Order Confirmed') {
      order.status = 'Payment Processing';
    }

    const updatedOrder = await order.save();
    res.json({ message: 'Payment status updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update tracking information
const updateTracking = async (req, res) => {
  try {
    const { trackingNumber, carrier, trackingUrl } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update tracking information
    order.tracking = {
      trackingNumber,
      carrier,
      trackingUrl,
      updatedAt: Date.now()
    };

    // If adding tracking, automatically update to shipped status if not already delivered
    if (trackingNumber && carrier && order.status !== 'Delivered' && order.status !== 'Order Shipped') {
      order.status = 'Order Shipped';
      order.statusHistory.push({
        status: 'Order Shipped',
        date: Date.now(),
        note: `Order shipped via ${carrier} with tracking number ${trackingNumber}`,
        updatedBy: req.user._id
      });
    }

    const updatedOrder = await order.save();
    res.json({ message: 'Tracking information updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update order notes
const updateOrderNotes = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update admin notes
    order.adminNotes = adminNotes;

    const updatedOrder = await order.save();
    res.json({ message: 'Order notes updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel an order
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow cancellation if not delivered
    if (order.isDelivered) {
      return res.status(400).json({ message: 'Cannot cancel delivered order' });
    }

    // Update order status
    order.status = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      date: Date.now(),
      note: reason || 'Order cancelled by admin',
      updatedBy: req.user._id
    });

    const updatedOrder = await order.save();
    res.json({ message: 'Order cancelled', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateTracking,
  updateOrderNotes,
  cancelOrder
};