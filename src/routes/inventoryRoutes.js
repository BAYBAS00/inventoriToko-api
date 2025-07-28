const express = require('express');
const router = express.Router();
const controller = require('../controller/Inventory');
const authToken = require('../middleware/authMiddleware');

router.get('/products', controller.getProducts);
router.get('/products/:productId', controller.getProductById);
router.post('/cart', authToken, controller.addToCart);
router.put('/cart/:productId', authToken, controller.updateCartItemQuantity);
router.get('/cart', authToken, controller.getCart);
router.delete('/cart/:productId', authToken, controller.deleteCartItem);
router.delete('/cart', authToken, controller.clearCart);
router.post('/checkout', authToken, controller.checkout);
router.post('/direct-checkout', authToken, controller.directCheckout);
router.get('/history', authToken, controller.getPurchaseHistory);

module.exports = router;
