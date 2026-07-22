/**
 * Pre-cache the menu from Spoonacular into MongoDB.
 * Run this once per day (resets at midnight UTC on the free tier).
 *
 * Usage: node seedMenu.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const axios    = require('axios');
const Food     = require('./models/Food');
const Restaurant = require('./models/Restaurant');

// Hardcoded menu items — used as fallback if Spoonacular quota is exhausted.
// Each item maps to a real Spoonacular recipe ID so images load correctly.
const FALLBACK_MENU = [
  { id: 634476, title: 'BBQ Chicken',          image: 'https://img.spoonacular.com/recipes/634476-312x231.jpg', readyInMinutes: 45, servings: 4 },
  { id: 663971, title: 'Turbo Chicken',         image: 'https://img.spoonacular.com/recipes/663971-312x231.jpg', readyInMinutes: 30, servings: 2 },
  { id: 657933, title: 'Ratatouille Pasta',     image: 'https://img.spoonacular.com/recipes/657933-312x231.jpg', readyInMinutes: 25, servings: 2 },
  { id: 654959, title: 'Pasta With Tuna',       image: 'https://img.spoonacular.com/recipes/654959-312x231.jpg', readyInMinutes: 20, servings: 2 },
  { id: 642540, title: 'Falafel Burgers',       image: 'https://img.spoonacular.com/recipes/642540-312x231.jpg', readyInMinutes: 35, servings: 4 },
  { id: 664011, title: 'Turkey Burgers',        image: 'https://img.spoonacular.com/recipes/664011-312x231.jpg', readyInMinutes: 25, servings: 4 },
  { id: 631814, title: 'Classic Beef Burger',   image: 'https://img.spoonacular.com/recipes/631814-312x231.jpg', readyInMinutes: 20, servings: 2 },
  { id: 663252, title: 'The Blarney Burger',    image: 'https://img.spoonacular.com/recipes/663252-312x231.jpg', readyInMinutes: 30, servings: 2 },
  { id: 782601, title: 'Margherita Pizza',      image: 'https://img.spoonacular.com/recipes/782601-312x231.jpg', readyInMinutes: 40, servings: 4 },
  { id: 716429, title: 'Pasta with Garlic',     image: 'https://img.spoonacular.com/recipes/716429-312x231.jpg', readyInMinutes: 45, servings: 2 },
  { id: 715538, title: 'Bruschetta',            image: 'https://img.spoonacular.com/recipes/715538-312x231.jpg', readyInMinutes: 15, servings: 6 },
  { id: 716426, title: 'Cauliflower Soup',      image: 'https://img.spoonacular.com/recipes/716426-312x231.jpg', readyInMinutes: 45, servings: 8 },
];

const CATEGORIES = {
  chicken: 'Chicken', pasta: 'Pasta', burger: 'Burgers',
  pizza: 'Pizza', soup: 'Soups', salad: 'Salads',
};

const guessCategory = (title = '') => {
  const t = title.toLowerCase();
  for (const [key, label] of Object.entries(CATEGORIES)) {
    if (t.includes(key)) return label;
  }
  return 'Main';
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas');

  const restaurant = await Restaurant.findOne({ name: 'Finest Diners' });
  if (!restaurant) {
    console.error('❌ Restaurant not found. Run "node seed.js" first.');
    process.exit(1);
  }

  // Try live Spoonacular fetch
  let recipes = [];
  let usedFallback = false;

  try {
    console.log('🌐 Fetching from Spoonacular...');
    const terms = (restaurant.spoonacularQuery || 'chicken,pasta,burger,pizza')
      .split(/[,\s]+/).filter(Boolean);

    const results = await Promise.allSettled(
      terms.map((term) =>
        axios.get('https://api.spoonacular.com/recipes/complexSearch', {
          params: { query: term, number: 3, addRecipeInformation: true, apiKey: process.env.SPOONACULAR_API_KEY },
        }).then((r) => r.data.results)
      )
    );

    const seen = new Set();
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      for (const recipe of r.value) {
        if (!seen.has(recipe.id)) { seen.add(recipe.id); recipes.push(recipe); }
      }
    }

    if (recipes.length === 0) throw new Error('No results returned');
    console.log(`✅ Got ${recipes.length} recipes from Spoonacular`);
  } catch (err) {
    const is402 = err.response?.status === 402 || err.message?.includes('quota');
    console.warn(is402
      ? '⚠️  Quota exhausted — using hardcoded fallback menu'
      : `⚠️  Spoonacular error (${err.message}) — using fallback menu`
    );
    recipes = FALLBACK_MENU;
    usedFallback = true;
  }

  // Upsert into MongoDB
  const now = new Date();
  let count = 0;

  for (const recipe of recipes) {
    const price = parseFloat((Math.random() * 12 + 6).toFixed(2));
    await Food.findOneAndUpdate(
      { spoonacularId: recipe.id },
      {
        $set: {
          spoonacularId:  recipe.id,
          restaurant:     restaurant._id,
          name:           recipe.title,
          imageUrl:       recipe.image || '',
          readyInMinutes: recipe.readyInMinutes ?? null,
          servings:       recipe.servings ?? null,
          description:    recipe.summary
            ? recipe.summary.replace(/<[^>]+>/g, '').slice(0, 160)
            : '',
          category:    guessCategory(recipe.title),
          isAvailable: true,
          cachedAt:    now,
        },
        $setOnInsert: { price },
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`  ✔ ${recipe.title}`);
    count++;
  }

  console.log(`\n🍽️  ${count} menu items cached${usedFallback ? ' (from fallback)' : ' (from Spoonacular)'}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ seedMenu failed:', err.message);
  process.exit(1);
});
