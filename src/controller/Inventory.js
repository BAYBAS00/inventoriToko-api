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
    const { productid, quantity } = req.body;

    console.log("DEBUG: addToCart request received:");
    console.log("User ID (from token):", userId);
    console.log("Product ID (from body):", productid);
    console.log("Quantity (from body):", quantity);

    try {
        await inventoryModel.addToCart(userId, productid, quantity);
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

const deleteCartItem = async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.productId; // Ambil productId dari parameter URL

    console.log("DEBUG: deleteCartItem request received:");
    console.log("User ID (from token):", userId);
    console.log("Product ID (from params):", productId);

    try {
        await inventoryModel.deleteCartItem(userId, productId);
        res.json({ message: 'Produk dihapus dari keranjang' });
    } catch (err) {
        console.error('Error in deleteCartItem:', err);
        res.status(500).json({ message: err.message });
    }
};

const clearCart = async (req, res) => {
    const userId = req.user.id;

    console.log("DEBUG: clearCart request received:");
    console.log("User ID (from token):", userId);

    try {
        await inventoryModel.clearCart(userId);
        res.json({ message: 'Keranjang berhasil dikosongkan' });
    } catch (err) {
        console.error('Error in clearCart:', err);
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
    deleteCartItem,
    clearCart,
    checkout
};
