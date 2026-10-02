import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  getProfile: () => api.get('/auth/me'),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  getStores: (params) => api.get('/admin/stores', { params }),
  createStore: (data) => api.post('/admin/stores', data),
  getStoreOwners: () => api.get('/admin/store-owners'),
};

export const storeService = {
  getStores: (params) => api.get('/stores', { params }),
  getStoreById: (id) => api.get(`/stores/${id}`),
};

export const ratingService = {
  submitRating: (data) => api.post('/ratings', data),
  updateRating: (id, data) => api.put(`/ratings/${id}`, data),
  getStoreRatings: (storeId) => api.get(`/ratings/store/${storeId}`),
};

export const storeOwnerService = {
  getDashboard: () => api.get('/store-owner/dashboard'),
  getRatings: () => api.get('/store-owner/ratings'),
};
