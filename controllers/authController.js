const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../services/emailService');

// Roles that may use this admin portal.
const PORTAL_ROLES = ['admin', 'manager', 'employee'];
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

// Generate a signed JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = [
  // Validation
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // role is NOT taken from req.body — all public registrations are customers
      const user = await User.create({ name, email, password, role: 'customer' });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

// @desc    Login user and return token
// @route   POST /api/auth/login
// @access  Public
const login = [
  // Validation
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      // Explicitly select password since it's excluded by default
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Request a one-time code for portal access
// @route   POST /api/auth/otp/request
// @access  Public (rate-limited)
const otpRequest = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email } = req.body;

      // Only portal-role accounts can request admin access codes.
      const user = await User.findOne({ email });
      if (!user || !PORTAL_ROLES.includes(user.role)) {
        // Deliberately generic — don't reveal whether the address has access.
        return res.json({ sent: true, message: 'If this account has portal access, a code has been sent.' });
      }

      // Invalidate any previous code for this email before issuing a new one.
      await Otp.deleteMany({ email, usedAt: null });

      const code = generateOtp();
      const salt = await bcrypt.genSalt(10);
      const codeHash = await bcrypt.hash(code, salt);

      await Otp.create({
        email,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
      });

      await sendOtpEmail(email, code);

      // Keep the response identical to the non-portal case so addresses with
      // portal access can't be enumerated. In dev the code appears in the
      // server console via emailService's fallback.
      res.json({
        sent: true,
        message: 'If this account has portal access, a code has been sent.',
      });
    } catch (error) {
      console.error('OTP request error:', error.message);
      res.status(500).json({ message: 'Failed to send a code. Please try again.' });
    }
  }
];

// @desc    Verify a one-time code and issue a portal token
// @route   POST /api/auth/otp/verify
// @access  Public (rate-limited)
const otpVerify = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('code')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Code must be 6 digits'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, code } = req.body;

      const otp = await Otp.findOne({ email, usedAt: null }).sort({ createdAt: -1 });
      if (!otp || otp.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Code expired. Request a new one.' });
      }

      const valid = await bcrypt.compare(code, otp.codeHash);
      if (!valid) {
        otp.attempts += 1;
        if (otp.attempts >= OTP_MAX_ATTEMPTS) {
          otp.usedAt = new Date(); // burn the code after too many misses
        }
        await otp.save();
        return res.status(400).json({ message: 'Invalid code. Please try again.' });
      }

      otp.usedAt = new Date();
      await otp.save();

      const user = await User.findOne({ email });
      if (!user || !PORTAL_ROLES.includes(user.role)) {
        return res.status(401).json({ message: 'This account does not have portal access.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (error) {
      console.error('OTP verify error:', error.message);
      res.status(500).json({ message: 'Failed to verify the code. Please try again.' });
    }
  }
];

module.exports = { register, login, getMe, otpRequest, otpVerify };
