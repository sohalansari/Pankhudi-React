const db = require("../config/db");

exports.getStats = (req, res) => {
  const query = `
    SELECT 
      COUNT(*) AS total_users,
      SUM(is_verified) AS verified_users,
      SUM(is_active) AS active_users,
      SUM(is_premium) AS premium_users
    FROM users
    WHERE is_deleted = 0
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results[0]);
  });
};
