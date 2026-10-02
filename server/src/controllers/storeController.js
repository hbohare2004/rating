const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/stores
 * Lists all stores with average ratings and the current user's rating.
 */
async function getStores(req, res, next) {
  try {
    const userId = req.user.id;
    const { search, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const allowedSort = ['name', 'address', 'createdAt'];
    const orderField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const orderDir = sortOrder === 'desc' ? 'desc' : 'asc';

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const take = Math.min(50, Math.max(1, Number(limit)));

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        include: {
          ratings: { select: { rating: true, userId: true, id: true } },
        },
        orderBy: { [orderField]: orderDir },
        skip,
        take,
      }),
      prisma.store.count({ where }),
    ]);

    const storesData = stores.map((store) => {
      const ratings = store.ratings;
      const averageRating = ratings.length > 0
        ? parseFloat((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2))
        : 0;
      const userRating = ratings.find((r) => r.userId === userId);
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings: ratings.length,
        userRating: userRating ? { id: userRating.id, rating: userRating.rating } : null,
      };
    });

    // Handle sorting by rating (post-query since it's computed)
    if (sortBy === 'rating') {
      storesData.sort((a, b) =>
        sortOrder === 'desc' ? b.averageRating - a.averageRating : a.averageRating - b.averageRating
      );
    }

    return successResponse(res, 'Stores retrieved.', {
      stores: storesData,
      pagination: { page: Number(page), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/stores/:id
 * Returns a single store with ratings.
 */
async function getStoreById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return errorResponse(res, 'Invalid store ID.', 400);

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) return errorResponse(res, 'Store not found.', 404);

    const averageRating = store.ratings.length > 0
      ? parseFloat((store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(2))
      : 0;

    return successResponse(res, 'Store details retrieved.', {
      ...store,
      averageRating,
      totalRatings: store.ratings.length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStores, getStoreById };
