CREATE TABLE IF NOT EXISTS promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed', 'shipping') DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    start_date DATETIME,
    end_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_dates (start_date, end_date)
);

CREATE TABLE IF NOT EXISTS promo_code_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    promo_code_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    UNIQUE KEY unique_promo_user (promo_code_id, user_id)
);

-- Sample promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, end_date) VALUES
('WELCOME10', '10% off on your first order', 'percentage', 10, 0, 500, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('SAVE20', '20% off on orders above ₹1000', 'percentage', 20, 1000, 1000, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('FREESHIP', 'Free shipping on orders above ₹500', 'shipping', 0, 500, 0, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('FLAT100', '₹100 off on orders above ₹500', 'fixed', 100, 500, 100, DATE_ADD(NOW(), INTERVAL 30 DAY));