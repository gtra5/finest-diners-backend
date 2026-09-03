const express = require('express');
const router = express.Router();
const { submitComplaint, getAllComplaints, respondToComplaint } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Submit a complaint (customer only)
router.post('/', protect, authorize('customer'), submitComplaint);

// Get all complaints (admin, manager, employee)
router.get('/', protect, authorize('admin', 'manager', 'employee'), getAllComplaints);

// Respond to a complaint (admin, manager, employee)
router.put('/:orderId/respond', protect, authorize('admin', 'manager', 'employee'), respondToComplaint);

module.exports = router;
