const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');
const { getDeliveryETA } = require('../services/osrmService');

// Orders can only be tracked live while in one of these states — matches
// the lifecycle in models/Order.js. Once an order is delivered/cancelled,
// no one should be able to join or push updates to its room.
const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];

// Never trust a client's own throttling — enforce a floor here regardless
// of how often the driver's browser fires watchPosition callbacks.
const MIN_UPDATE_INTERVAL_MS = 2000;

const roomFor = (orderId) => `order:${orderId}`;

module.exports = function attachOrderTracking(io) {
  // Mirrors authMiddleware.js's `protect`: same token, same JWT_SECRET,
  // same decoded.id -> User lookup. The client sends the token via
  // `auth: { token }` on connect instead of an Authorization header, since
  // that's the idiomatic way to authenticate a Socket.IO handshake.
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization || '').split(' ')[1];

      if (!token) return next(new Error('Not authorized, no token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      return next();
    } catch {
      return next(new Error('Not authorized, token failed'));
    }
  });

  io.on('connection', (socket) => {
    // Set on a successful join, so location:update doesn't need a DB round
    // trip on every single tick — just a cheap in-memory check.
    socket.data.authorizedOrderId = null;
    socket.data.isDriverForOrder = false;
    socket.data.lastUpdateAt = 0;

    socket.on('join_order_room', async ({ orderId } = {}) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          return socket.emit('tracking:error', { message: 'Order not found' });
        }

        const isOwner = order.customer.toString() === socket.user._id.toString();
        const isAssignedDriver =
          order.driver && order.driver.toString() === socket.user._id.toString();
        const isAdmin = socket.user.role === 'admin';

        if (!isOwner && !isAssignedDriver && !isAdmin) {
          return socket.emit('tracking:error', { message: 'Not authorized for this order' });
        }

        if (!ACTIVE_STATUSES.includes(order.status)) {
          return socket.emit('tracking:error', {
            message: 'This order is no longer active for tracking',
          });
        }

        socket.join(roomFor(order._id));
        socket.data.authorizedOrderId = order._id.toString();
        socket.data.isDriverForOrder = isAssignedDriver;

        // Whoever just joined (typically a customer opening the tracking
        // screen mid-delivery) gets the driver's last known point immediately,
        // instead of waiting for the next location:update tick.
        if (order.latitude != null && order.longitude != null) {
          socket.emit('location:current', {
            orderId: order._id.toString(),
            latitude: order.latitude,
            longitude: order.longitude,
            updatedAt: order.locationUpdatedAt,
          });
        }
      } catch {
        socket.emit('tracking:error', { message: 'Failed to join tracking room' });
      }
    });

    socket.on('location:update', async ({ orderId, latitude, longitude } = {}) => {
      // Only the ASSIGNED DRIVER of this order, and only after a successful
      // join for this same order, may push a location. The customer and any
      // admin can only ever receive updates, never send them.
      if (!socket.data.isDriverForOrder || socket.data.authorizedOrderId !== orderId) {
        return socket.emit('tracking:error', { message: 'Not authorized to update this order' });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const now = Date.now();
      if (now - socket.data.lastUpdateAt < MIN_UPDATE_INTERVAL_MS) return;
      socket.data.lastUpdateAt = now;

      try {
        const order = await Order.findById(orderId).select('status latitude longitude deliveryCoordinates');
        if (!order || !ACTIVE_STATUSES.includes(order.status)) return;

        order.latitude = lat;
        order.longitude = lng;
        order.locationUpdatedAt = new Date();
        await order.save();

        // Calculate ETA if OSRM is configured and order has delivery coordinates
        let eta = null;
        if (order.deliveryCoordinates && order.deliveryCoordinates.latitude && order.deliveryCoordinates.longitude) {
          eta = await getDeliveryETA(lat, lng, order.deliveryCoordinates.latitude, order.deliveryCoordinates.longitude);
        }

        io.to(roomFor(orderId)).emit('location:update', {
          orderId,
          latitude: lat,
          longitude: lng,
          updatedAt: order.locationUpdatedAt,
          eta: eta ? eta.etaMinutes : null,
          distance: eta ? eta.distanceKm : null,
        });
      } catch {
        // A dropped tick isn't worth surfacing to the UI — the next one will land.
      }
    });

    socket.on('leave_order_room', ({ orderId } = {}) => {
      if (orderId) socket.leave(roomFor(orderId));
      if (socket.data.authorizedOrderId === orderId) {
        socket.data.authorizedOrderId = null;
        socket.data.isDriverForOrder = false;
      }
    });
  });
};

module.exports.ACTIVE_STATUSES = ACTIVE_STATUSES;
module.exports.roomFor = roomFor;