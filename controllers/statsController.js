const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// @desc    Get dashboard stats
// @route   GET /api/stats
// @access  Private (admin, manager, employee)
const getStats = async (req, res) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalDrivers,
      totalCustomers,
      totalEmployees,
      totalRestaurants,
      orders,
      activeComplaints,
      recentOrders,
      recentComplaints,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: { $in: ['employee', 'manager'] } }),
      Restaurant.countDocuments(),
      Order.find().select('status totalPrice'),
      Order.countDocuments({ complaint: { $ne: null }, complaintResponse: null }),
      Order.find()
        .populate('restaurant', 'name')
        .populate('customer', 'name email')
        .populate('driver', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      Order.find({ complaint: { $ne: null } })
        .populate('customer', 'name email')
        .populate('restaurant', 'name')
        .sort({ complaintAt: -1 })
        .limit(5),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const ordersByStatus = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      out_for_delivery: 0,
      delivered: 0,
      received: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (ordersByStatus[o.status] !== undefined) {
        ordersByStatus[o.status]++;
      }
    });

    res.json({
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalUsers,
      totalDrivers,
      totalCustomers,
      totalEmployees,
      totalRestaurants,
      activeComplaints,
      ordersByStatus,
      recentOrders,
      recentComplaints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
