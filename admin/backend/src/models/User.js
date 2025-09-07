const db = require("../config/db");

const User = {
    getAll: (callback) => {
        const query = `
      SELECT 
        id, name, email, phone, address, profile_picture, 
        is_verified, is_premium, is_active, created_at, last_login
      FROM users
      WHERE is_deleted = 0
    `;
        db.query(query, callback);
    }
};

module.exports = User;
