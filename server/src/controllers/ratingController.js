const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { validateRating } = require('../validators/validators');

/**
 * POST /api/ratings
 * Submit a new rating for a store.
 */
async function submitRating(req, res, next) {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    const ratingError = validateRating(rating);
    if (ratingError) return errorResponse(res, ratingError);

    if (!storeId) return errorResponse(res, 'Store ID is required.');

    const store = await prisma.store.findUnique({ where: { id: Number(storeId) } });
    if (!store) return errorResponse(res, 'Store not found.', 404);

    // Check if user already rated this store
    const existing = await prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId: Number(storeId) } },
    });

    if (existing) {
      return errorResponse(res, 'You have already rated this store. Use update instead.', 409);
    }

    const newRating = await prisma.rating.create({
      data: { rating: Number(rating), userId, storeId: Number(storeId) },
    });

    return successResponse(res, 'Rating submitted successfully.', newRating, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/ratings/:id
 * Update an existing rating.
 */
async function updateRating(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { rating } = req.body;
    const userId = req.user.id;

    if (isNaN(id)) return errorResponse(res, 'Invalid rating ID.', 400);

    const ratingError = validateRating(rating);
    if (ratingError) return errorResponse(res, ratingError);

    const existing = await prisma.rating.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, 'Rating not found.', 404);
    if (existing.userId !== userId) return errorResponse(res, 'You can only modify your own ratings.', 403);

    const updated = await prisma.rating.update({
      where: { id },
      data: { rating: Number(rating) },
    });

    return successResponse(res, 'Rating updated successfully.', updated);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ratings/store/:storeId
 * Get all ratings for a specific store.
 */
async function getStoreRatings(req, res, next) {
  try {
    const storeId = Number(req.params.storeId);
    if (isNaN(storeId)) return errorResponse(res, 'Invalid store ID.', 400);

    const ratings = await prisma.rating.findMany({
      where: { storeId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, 'Store ratings retrieved.', ratings);
  } catch (err) {
    next(err);
  }
}

module.exports = { submitRating, updateRating, getStoreRatings };
