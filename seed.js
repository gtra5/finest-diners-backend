/**
 * Seed script — run once to create the Finest Diners restaurant, admin, and manager.
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas');

  // Wipe existing records so we don't get duplicates on re-run
  await Restaurant.deleteMany({});
  await User.deleteMany({ role: { $in: ['admin', 'manager'] } });

  const restaurant = await Restaurant.create({
    name: 'Finest Diners',
    description: 'Premium food delivered straight to your door. Fresh ingredients, bold flavours.',
    cuisine: 'International',
    address: '1 Finest Street, Lagos, Nigeria',
    phone: '+234 800 000 0000',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    rating: 4.8,
    deliveryTime: '25-40 min',
    isOpen: true,
    spoonacularQuery: 'chicken,pasta,burger,pizza,rice',
  });

  console.log(`🍽️  Restaurant seeded — ID: ${restaurant._id}`);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@finestdiners.com',
    password: 'admin123',
    role: 'admin',
    phone: '+234 800 000 0001',
  });

  const manager = await User.create({
    name: 'Manager',
    email: 'manager@finestdiners.com',
    password: 'manager123',
    role: 'manager',
    phone: '+234 800 000 0002',
  });

  console.log(`👤 Admin seeded — email: admin@finestdiners.com / password: admin123`);
  console.log(`👤 Manager seeded — email: manager@finestdiners.com / password: manager123`);
  console.log(`\nPaste this into your frontend .env file:`);
  console.log(`VITE_RESTAURANT_ID=${restaurant._id}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
