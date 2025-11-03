CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sku` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(5,2) DEFAULT 0.00,
  `rating` decimal(2,1) DEFAULT 0.0,
  `stock` int(11) DEFAULT 0,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `colors` json DEFAULT NULL,  -- ✅ Changed from varchar to JSON
  `sizes` json DEFAULT NULL,   -- ✅ Changed from varchar to JSON
  `warranty` varchar(100) DEFAULT NULL,  -- ✅ Renamed from warranty_period
  `return_policy` varchar(100) DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,  -- ✅ Renamed from meta_title
  `seo_description` text DEFAULT NULL,    -- ✅ Renamed from meta_description
  `meta_keywords` text DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `tags` json DEFAULT NULL,     -- ✅ Changed from text to JSON
  `features` json DEFAULT NULL, -- ✅ NEW FIELD
  `video` varchar(500) DEFAULT NULL,  -- ✅ Renamed from video_url
  `min_order_quantity` int(11) DEFAULT 1,
  `max_order_quantity` int(11) DEFAULT NULL,
  `low_stock_threshold` int(11) DEFAULT 10,
  `is_virtual` tinyint(1) DEFAULT 0,
  `is_downloadable` tinyint(1) DEFAULT 0,
  `download_link` varchar(255) DEFAULT NULL,
  `shipping_class` varchar(100) DEFAULT NULL,
  `tax_class` varchar(100) DEFAULT NULL,
  `shipping_cost` decimal(10,2) DEFAULT NULL,
  `free_shipping` tinyint(1) DEFAULT 0,
  `category_id` int(11) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `images` longtext DEFAULT NULL,
  `status` enum('Active','inactive','draft') DEFAULT 'Active',  -- ✅ Added 'draft'
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_trending` tinyint(1) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_bestseller` tinyint(1) DEFAULT 0,  -- ✅ NEW FIELD
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku_unique` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;