const express = require('express');
const router = express.Router();
const { getDispatchBoard, autoDispatch } = require('../controllers/dispatchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', authorize('admin', 'manager'), getDispatchBoard);
router.post('/auto', authorize('admin', 'manager'), autoDispatch);

module.exports = router;