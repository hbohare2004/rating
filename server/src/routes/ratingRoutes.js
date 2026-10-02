const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { submitRating, updateRating, getStoreRatings } = require('../controllers/ratingController');

router.use(authenticateToken);

router.post('/', authorizeRole('USER'), submitRating);
router.put('/:id', authorizeRole('USER'), updateRating);
router.get('/store/:storeId', getStoreRatings);

module.exports = router;
