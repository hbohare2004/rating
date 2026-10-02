const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getStores, getStoreById } = require('../controllers/storeController');

router.use(authenticateToken);

router.get('/', getStores);
router.get('/:id', getStoreById);

module.exports = router;
