const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createManager,
  createEmployee,
  createDriver,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin', 'manager'), getAllUsers);
router.get('/:id', authorize('admin', 'manager'), getUserById);

router.post('/manager', authorize('admin'), createManager);
router.post('/employee', authorize('admin', 'manager'), createEmployee);
router.post('/driver', authorize('admin'), createDriver);

router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
