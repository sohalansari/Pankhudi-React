CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    
    -- Order Summary
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Shipping Address (Denormalized - store copy)
    shipping_full_name VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_email VARCHAR(255),
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) DEFAULT 'India',
    
    -- Billing Address (Denormalized)
    billing_full_name VARCHAR(255),
    billing_phone VARCHAR(20),
    billing_email VARCHAR(255),
    billing_address TEXT,
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100) DEFAULT 'India',
    
    -- Payment Info
    payment_method ENUM('cod', 'card', 'upi', 'netbanking') DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    
    -- Order Status
    order_status ENUM(
        'pending', 
        'confirmed', 
        'processing', 
        'shipped', 
        'delivered', 
        'cancelled', 
        'returned'
    ) DEFAULT 'pending',
    
    -- Additional Info
    order_notes TEXT,
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    
    -- Foreign Key
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_order_status (order_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;











-- new Roues create table for order items
-- Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    comment TEXT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_status (order_id, status)
);

-- Order Returns Table
CREATE TABLE IF NOT EXISTS order_returns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    comments TEXT,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    completed_at DATETIME,
    rejected_at DATETIME,
    rejection_reason TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_return_order (order_id),
    INDEX idx_return_status (status)
);

-- Add new columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS estimated_delivery DATETIME NULL AFTER order_date,
ADD COLUMN IF NOT EXISTS delivered_at DATETIME NULL AFTER estimated_delivery,
ADD COLUMN IF NOT EXISTS cancelled_at DATETIME NULL AFTER delivered_at,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL AFTER cancelled_at,
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100) NULL AFTER cancellation_reason,
ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100) NULL AFTER tracking_number,
ADD COLUMN IF NOT EXISTS courier_website VARCHAR(255) NULL AFTER courier_name,
ADD COLUMN IF NOT EXISTS current_location TEXT NULL AFTER courier_website,
ADD COLUMN IF NOT EXISTS return_request_id INT NULL AFTER current_location,
ADD COLUMN IF NOT EXISTS confirmed_at DATETIME NULL AFTER return_request_id,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL AFTER confirmed_at,
ADD INDEX idx_tracking (tracking_number),
ADD INDEX idx_estimated_delivery (estimated_delivery);










-- Settings table for cancellation time limits
CREATE TABLE IF NOT EXISTS order_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default cancellation time limits
INSERT INTO order_settings (setting_key, setting_value, description) VALUES
('cancellation_time_pending', '24', 'Cancellation time limit in hours for pending orders'),
('cancellation_time_processing', '12', 'Cancellation time limit in hours for processing orders'),
('cancellation_time_confirmed', '6', 'Cancellation time limit in hours for confirmed orders'),
('refund_time_message', '5-7', 'Refund processing time in days message'),
('return_window_days', '7', 'Return window in days after delivery');

-- Order status tracking table for time-based rules
CREATE TABLE IF NOT EXISTS order_status_timeouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_status VARCHAR(50) NOT NULL,
    to_status VARCHAR(50) NOT NULL,
    timeout_hours INT NOT NULL,
    action VARCHAR(50) DEFAULT 'auto_cancel',
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default status timeouts
INSERT INTO order_status_timeouts (from_status, to_status, timeout_hours, action) VALUES
('pending', 'cancelled', 48, 'auto_cancel'),
('processing', 'cancelled', 24, 'auto_cancel'),
('confirmed', 'processing', 2, 'auto_progress'),
('processing', 'shipped', 24, 'auto_progress');