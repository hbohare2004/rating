const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { getDashboard, getRatings } = require('../controllers/storeOwnerController');

router.use(authenticateToken, authorizeRole('STORE_OWNER'));

router.get('/dashboard', getDashboard);
router.get('/ratings', getRatings);

module.exports = router;
