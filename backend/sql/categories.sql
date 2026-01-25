CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY category_name_unique (name)
);





-- Add image column to categories table
ALTER TABLE categories 
ADD COLUMN image VARCHAR(255) DEFAULT NULL AFTER description;

-- Add image column to sub_categories table
ALTER TABLE sub_categories 
ADD COLUMN image VARCHAR(255) DEFAULT NULL AFTER name;

-- Add image column to sub_sub_categories table
ALTER TABLE sub_sub_categories 
ADD COLUMN image VARCHAR(255) DEFAULT NULL AFTER name;