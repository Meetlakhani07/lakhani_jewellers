const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByParentCategory,
  getProductsByChildCategory
} = require('../controllers/productController');

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById
} = require('../controllers/productCategoryController');
const { protect, admin } = require('../middleware/auth');

// Product routes
router.get('/getAll', getProducts);
router.get('/byId/:id', getProductById);
router.post('/create', protect, admin, createProduct);
router.put('/update/:id', protect, admin, updateProduct);
router.delete('/delete/confirm/:id', protect, admin, deleteProduct);

// Category-based product routes
router.get('/byParentCategory/:id', getProductsByParentCategory);
router.get('/byChildCategory/:id', getProductsByChildCategory);

// Category management routes
router.get('/categories', getCategories);
router.get('/categories/byId/:id', getCategoryById);
router.post('/categories/create', protect, admin, createCategory);
router.put('/categories/:id', protect, admin, updateCategory);
router.delete('/categories/:id', protect, admin, deleteCategory);

module.exports = router;