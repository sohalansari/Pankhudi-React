// // config/database.js
// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//     user: 'postgres',           // Default PostgreSQL user
//     host: 'localhost',          // Localhost
//     database: 'user_db',        // YOUR DATABASE NAME
//     password: '',  // Your PostgreSQL password
//     port: 5432,                 // Default PostgreSQL port
//     max: 20,
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 5000, // Increased timeout
// });

// // Test connection with better error handling
// pool.connect()
//     .then(client => {
//         console.log('✅ PostgreSQL Database connected successfully to user_db');
//         console.log(`📊 Database: user_db`);
//         console.log(`👤 User: postgres`);
//         client.release();
//     })
//     .catch(err => {
//         console.error('❌ PostgreSQL Database connection FAILED:');
//         console.error('Error details:', err.message);
//         console.log('\n🔧 Troubleshooting steps:');
//         console.log('1. Make sure PostgreSQL is running');
//         console.log('2. Check if database "user_db" exists');
//         console.log('3. Verify username/password');
//         console.log('4. Check firewall settings');

//         // Create mock pool for development
//         console.log('\n⚠️ Using mock database for now...');
//     });

// module.exports = pool;