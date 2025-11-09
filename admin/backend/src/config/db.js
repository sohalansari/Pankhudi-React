// config/db.js
const mysql = require("mysql2");
require("dotenv").config();

// Create connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "user_db",
});

connection.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});

// Create promise wrapper
const db = {
    // For callback style (existing code)
    query: (sql, params, callback) => {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }
        return connection.query(sql, params, callback);
    },

    // For promise style (new code)
    promise: () => {
        return connection.promise();
    }
};

module.exports = db;