const Order = require('../models/Order');
const User = require('../models/User');

// Statuses counted as "active" when measuring a driver's current load.
const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];
// Statuses the system is willing to auto-assign a driver to.
const DISPATCHABLE_STATUSES = ['confirmed', 'preparing'];

const countActiveLoads = async (driverIds) => {
  const agg = await Order.aggregate([
    { $match: { driver: { $in: driverIds }, status: { $in: ACTIVE_STATUSES } } },
    { $group: { _id: '$driver', n: { $sum: 1 } } },
  ]);
  const map = {};
  agg.forEach((row) => { map[row._id.toString()] = row.n; });
  return map;
};

// @desc    Get dispatch board: unassigned orders + drivers with their load
// @route   GET /api/dispatch
// @access  Private (admin, manager)
const getDispatchBoard = async (req, res) => {
  try {
    const orders = await Order.find({ driver: null, status: { $in: [...DISPATCHABLE_STATUSES, 'pending'] } })
      .populate('restaurant', 'name')
      .populate('customer', 'name phone')
      .sort({ createdAt: 1 });

    const drivers = await User.find({ role: 'driver' }).select('name email phone').lean();
    const loads = await countActiveLoads(drivers.map((d) => d._id));
    const driverRows = drivers.map((d) => ({
      _id: d._id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      activeLoad: loads[d._id.toString()] || 0,
    }));

    // Group counts for the board summary.
    const stats = {
      awaitingDriver: orders.length,
      readyToDispatch: orders.filter((o) => DISPATCHABLE_STATUSES.includes(o.status)).length,
      activeDrivers: driverRows.filter((d) => d.activeLoad > 0).length,
      totalDrivers: driverRows.length,
    };

    res.json({ orders, drivers: driverRows, stats });
  } catch (error) {
    console.error('Get dispatch board error:', error.message);
    res.status(500).json({ message: 'Failed to load dispatch board' });
  }
};

// @desc    Auto-distribute unassigned orders across available drivers
// @route   POST /api/dispatch/auto
// @access  Private (admin, manager)
//
// Balances by fewest active deliveries first (iterated oldest-order-first).
// Optionally pass { includePending: true } to also auto-assign pending orders.
const autoDispatch = async (req, res) => {
  try {
    const includePending = Boolean(req.body?.includePending);
    const statuses = includePending
      ? [...DISPATCHABLE_STATUSES, 'pending']
      : DISPATCHABLE_STATUSES;

    const orders = await Order.find({ driver: null, status: { $in: statuses } }).sort({ createdAt: 1 });

    const drivers = await User.find({ role: 'driver' }).select('name email phone').lean();
    if (drivers.length === 0) {
      return res.status(400).json({ message: 'No drivers available to assign. Add drivers first.' });
    }

    const loads = await countActiveLoads(drivers.map((d) => d._id));
    const loadPerDriver = drivers.map((d) => ({
      _id: d._id,
      name: d.name,
      load: loads[d._id.toString()] || 0,
    }));

    const assigned = [];
    const errors = [];

    for (const order of orders) {
      // Pick the driver with the smallest current load (ties broken by name for
      // stability). This rounds the delivery load across every driver.
      loadPerDriver.sort((a, b) => a.load - b.load || String(a.name || '').localeCompare(String(b.name || '')));
      const target = loadPerDriver[0];
      if (!target) break;

      try {
        order.driver = target._id;
        await order.save();
        assigned.push({
          orderId: order._id,
          orderNumber: order._id.toString().slice(-8),
          driverId: target._id,
          driverName: target.name,
        });
        target.load += 1;
      } catch (err) {
        errors.push({ orderId: order._id.toString(), message: err.message });
      }
    }

    // Fresh driver rows so the frontend can re-render the board.
    const freshDrivers = await User.find({ role: 'driver' }).select('name email phone').lean();
    const freshLoads = await countActiveLoads(freshDrivers.map((d) => d._id));
    const driverRows = freshDrivers.map((d) => ({
      _id: d._id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      activeLoad: freshLoads[d._id.toString()] || 0,
    }));

    res.json({ assigned, errors, drivers: driverRows });
  } catch (error) {
    console.error('Auto dispatch error:', error.message);
    res.status(500).json({ message: 'Failed to distribute orders' });
  }
};

module.exports = { getDispatchBoard, autoDispatch };