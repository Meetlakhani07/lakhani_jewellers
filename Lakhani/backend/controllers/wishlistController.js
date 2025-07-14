const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');


const getWishlist = asyncHandler(async (req, res) => {
    // Get the current user's wishlist with populated product details
    const wishlist = await Wishlist.findOne({ user: req.user._id })
        .populate({
            path: 'items.product',
            select: 'name image price category description'
        });

    // If no wishlist exists yet, return an empty array
    if (!wishlist) {
        return res.status(200).json({ items: [] });
    }

    res.status(200).json(wishlist);
});


const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        res.status(400);
        throw new Error('Product ID is required');
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Find user's wishlist or create a new one
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        // Create new wishlist if user doesn't have one
        wishlist = await Wishlist.create({
            user: req.user._id,
            items: [{ product: productId }]
        });
    } else {
        // Check if product is already in wishlist
        const itemExists = wishlist.items.find(
            (item) => item.product.toString() === productId
        );

        if (itemExists) {
            res.status(400);
            throw new Error('Product already in wishlist');
        }

        // Add product to wishlist
        wishlist.items.push({ product: productId });
        await wishlist.save();
    }

    // Fetch the updated wishlist with populated product details
    const updatedWishlist = await Wishlist.findOne({ user: req.user._id })
        .populate({
            path: 'items.product',
            select: 'name image price category description'
        });

    res.status(201).json(updatedWishlist);
});


const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        res.status(404);
        throw new Error('Wishlist not found');
    }

    // Check if product is in wishlist
    const itemIndex = wishlist.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        res.status(404);
        throw new Error('Product not found in wishlist');
    }

    // Remove product from wishlist
    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    // Return updated wishlist
    const updatedWishlist = await Wishlist.findOne({ user: req.user._id })
        .populate({
            path: 'items.product',
            select: 'name image price category description'
        });

    res.status(200).json(updatedWishlist);
});


const clearWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        res.status(404);
        throw new Error('Wishlist not found');
    }

    // Clear all items
    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({ message: 'Wishlist cleared', items: [] });
});


const checkProductInWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        return res.status(200).json({ inWishlist: false });
    }

    // Check if product is in wishlist
    const inWishlist = wishlist.items.some(
        (item) => item.product.toString() === productId
    );

    res.status(200).json({ inWishlist });
});

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkProductInWishlist
};