// models/inventoryModel.js
const db = require('../config/database');

module.exports = {
    getAllProducts: async () => {
        const [rows] = await db.execute("SELECT * FROM products");
        return rows.map(product => ({
            ...product,
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }));
    },

    getProductById: async (productId) => {
        const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [productId]);
        const product = rows[0];
        if (product) {
            return {
                ...product,
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            };
        }
        return undefined;
    },

    addToCart: async (userId, productid, quantity) => {
        const query = `
            INSERT INTO carts (user_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
        await db.execute(query, [userId, productid, quantity]);
    },

    updateCartItemQuantity: async (userId, productId, newQuantity) => {
        try {
            if (newQuantity <= 0) {
                await module.exports.deleteCartItem(userId, productId);
                console.log(`Product ${productId} removed from user ${userId}'s cart due to quantity <= 0.`);
            } else {
                const [result] = await db.execute(
                    'UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?',
                    [newQuantity, userId, productId]
                );
                if (result.affectedRows === 0) {
                    throw new Error('Item keranjang tidak ditemukan atau tidak dapat diperbarui.');
                }
                console.log(`Updated quantity for product ${productId} in user ${userId}'s cart to ${newQuantity}`);
            }
        } catch (error) {
            console.error('Error in inventoryModel.updateCartItemQuantity:', error);
            throw new Error('Gagal memperbarui kuantitas produk di keranjang.');
        }
    },

    getCart: async (userId) => {
        const query = `
            SELECT 
                c.id AS cart_item_id,
                c.user_id,
                c.product_id,
                c.quantity,
                p.id AS product_id_actual,
                p.name AS product_name,
                p.price AS product_price, -- <--- PASTIKAN INI DIAMBIL
                p.stock AS product_stock,
                p.image AS product_image
            FROM carts c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `;
        const [rows] = await db.execute(query, [userId]);

        const formattedResults = rows.map(row => ({
            id: row.cart_item_id,
            user_id: row.user_id,
            product_id: row.product_id,
            quantity: row.quantity,
            product: {
                id: row.product_id_actual,
                name: row.product_name,
                price: row.product_price, // <--- PASTIKAN INI DIGUNAKAN DI SINI
                stock: row.product_stock,
                image: row.product_image,
                description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            }
        }));
        return formattedResults;
    },

    deleteCartItem: async (userId, productId) => {
        const query = `DELETE FROM carts WHERE user_id = ? AND product_id = ?`;
        await db.execute(query, [userId, productId]);
    },

    clearCart: async (userId) => {
        await db.execute("DELETE FROM carts WHERE user_id = ?", [userId]);
    },

    checkout: async (userId, cartItems, totalPrice) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Pastikan totalPrice adalah angka dan format ke 2 desimal jika perlu
            const finalTotalPrice = parseFloat(totalPrice).toFixed(2);
            console.log(`DEBUG: Checkout - User ID: ${userId}, Total Price (before insert): ${totalPrice}, Final Total Price (formatted): ${finalTotalPrice}, Type: ${typeof finalTotalPrice}`);

            const [result] = await conn.execute(
                "INSERT INTO transactions (user_id, total_price, status, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
                [userId, finalTotalPrice, 'PAID'] // Gunakan finalTotalPrice
            );

            const transactionId = result.insertId;
            console.log(`DEBUG: Checkout - Transaction ID: ${transactionId} inserted.`);

            for (const item of cartItems) {
                await conn.execute(
                    `INSERT INTO transaction_items (transaction_id, product_id, quantity, price)
                    VALUES (?, ?, ?, ?)`,
                    [transactionId, item.product_id, item.quantity, item.product.price]
                );

                await conn.execute(
                    `UPDATE products SET stock = stock - ? WHERE id = ?`,
                    [item.quantity, item.product_id]
                );
            }

            await conn.execute(`DELETE FROM carts WHERE user_id = ?`, [userId]);
            await conn.commit();

            return transactionId;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    directCheckoutProduct: async (userId, productId, quantity, totalPrice) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Pastikan totalPrice adalah angka dan format ke 2 desimal jika perlu
            const finalTotalPrice = parseFloat(totalPrice).toFixed(2);
            console.log(`DEBUG: Direct Checkout - User ID: ${userId}, Product ID: ${productId}, Quantity: ${quantity}, Total Price (before insert): ${totalPrice}, Final Total Price (formatted): ${finalTotalPrice}, Type: ${typeof finalTotalPrice}`);

            const [result] = await conn.execute(
                "INSERT INTO transactions (user_id, total_price, status, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
                [userId, finalTotalPrice, 'PAID'] // Gunakan finalTotalPrice
            );
            const transactionId = result.insertId;
            console.log(`DEBUG: Direct Checkout - Transaction ID: ${transactionId} inserted.`);

            const [productInfo] = await conn.execute("SELECT price FROM products WHERE id = ?", [productId]);
            if (!productInfo || productInfo.length === 0) {
                throw new Error("Produk tidak ditemukan.");
            }
            const productPrice = productInfo[0].price;

            await conn.execute(
                `INSERT INTO transaction_items (transaction_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)`,
                [transactionId, productId, quantity, productPrice]
            );

            await conn.execute(
                `UPDATE products SET stock = stock - ? WHERE id = ?`,
                [quantity, productId]
            );

            await conn.commit();
            return transactionId;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    getPurchaseHistory: async (userId) => {
        const query = `
            SELECT
                t.id AS transactionId,
                t.total_price AS transactionTotalPrice,
                t.createdAt AS transactionCreatedAt,
                ti.id AS itemId,
                ti.product_id AS productId,
                ti.quantity,
                ti.price AS itemPrice,
                p.name AS productName,
                p.image AS productImage
            FROM transactions t
            JOIN transaction_items ti ON t.id = ti.transaction_id
            JOIN products p ON ti.product_id = p.id
            WHERE t.user_id = ?
            ORDER BY t.createdAt DESC, ti.id ASC
        `;
        const [rows] = await db.execute(query, [userId]);

        // Format data untuk setiap item secara individual
        const formattedHistory = rows.map(row => {
            // Pastikan total_price dan item_price diformat sebagai string dengan 2 desimal
            const formattedTransactionTotalPrice = parseFloat(row.transactionTotalPrice).toFixed(2);
            const formattedItemPrice = parseFloat(row.itemPrice).toFixed(2);

            // Konversi objek Date ke string ISO 8601 jika createdAt adalah objek Date
            const transactionCreatedAtString = row.transactionCreatedAt instanceof Date ? row.transactionCreatedAt.toISOString() : row.transactionCreatedAt;

            console.log(`DEBUG: Raw DB Row for Item - Transaction ID: ${row.transactionId}, Item ID: ${row.itemId}, TotalPrice: ${row.transactionTotalPrice}, ItemPrice: ${row.itemPrice}`);
            console.log(`DEBUG: Processed Item - TransactionTotalPrice: ${formattedTransactionTotalPrice}, ItemPrice: ${formattedItemPrice}, CreatedAt: ${transactionCreatedAtString}`);

            return {
                transactionId: row.transactionId,
                transactionTotalPrice: formattedTransactionTotalPrice,
                transactionCreatedAt: transactionCreatedAtString,
                itemId: row.itemId,
                productId: row.productId,
                quantity: row.quantity,
                itemPrice: formattedItemPrice,
                productName: row.productName,
                productImage: row.productImage
            };
        });

        return formattedHistory;
    }
};