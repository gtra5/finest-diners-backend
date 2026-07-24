const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const { fetchMenuItems, getRecipeById } = require('../services/spoonacularService');

// How many hours before we consider the cache stale and try to refresh
const CACHE_TTL_HOURS = 24;

const isCacheStale = (cachedAt) => {
  if (!cachedAt) return true;
  const ageMs = Date.now() - new Date(cachedAt).getTime();
  return ageMs > CACHE_TTL_HOURS * 60 * 60 * 1000;
};

// @desc    Get menu for the restaurant
//          Strategy: serve from MongoDB cache first.
//          If cache is empty or stale, fetch from Spoonacular and persist.
//          If Spoonacular quota is exhausted, serve stale cache rather than failing.
// @route   GET /api/food/menu/:restaurantId
// @access  Public
const getMenuByRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // ── 1. Load whatever is already cached in MongoDB ──────────────────────
    const cachedFoods = await Food.find({ restaurant: restaurant._id });
    const cacheIsEmpty = cachedFoods.length === 0;
    const cacheIsStale = cachedFoods.some((f) => isCacheStale(f.cachedAt));

    // ── 2. If cache is good, serve it immediately ──────────────────────────
    if (!cacheIsEmpty && !cacheIsStale) {
      const menu = cachedFoods
        .filter((f) => f.isAvailable)
        .map(formatCachedFood);
      return res.json({ restaurant, menu, source: 'cache' });
    }

    // ── 3. Try to refresh from Spoonacular ─────────────────────────────────
    let spoonacularResults = [];
    let quotaExhausted = false;

    try {
      spoonacularResults = await fetchMenuItems(
        restaurant.spoonacularQuery || restaurant.cuisine || restaurant.name,
        4,
        12
      );
    } catch (err) {
      if (err.quotaExhausted) {
        quotaExhausted = true;
        console.warn('⚠️  Spoonacular quota exhausted — serving from cache');
      } else {
        throw err; // Unexpected error — let the outer catch handle it
      }
    }

    // ── 4. If quota hit but we have stale cache, serve it ─────────────────
    if (quotaExhausted && !cacheIsEmpty) {
      const menu = cachedFoods
        .filter((f) => f.isAvailable)
        .map(formatCachedFood);
      return res.json({ restaurant, menu, source: 'stale_cache' });
    }

    // ── 5. Quota hit and no cache at all — return a clear error ───────────
    if (quotaExhausted && cacheIsEmpty) {
      return res.status(503).json({
        message:
          'Menu is temporarily unavailable — Spoonacular API daily quota reached. ' +
          'Run "node seed.js --menu" to pre-cache the menu, or wait until midnight UTC for the quota to reset.',
      });
    }

    // ── 6. Persist fresh Spoonacular results into MongoDB ─────────────────
    const now = new Date();
    const upsertOps = spoonacularResults.map((recipe) => ({
      updateOne: {
        filter: { spoonacularId: recipe.id },
        update: {
          $set: {
            spoonacularId:  recipe.id,
            restaurant:     restaurant._id,
            name:           recipe.title,
            // Keep any manually set price; default to a realistic range
            imageUrl:       recipe.image || '',
            readyInMinutes: recipe.readyInMinutes ?? null,
            servings:       recipe.servings ?? null,
            description:    recipe.summary
              ? recipe.summary.replace(/<[^>]+>/g, '').slice(0, 160)
              : '',
            category:       'Main',
            isAvailable:    true,
            cachedAt:       now,
          },
          // Only set price and name on first insert — don't overwrite manual edits
          $setOnInsert: {
            price: parseFloat((Math.random() * 12 + 6).toFixed(2)),
          },
        },
        upsert: true,
      },
    }));

    await Food.bulkWrite(upsertOps);

    // Re-read from DB so we return the final merged state
    const freshFoods = await Food.find({ restaurant: restaurant._id });
    const menu = freshFoods
      .filter((f) => f.isAvailable)
      .map(formatCachedFood);

    return res.json({ restaurant, menu, source: 'spoonacular' });
  } catch (error) {
    console.error('getMenuByRestaurant error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Shape a Food document into the response the frontend expects
const formatCachedFood = (f) => ({
  spoonacularId:  f.spoonacularId,
  name:           f.name,
  price:          f.price,
  category:       f.category,
  isAvailable:    f.isAvailable,
  description:    f.description,
  imageUrl:       f.imageUrl,
  readyInMinutes: f.readyInMinutes,
  servings:       f.servings,
});

// @desc    Get single food item detail
// @route   GET /api/food/:spoonacularId
// @access  Public
const getFoodDetail = async (req, res) => {
  try {
    const spoonacularId = parseInt(req.params.spoonacularId, 10);

    if (isNaN(spoonacularId)) {
      return res.status(400).json({ message: 'Invalid food ID — must be a number' });
    }

    // Try cache first
    const localFood = await Food.findOne({ spoonacularId });
    if (localFood) {
      return res.json(formatCachedFood(localFood));
    }

    // Fall back to live Spoonacular call
    const recipe = await getRecipeById(spoonacularId);
    res.json({
      spoonacularId:  recipe.id,
      name:           recipe.title,
      price:          parseFloat((Math.random() * 12 + 6).toFixed(2)),
      category:       'Main',
      isAvailable:    true,
      description:    recipe.summary?.replace(/<[^>]+>/g, '').slice(0, 300) || '',
      imageUrl:       recipe.image || '',
      readyInMinutes: recipe.readyInMinutes,
      servings:       recipe.servings,
      ingredients:    recipe.extendedIngredients?.map((i) => i.original) || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update a local food override (price, name, availability)
// @route   POST /api/food
// @access  Private (admin)
const upsertFood = async (req, res) => {
  try {
    const { spoonacularId, restaurant, name, price, category, isAvailable, description } = req.body;
    const food = await Food.findOneAndUpdate(
      { spoonacularId },
      { spoonacularId, restaurant, name, price, category, isAvailable, description },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMenuByRestaurant, getFoodDetail, upsertFood };
