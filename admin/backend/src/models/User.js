const db = require("../config/db");

const User = {
  getAll: (callback) => {
    const query = `
      SELECT id, name, email, phone, address, profile_picture,
        is_verified, is_premium, is_active, created_at, last_login
      FROM users
      WHERE is_deleted = 0
    `;
    db.query(query, callback);
  },

  create: ({ name, email, phone, address, is_verified, is_premium, is_active }) => {
    const query = `
      INSERT INTO users (name, email, phone, address, is_verified, is_premium, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [name, email, phone, address, is_verified, is_premium, is_active], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  verify: (id, is_verified) => {
    const query = `UPDATE users SET is_verified = ? WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.query(query, [is_verified, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  update: (id, data) => {
    const { is_active, is_premium, name, email, phone, address } = data;
    const query = `
      UPDATE users SET 
        name = ?, email = ?, phone = ?, address = ?, is_active = ?, is_premium = ?
      WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [name, email, phone, address, is_active, is_premium, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  delete: (id) => {
    const query = `DELETE FROM users WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.query(query, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
};

module.exports = User;
