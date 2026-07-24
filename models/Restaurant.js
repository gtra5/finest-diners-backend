const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    cuisine: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    phone: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    deliveryTime: {
      type: String,
      default: '30-45 min',
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    // Spoonacular cuisine query used to fetch menu items for this restaurant
    spoonacularQuery: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
