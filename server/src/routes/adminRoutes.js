const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
  getDashboard, getUsers, getUserById, createUser,
  getStores, createStore, getStoreOwners,
} = require('../controllers/adminController');

// All admin routes require authentication + ADMIN role
router.use(authenticateToken, authorizeRole('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.get('/stores', getStores);
router.post('/stores', createStore);
router.get('/store-owners', getStoreOwners);

module.exports = router;
