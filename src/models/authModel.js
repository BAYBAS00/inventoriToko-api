const dbPool = require('../config/database');

const findUserEmail = async (email) => {
    const Query = `SELECT * FROM auth WHERE email = ?`;
    const [rows] = await dbPool.execute(Query, [email]);
    return rows.length > 0 ? rows[0] : null;
};

const registerUser = async (body) => {
    const Query = `INSERT INTO auth (username, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`;
    await dbPool.execute(Query, [body.username, body.email, body.password, body.createdAt, body.updatedAt]);
};

const updatePassword = async (email, newPassword, updatedAt) => {
    const Query = `UPDATE auth SET password = ?, updatedAt = ? WHERE email = ?`;
    const [result] = await dbPool.execute(Query, [newPassword, updatedAt, email]);

    return result.affectedRows > 0;
};

const updateUsername = async (email, newUsername, updatedAt) => {
    const Query = `UPDATE auth SET username = ?, updatedAt = ? WHERE email = ?`;
    const [result] = await dbPool.execute(Query, [newUsername, updatedAt, email]);

    return result.affectedRows > 0;
};

const findToken = async (email, token) => {
    const Query = `SELECT token, expiresIn FROM resetToken WHERE email = ?`;
    const [rows] = await dbPool.execute(Query, [email]);

    if(rows.length === 0) return null;
    const data = rows[0];

    if(data.token !== token || data.expiresIn <= Date.now()) {
        return null;
    }

    return data;
};

const resetToken = async (email, token, expiresIn) => {
    const Query = `INSERT INTO resetToken (email, token, expiresIn) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token), expiresIn = VALUES(expiresIn)`;
    await dbPool.execute(Query, [email, token, expiresIn]);
};

const deleteToken = async (email) => {
    const Query = `DELETE FROM resetToken WHERE email = ?`;
    await dbPool.execute(Query, [email]);
};


module.exports = {
    findUserEmail,
    registerUser,
    updatePassword,
    updateUsername,
    findToken,
    resetToken,
    deleteToken
}

