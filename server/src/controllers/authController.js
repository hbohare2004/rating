const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { validateName, validateEmail, validatePassword, validateAddress, runValidations } = require('../validators/validators');

/**
 * POST /api/auth/register
 * Register a new normal user.
 */
async function register(req, res, next) {
  try {
    const { name, email, password, address } = req.body;

    const validationError = runValidations([
      { error: validateName(name) },
      { error: validateEmail(email) },
      { error: validatePassword(password) },
      { error: validateAddress(address) },
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
        role: 'USER',
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return successResponse(res, 'Registration successful.', {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) return errorResponse(res, 'Email and password are required.');

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return errorResponse(res, 'Invalid email or password.', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return errorResponse(res, 'Invalid email or password.', 401);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return successResponse(res, 'Login successful.', {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/change-password
 * Change the authenticated user's password.
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse(res, 'All password fields are required.');
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 'New password and confirmation do not match.');
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) return errorResponse(res, passwordError);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return errorResponse(res, 'User not found.', 404);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return errorResponse(res, 'Current password is incorrect.', 401);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

    return successResponse(res, 'Password updated successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Return the current authenticated user's profile.
 */
async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
    });
    if (!user) return errorResponse(res, 'User not found.', 404);
    return successResponse(res, 'Profile retrieved.', user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, changePassword, getProfile };
