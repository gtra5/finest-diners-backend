const axios = require('axios');

const BASE_URL = 'https://api.spoonacular.com';

/**
 * Search recipes by a single query string.
 * Throws a descriptive error on quota exhaustion (402) or auth failure (401).
 */
const searchRecipes = async (query, number = 10) => {
  const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
    params: {
      query,
      number,
      addRecipeInformation: true,
      apiKey: process.env.SPOONACULAR_API_KEY,
    },
  });
  return response.data.results;
};

/**
 * Fetch menu items by splitting spoonacularQuery into individual terms,
 * running a parallel search for each, then deduplicating.
 *
 * Throws with { quotaExhausted: true } when the 402 limit is hit so the
 * controller can fall back to cached DB data instead of returning empty.
 */
const fetchMenuItems = async (spoonacularQuery, perTerm = 4, totalLimit = 32) => {
  const terms = spoonacularQuery
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const results = await Promise.allSettled(
    terms.map((term) => searchRecipes(term, perTerm))
  );

  // Surface quota / auth errors so the caller can handle them explicitly
  for (const result of results) {
    if (result.status === 'rejected') {
      const status = result.reason?.response?.status;
      const msg    = result.reason?.response?.data?.message || result.reason?.message;
      if (status === 402) {
        const err = new Error(`Spoonacular quota exhausted: ${msg}`);
        err.quotaExhausted = true;
        throw err;
      }
      if (status === 401) {
        throw new Error(`Spoonacular API key invalid: ${msg}`);
      }
      // Non-fatal: log and continue with whatever succeeded
      console.warn(`Spoonacular search failed for a term: ${msg}`);
    }
  }

  const seen   = new Set();
  const merged = [];

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const recipe of result.value) {
      if (!seen.has(recipe.id)) {
        seen.add(recipe.id);
        merged.push(recipe);
        if (merged.length >= totalLimit) return merged;
      }
    }
  }

  return merged;
};

/**
 * Get full details for a single recipe by its Spoonacular ID.
 */
const getRecipeById = async (id) => {
  const response = await axios.get(`${BASE_URL}/recipes/${id}/information`, {
    params: { apiKey: process.env.SPOONACULAR_API_KEY },
  });
  return response.data;
};

module.exports = { searchRecipes, fetchMenuItems, getRecipeById };
