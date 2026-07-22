/**
 * Seed script — run once to create the Finest Diners restaurant record.
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas');

  // Wipe existing restaurant records so we don't get duplicates on re-run
  await Restaurant.deleteMany({});

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
    // Comma-separated — each term becomes its own Spoonacular search
    spoonacularQuery: 'chicken,pasta,burger,pizza,rice',
  });

  console.log(`🍽️  Restaurant seeded — ID: ${restaurant._id}`);
  console.log('\nPaste this into your frontend .env file:');
  console.log(`VITE_RESTAURANT_ID=${restaurant._id}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
