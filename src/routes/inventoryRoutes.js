const express = require('express');
const router = express.Router();
const controller = require('../controller/Inventory');
const authToken = require('../middleware/authMiddleware');

router.get('/products', controller.getProducts);
router.post('/cart', authToken, controller.addToCart);
router.get('/cart', authToken, controller.getCart);
router.post('/checkout', authToken, controller.checkout);

module.exports = router;
