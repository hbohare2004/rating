const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/store-owner/dashboard
 * Returns the store owner's stores with average ratings and recent activity.
 */
async function getDashboard(req, res, next) {
  try {
    const ownerId = req.user.id;

    const stores = await prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const storesData = stores.map((store) => {
      const ratings = store.ratings;
      const averageRating = ratings.length > 0
        ? parseFloat((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2))
        : 0;

      // Rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach((r) => { distribution[r.rating]++; });

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings: ratings.length,
        distribution,
        ratings: ratings.map((r) => ({
          id: r.id,
          rating: r.rating,
          userName: r.user.name,
          userEmail: r.user.email,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
      };
    });

    return successResponse(res, 'Dashboard data retrieved.', { stores: storesData });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/store-owner/ratings
 * Returns all ratings across the owner's stores.
 */
async function getRatings(req, res, next) {
  try {
    const ownerId = req.user.id;

    const stores = await prisma.store.findMany({
      where: { ownerId },
      select: { id: true },
    });

    const storeIds = stores.map((s) => s.id);

    const ratings = await prisma.rating.findMany({
      where: { storeId: { in: storeIds } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, 'Ratings retrieved.', ratings);
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getRatings };
