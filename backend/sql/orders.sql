CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  discount INT DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  order_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
