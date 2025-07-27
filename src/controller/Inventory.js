const inventoryModel = require('../models/inventoryModel');

const getProducts = async (req, res) => {
    try {
        const products = await inventoryModel.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addToCart = async (req, res) => {
    const userId = req.user.id; // dari middleware JWT
    const { productId, quantity } = req.body;
    try {
        await inventoryModel.addToCart(userId, productId, quantity);
        res.json({ message: 'Produk ditambahkan ke keranjang' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getCart = async (req, res) => {
    const userId = req.user.id;
    try {
        const cart = await inventoryModel.getCart(userId);
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const checkout = async (req, res) => {
    const userId = req.user.id;
    try {
        const cartItems = await inventoryModel.getCart(userId);
        const totalPrice = cartItems.reduce((sum, item) => sum + item.total, 0);
        const transactionId = await inventoryModel.checkout(userId, cartItems, totalPrice);
        res.status(201).json({ message: 'Pembayaran berhasil', transactionId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getProducts,
    addToCart,
    getCart,
    checkout
};
