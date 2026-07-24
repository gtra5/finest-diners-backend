const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// This router is mounted at '/api/auth' in server.js.
// Paths here are RELATIVE to that prefix:
//   router.post('/register') → POST /api/auth/register
//   router.post('/login')    → POST /api/auth/login
//   router.get('/me')        → GET  /api/auth/me

router.post('/register', register);
router.post('/login',    login);
router.get('/me', protect, getMe);

module.exports = router;
