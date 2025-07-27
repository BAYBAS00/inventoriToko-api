const db = require('../config/database');

module.exports = {
    getAllProducts: async () => {
        const [rows] = await db.execute("SELECT * FROM products");
        return rows;
    },

    addToCart: async (userId, productId, quantity) => {
        const query = `
            INSERT INTO carts (user_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
        await db.execute(query, [userId, productId, quantity]);
    },

    getCart: async (userId) => {
    const query = `
        SELECT 
            c.product_id,
            p.name,
            p.price,
            c.quantity,
            (p.price * c.quantity) AS total
        FROM carts c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
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
                await conn.execute(
                    `INSERT INTO transaction_items (transaction_id, product_id, quantity, price)
                    VALUES (?, ?, ?, ?)`,
                    [transactionId, item.product_id, item.quantity, item.price]
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
