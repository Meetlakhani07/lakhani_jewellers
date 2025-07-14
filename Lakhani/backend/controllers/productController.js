const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const mongoose = require('mongoose');


const getProducts = async (req, res) => {
  try {
    const {
      category,
      parent,
      sort = 'createdAt',
      order = 'desc',
      limit = 10,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {};
    let categoryIds = [];

    // If category filter is provided
    if (category) {
      // Check if it's a valid MongoDB ObjectId
      const isCategoryId = mongoose.Types.ObjectId.isValid(category);

      // Find the category by ID or slug
      const categoryObj = isCategoryId
        ? await ProductCategory.findById(category)
        : await ProductCategory.findOne({ slug: category });

      if (categoryObj) {
        categoryIds.push(categoryObj._id);
      }
    }

    // If parent category filter is provided
    if (parent) {
      // Check if it's a valid MongoDB ObjectId
      const isParentId = mongoose.Types.ObjectId.isValid(parent);

      // Find the parent category by ID or slug
      const parentCategory = isParentId
        ? await ProductCategory.findById(parent)
        : await ProductCategory.findOne({ slug: parent });

      if (parentCategory) {
        // Add the parent category ID
        categoryIds.push(parentCategory._id);

        // Find all child categories of this parent
        const childCategories = await ProductCategory.find({
          parentCategory: parentCategory._id
        });

        // Add all child category IDs
        if (childCategories.length > 0) {
          childCategories.forEach(child => {
            categoryIds.push(child._id);
          });
        }
      }
    }

    // Apply category filter if category IDs were found
    if (categoryIds.length > 0) {
      filter.category = { $in: categoryIds };
    }

    // Count total products
    const total = await Product.countDocuments(filter);

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const pages = Math.ceil(total / limit);

    // Query products with filter and pagination
    const products = await Product.find(filter)
      .populate('category', 'name _id slug parentCategory')
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          select: 'name _id slug'
        }
      })
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages,
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name _id slug')
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory',
          select: 'name _id slug'
        }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get related products in the same category
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category._id
    })
      .populate('category', 'name _id slug')
      .limit(4);

    res.json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const createProduct = async (req, res) => {
  try {
    const { name, image, category, description, price, countInStock, ...otherFields } = req.body;

    // Validate category
    const categoryExists = await ProductCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Validation for required fields
    if (!name || !image || !category || !description || price === undefined || countInStock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create a slug from the product name
    const slug = name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const product = new Product({
      name,
      slug,
      image,
      category,
      description,
      price,
      countInStock,
      ...otherFields
    });

    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: createdProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const updateProduct = async (req, res) => {
  try {
    const {
      name,
      image,
      images,
      category,
      description,
      price,
      countInStock,
      brand,
      isActive,
      isFeatured,
      tags,
      ...otherFields
    } = req.body;

    // Find the product first
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Generate a slug only if the name has changed
    // This ensures we don't lose the existing slug if name isn't provided
    let slug = product.slug;
    if (name && name !== product.name) {
      slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Update product fields, keeping existing values if not provided
    const updatedProductData = {
      name: name || product.name,
      slug: slug, // Always include the slug (either existing or newly generated)
      image: image || product.image,
      category: category || product.category,
      description: description || product.description,
      price: price !== undefined ? price : product.price,
      countInStock: countInStock !== undefined ? countInStock : product.countInStock,
      brand: brand !== undefined ? brand : product.brand,
      isActive: isActive !== undefined ? isActive : product.isActive,
      isFeatured: isFeatured !== undefined ? isFeatured : product.isFeatured,
    };

    // Handle images array if provided
    if (images) {
      updatedProductData.images = images;
    }

    // Handle tags array if provided
    if (tags) {
      updatedProductData.tags = tags;
    }

    // Handle any other fields
    for (const [key, value] of Object.entries(otherFields)) {
      updatedProductData[key] = value;
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedProductData,
      { new: true, runValidators: true }
    ).populate('category', 'name _id slug parentCategory');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Product removed successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const getProductsByParentCategory = async (req, res) => {
  try {
    const parentCategoryId = req.params.id;

    // Check if parent category exists
    const parentCategory = await ProductCategory.findById(parentCategoryId);
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found'
      });
    }

    // Find all child categories of this parent
    const childCategories = await ProductCategory.find({
      parentCategory: parentCategoryId
    });

    // Combine parent and child category IDs
    const categoryIds = [parentCategoryId];
    if (childCategories.length > 0) {
      childCategories.forEach(child => {
        categoryIds.push(child._id);
      });
    }

    // Find products in any of these categories
    const products = await Product.find({
      category: { $in: categoryIds }
    }).populate('category', 'name _id slug parentCategory');

    res.json({
      success: true,
      count: products.length,
      parentCategory,
      childCategories,
      products
    });
  } catch (error) {
    console.error('Get products by parent category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const getProductsByChildCategory = async (req, res) => {
  try {
    const childCategoryId = req.params.id;

    // Check if child category exists
    const childCategory = await ProductCategory.findById(childCategoryId)
      .populate('parentCategory', 'name _id slug');

    if (!childCategory) {
      return res.status(404).json({
        success: false,
        message: 'Child category not found'
      });
    }

    // Find products in this child category
    const products = await Product.find({
      category: childCategoryId
    }).populate('category', 'name _id slug parentCategory');

    res.json({
      success: true,
      count: products.length,
      childCategory,
      products
    });
  } catch (error) {
    console.error('Get products by child category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByParentCategory,
  getProductsByChildCategory
};