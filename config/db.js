const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`🔥 MongoDB Atlas Connected: ${conn.connection.host}`);

  // Ensure indexes for the hottest queries. Idempotent — safe to run on every boot.
  try {
    const { connection } = conn;
    await Promise.all([
      // Customers see "their orders" constantly (checkout → orders page).
      connection.collection('orders').createIndex({ customer: 1, createdAt: -1 }),
      // Dashboard & dispatch sweep by status (pending/assigned/etc.).
      connection.collection('orders').createIndex({ status: 1, createdAt: -1 }),
      // Dispatch board: "driver + open status" lookups.
      connection.collection('orders').createIndex({ driver: 1, status: 1 }),
      // OTP verify: newest unused code for an email.
      connection.collection('otps').createIndex({ email: 1, createdAt: -1 }),
      // Complaints lists per user + per order.
      connection.collection('complaints').createIndex({ user: 1, createdAt: -1 }),
      connection.collection('complaints').createIndex({ order: 1 }),
    ]);
    console.log('📇 Indexes ensured');
  } catch (err) {
    console.warn('⚠️  Index creation skipped:', err.message);
  }
};

module.exports = connectDB;