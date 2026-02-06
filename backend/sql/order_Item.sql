CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    
    -- Product Details at time of purchase (Denormalized)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image TEXT,
    price DECIMAL(10,2) NOT NULL, -- Price at time of purchase
    discount INT DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    
    -- Variants
    size VARCHAR(50),
    color VARCHAR(50),
    brand VARCHAR(100),
    material VARCHAR(255),
    weight VARCHAR(50),
    warranty VARCHAR(255),
    
    -- Calculated
    item_total DECIMAL(10,2) NOT NULL,
    
    -- Foreign Keys
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    
    -- Indexes
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;