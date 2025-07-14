// Updated api.js with enhanced category and product services
import axios from 'axios';

const API_URL = 'http://localhost:3700/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  createAdmin: (data) => api.post('/auth/create-admin', data),
};

export const productService = {
  // Basic product operations
  getAllProducts: (params) => {
    // Convert params object to query string if provided
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get(`/products/getAll${queryString}`);
  },
  getProductById: (id) => api.get(`/products/byId/${id}`),
  createProduct: (data) => api.post('/products/create', data),
  updateProduct: (id, data) => api.put(`/products/update/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/delete/confirm/${id}`),

  // Category-based product filtering
  getProductsByParentCategory: (id) => api.get(`/products/byParentCategory/${id}`),
  getProductsByChildCategory: (id) => api.get(`/products/byChildCategory/${id}`),

  // Enhanced product filtering with query params
  getFilteredProducts: (filters) => {
    const queryString = new URLSearchParams(filters).toString();
    return api.get(`/products/getAll?${queryString}`);
  },

  // Upload product image
  uploadProductImage: (formData) => {
    return api.post('/upload/product-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const orderService = {
  // Customer endpoints
  createOrder: (data) => api.post('/orders', data),
  getUserOrders: () => api.get('/orders/myorders'),
  getOrderById: (id) => api.get(`/orders/by-id/${id}`),

  // Admin endpoints
  getAllOrders: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/orders?${queryString}`);
  },

  updateOrderStatus: (id, statusData) => api.put(`/orders/status/${id}`, statusData),
  updatePaymentStatus: (id, paymentData) => api.put(`/orders/${id}/payment`, paymentData),
  updateTracking: (id, trackingData) => api.put(`/orders/${id}/tracking`, trackingData),
  updateOrderNotes: (id, notes) => api.put(`/orders/${id}/notes`, { adminNotes: notes }),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
};

export const shopInfoService = {
  getShopInfo: () => api.get('/shop'),
  updateShopInfo: (data) => api.put('/shop/infoUpdate', data),
  updateStoreHours: (data) => api.put('/shop/hours', data),
};

export const categoryService = {
  getAllCategories: () => api.get('/products/categories'),
  getCategoryById: (id) => api.get(`/products/categories/byId/${id}`),
  createCategory: (data) => api.post('/products/categories/create', data),
  updateCategory: (id, data) => api.put(`/products/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/products/categories/${id}`),

  getParentCategories: () => api.get('/products/categories?parentOnly=true'),

  getChildCategories: (parentId) => api.get(`/products/categories?parent=${parentId}`),

  getCategoryStructure: () => api.get('/products/categories?structure=true'),
};

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post('/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
  clearWishlist: () => api.delete('/wishlist'),
  checkProductInWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
};


export default api;