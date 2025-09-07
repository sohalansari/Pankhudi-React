const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5001;

// Test database connection
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});