const db = require('../config/database');

module.exports = {
    getAllProducts: async () => {
        const [rows] = await db.execute("SELECT * FROM products");
        return rows;
    },

    addToCart: async (userId, productid, quantity) => {
        const query = `
            INSERT INTO carts (user_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
        await db.execute(query, [userId, productid, quantity]);
    },

    getCart: async (userId) => {
        const query = `
            SELECT 
                c.id AS cart_item_id,        -- ID dari item keranjang
                c.user_id,                   -- ID pengguna
                c.product_id,                -- ID produk di keranjang
                c.quantity,                  -- Kuantitas produk di keranjang
                p.id AS product_id_actual,   -- ID produk dari tabel products
                p.name AS product_name,      -- Nama produk
                p.price AS product_price,    -- Harga produk
                p.stock AS product_stock,    -- Stok produk
                p.image AS product_image     -- Gambar produk
            FROM carts c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `;
        const [rows] = await db.execute(query, [userId]);

        // Memformat hasil agar sesuai dengan struktur data CartItem di Android
        // Android mengharapkan objek 'product' bersarang di dalam setiap item keranjang
        const formattedResults = rows.map(row => ({
            id: row.cart_item_id,
            user_id: row.user_id,
            product_id: row.product_id,
            quantity: row.quantity,
            product: { // Objek 'product' yang diharapkan oleh model data Android
                id: row.product_id_actual,
                name: row.product_name,
                price: row.product_price,
                stock: row.product_stock,
                image: row.product_image
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

            const [result] = await conn.execute(
                "INSERT INTO transactions (user_id, total_price, status) VALUES (?, ?, 'PAID')",
                [userId, totalPrice]
            );

            const transactionId = result.insertId;

            for (const item of cartItems) {
                // Pastikan Anda mengakses properti yang benar dari item keranjang yang diformat
                // item.product_id dan item.price mungkin perlu disesuaikan jika data dari getCart
                // tidak langsung sesuai (misalnya, jika Anda menggunakan item.product.id)
                await conn.execute(
                    `INSERT INTO transaction_items (transaction_id, product_id, quantity, price)
                    VALUES (?, ?, ?, ?)`,
                    [transactionId, item.product_id, item.quantity, item.product.price] // Menggunakan item.product.price
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
    }
};
