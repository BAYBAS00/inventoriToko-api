// controllers/Inventory.js
const inventoryModel = require('../models/inventoryModel');

const getProducts = async (req, res) => {
    try {
        const products = await inventoryModel.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getProductById = async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await inventoryModel.getProductById(productId);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
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

const updateCartItemQuantity = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    console.log("DEBUG: updateCartItemQuantity request received:");
    console.log("User ID (from token):", userId);
    console.log("Product ID (from params):", productId);
    console.log("New Quantity (from body):", quantity);

    try {
        await inventoryModel.updateCartItemQuantity(userId, parseInt(productId), quantity);
        res.json({ message: 'Kuantitas produk di keranjang diperbarui' });
    } catch (err) {
        console.error('Error in updateCartItemQuantity:', err);
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
    const productId = req.params.productId;

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
        // --- PERBAIKAN DI SINI ---
        console.log("DEBUG: Checkout (Cart) - Retrieved cart items:", JSON.stringify(cartItems, null, 2));
        const totalPrice = cartItems.reduce((sum, item) => {
            // Pastikan item.product dan item.quantity ada
            const itemPrice = item.product?.price || 0;
            const itemQuantity = item.quantity || 0;
            const subtotal = itemPrice * itemQuantity;
            console.log(`DEBUG: Checkout (Cart) - Item: ${item.product?.name}, Price: ${itemPrice}, Qty: ${itemQuantity}, Subtotal: ${subtotal}`);
            return sum + subtotal;
        }, 0);
        console.log(`DEBUG: Checkout (Cart) - Calculated Total Price: ${totalPrice}`);
        // --- AKHIR PERBAIKAN ---

        const transactionId = await inventoryModel.checkout(userId, cartItems, totalPrice);
        res.status(201).json({ message: 'Pembayaran berhasil', transactionId });
    } catch (err) {
        console.error('Error in checkout (cart):', err);
        res.status(500).json({ message: err.message });
    }
};

const directCheckout = async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Product ID dan quantity yang valid harus disediakan.' });
    }

    try {
        const product = await inventoryModel.getProductById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Stok produk tidak mencukupi.' });
        }

        const totalPrice = product.price * quantity;
        console.log(`DEBUG: Direct Checkout - Calculated Total Price: ${totalPrice}`);
        const transactionId = await inventoryModel.directCheckoutProduct(userId, productId, quantity, totalPrice);
        res.status(201).json({ message: 'Pembelian langsung berhasil', transactionId, totalPrice });
    } catch (err) {
        console.error('Error in directCheckout:', err);
        res.status(500).json({ message: err.message });
    }
};

const getPurchaseHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const history = await inventoryModel.getPurchaseHistory(userId);
        res.json(history);
    } catch (err) {
        console.error('Error in getPurchaseHistory:', err);
        res.status(500).json({ message: err.message });
    }
};


module.exports = {
    getProducts,
    getProductById,
    addToCart,
    updateCartItemQuantity,
    getCart,
    deleteCartItem,
    clearCart,
    checkout,
    directCheckout,
    getPurchaseHistory
};