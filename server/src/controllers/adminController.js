const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const {
  validateName, validateEmail, validatePassword,
  validateAddress, validateRole, runValidations,
} = require('../validators/validators');

/**
 * GET /api/admin/dashboard
 * Returns aggregate statistics for the admin dashboard.
 */
async function getDashboard(req, res, next) {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return successResponse(res, 'Dashboard data retrieved.', {
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users
 * Lists users with search, filter, sort, and pagination.
 */
async function getUsers(req, res, next) {
  try {
    const {
      search, role,
      sortBy = 'name', sortOrder = 'asc',
      page = 1, limit = 10,
    } = req.query;

    const where = {};
    const filters = [];

    if (search) {
      filters.push({
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { address: { contains: search } },
        ],
      });
    }

    if (role) {
      filters.push({ role });
    }

    if (filters.length > 0) {
      where.AND = filters;
    }

    const allowedSort = ['name', 'email', 'role', 'createdAt'];
    const orderField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const orderDir = sortOrder === 'desc' ? 'desc' : 'asc';

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const take = Math.min(50, Math.max(1, Number(limit)));

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
        orderBy: { [orderField]: orderDir },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse(res, 'Users retrieved.', {
      users,
      pagination: { page: Number(page), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users/:id
 * Returns detailed user info. If STORE_OWNER, includes stores and average ratings.
 */
async function getUserById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return errorResponse(res, 'Invalid user ID.', 400);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, address: true, role: true, createdAt: true,
        stores: {
          select: {
            id: true, name: true, email: true, address: true,
            ratings: { select: { rating: true } },
          },
        },
      },
    });

    if (!user) return errorResponse(res, 'User not found.', 404);

    // Calculate average rating for each store
    const userData = {
      ...user,
      stores: user.stores.map((store) => {
        const ratings = store.ratings;
        const avgRating = ratings.length > 0
          ? parseFloat((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2))
          : 0;
        return { id: store.id, name: store.name, email: store.email, address: store.address, averageRating: avgRating, totalRatings: ratings.length };
      }),
    };

    return successResponse(res, 'User details retrieved.', userData);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/users
 * Admin creates a new user (any role).
 */
async function createUser(req, res, next) {
  try {
    const { name, email, password, address, role } = req.body;

    const validationError = runValidations([
      { error: validateName(name) },
      { error: validateEmail(email) },
      { error: validatePassword(password) },
      { error: validateAddress(address) },
      { error: validateRole(role) },
    ]);
    if (validationError) return errorResponse(res, validationError);

    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) return errorResponse(res, 'An account with this email already exists.', 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        address: address.trim(),
        role,
      },
    });

    return successResponse(res, 'User created successfully.', {
      id: user.id, name: user.name, email: user.email, role: user.role,
    }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/stores
 * Lists stores with search, sort, and pagination. Includes computed average rating.
 */
async function getStores(req, res, next) {
  try {
    const {
      search,
      sortBy = 'name', sortOrder = 'asc',
      page = 1, limit = 10,
    } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const allowedSort = ['name', 'email', 'createdAt'];
    const orderField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const orderDir = sortOrder === 'desc' ? 'desc' : 'asc';

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const take = Math.min(50, Math.max(1, Number(limit)));

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          ratings: { select: { rating: true } },
        },
        orderBy: { [orderField]: orderDir },
        skip,
        take,
      }),
      prisma.store.count({ where }),
    ]);

    const storesWithRating = stores.map((store) => {
      const ratings = store.ratings;
      const averageRating = ratings.length > 0
        ? parseFloat((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2))
        : 0;
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        averageRating,
        totalRatings: ratings.length,
        createdAt: store.createdAt,
      };
    });

    // Handle sorting by rating (post-query since it's computed)
    if (sortBy === 'rating') {
      storesWithRating.sort((a, b) =>
        sortOrder === 'desc' ? b.averageRating - a.averageRating : a.averageRating - b.averageRating
      );
    }

    return successResponse(res, 'Stores retrieved.', {
      stores: storesWithRating,
      pagination: { page: Number(page), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/stores
 * Admin creates a new store assigned to a store owner.
 */
async function createStore(req, res, next) {
  try {
    const { name, email, address, ownerId } = req.body;

    const nameError = validateName(name);
    if (nameError) return errorResponse(res, nameError);

    const emailError = validateEmail(email);
    if (emailError) return errorResponse(res, emailError);

    const addressError = validateAddress(address);
    if (addressError) return errorResponse(res, addressError);

    if (!ownerId) return errorResponse(res, 'Store owner is required.');

    const owner = await prisma.user.findUnique({ where: { id: Number(ownerId) } });
    if (!owner) return errorResponse(res, 'Selected store owner does not exist.', 404);
    if (owner.role !== 'STORE_OWNER') return errorResponse(res, 'Selected user is not a store owner.');

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        ownerId: Number(ownerId),
      },
    });

    return successResponse(res, 'Store created successfully.', store, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/store-owners
 * Returns list of store owners (for dropdown when creating a store).
 */
async function getStoreOwners(req, res, next) {
  try {
    const owners = await prisma.user.findMany({
      where: { role: 'STORE_OWNER' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    return successResponse(res, 'Store owners retrieved.', owners);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard, getUsers, getUserById, createUser,
  getStores, createStore, getStoreOwners,
};
