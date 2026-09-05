const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, getMe, otpRequest, otpVerify } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Rate limiting for auth endpoints (stricter than global limit)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many auth attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP code delivery can be abused to spam an inbox — keep it tight.
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many code requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many verification attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// This router is mounted at '/api/auth' in server.js.
// Paths here are RELATIVE to that prefix:
//   router.post('/register') → POST /api/auth/register
//   router.post('/login')    → POST /api/auth/login
//   router.get('/me')        → GET  /api/auth/me

router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.get('/me', protect, getMe);

router.post('/otp/request', otpRequestLimiter, otpRequest);
router.post('/otp/verify',  otpVerifyLimiter, otpVerify);

module.exports = router;
