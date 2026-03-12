-- Create payments table for tracking online payments
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    razorpay_payment_id VARCHAR(100),
    razorpay_order_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'INR',
    status ENUM('pending', 'completed', 'failed', 'refunded', 'refund_pending') DEFAULT 'pending',
    payment_method VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    refund_id VARCHAR(100),
    refunded_at DATETIME,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_payment (order_id),
    INDEX idx_razorpay_order (razorpay_order_id)
);

-- Add new columns to orders table if not exists
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancelled_by INT NULL AFTER cancelled_at,
ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL AFTER cancelled_by,
ADD COLUMN IF NOT EXISTS deleted_by INT NULL AFTER deleted_at,
ADD INDEX idx_deleted (deleted_at);