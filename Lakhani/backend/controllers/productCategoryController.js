const ProductCategory = require('../models/ProductCategory');
const slugify = require('slugify');

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, parentCategory } = req.body;

        const slug = slugify(name, { lower: true });

        const existingCategory = await ProductCategory.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        const categoryData = {
            name,
            slug,
            description
        };

        if (parentCategory) {
            categoryData.parentCategory = parentCategory;
        }

        const category = new ProductCategory(categoryData);
        const savedCategory = await category.save();

        res.status(201).json({
            success: true,
            category: savedCategory
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await ProductCategory.find({})
            .populate('parentCategory', 'name _id');

        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await ProductCategory.findById(req.params.id)
            .populate('parentCategory', 'name _id');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error.message
        });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, parentCategory, isActive } = req.body;
        const updateData = {};

        if (name) {
            updateData.name = name;
            updateData.slug = slugify(name, { lower: true });
        }

        if (description !== undefined) updateData.description = description;
        if (parentCategory !== undefined) updateData.parentCategory = parentCategory;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedCategory = await ProductCategory.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('parentCategory', 'name _id');

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            category: updatedCategory
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        // Check if category has child categories
        const childCategories = await ProductCategory.find({ parentCategory: req.params.id });
        if (childCategories.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with child categories. Please delete or reassign child categories first.'
            });
        }

        const deletedCategory = await ProductCategory.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
};