const express = require('express');
const router = express.Router();
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkProductInWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getWishlist);

router.post('/', addToWishlist);

router.delete('/', clearWishlist);

router.get('/check/:productId', checkProductInWishlist);

router.delete('/:productId', removeFromWishlist);

module.exports = router;