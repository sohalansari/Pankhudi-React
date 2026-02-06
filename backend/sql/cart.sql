CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- ✅ Cart table mein ye columns add karein:
ALTER TABLE cart ADD COLUMN (
    size VARCHAR(50),
    color VARCHAR(50),
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount INT DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ✅ Index add karein for better performance
ALTER TABLE cart ADD INDEX idx_user_id (user_id);
ALTER TABLE cart ADD INDEX idx_product_id (product_id);