const express = require('express');
const router = express.Router();
const { 
  getShopInfo, 
  updateShopInfo, 
  updateStoreHours 
} = require('../controllers/shopInfoController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getShopInfo);
router.put('/infoUpdate', protect, admin, updateShopInfo);
router.put('/hours', protect, admin, updateStoreHours);



module.exports = router;