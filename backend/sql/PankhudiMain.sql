-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 24, 2026 at 08:29 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pankhudi`
--

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `position` enum('home_top','home_middle','category_top','product_page','sidebar') DEFAULT 'home_top',
  `display_order` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `redirect_url` varchar(500) DEFAULT NULL,
  `discount_tag` varchar(100) DEFAULT NULL,
  `clicks` int(11) DEFAULT 0,
  `impressions` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `title`, `description`, `image_path`, `position`, `display_order`, `status`, `start_date`, `end_date`, `redirect_url`, `discount_tag`, `clicks`, `impressions`, `created_at`, `updated_at`) VALUES
(1, 'MEN’S COLLECTION', 'Timeless Style for the Modern Man', 'Mens.png', 'home_top', 3, 'active', '2025-12-21 23:39:00', '2025-12-23 23:00:00', NULL, '50% OFF', 0, 0, '2025-12-21 15:46:30', '2026-03-23 11:10:14'),
(2, 'FREE SHIPPING', 'On All Orders – No Minimum', 'FreeShipping.png', 'home_top', 2, 'active', NULL, NULL, NULL, 'Eid Special Offer', 0, 0, '2025-12-21 15:46:30', '2026-03-23 11:15:59'),
(3, 'Festive Collection', 'Special discounts on festive season', 'newbanner2.png', 'home_top', 1, 'active', NULL, NULL, NULL, '30% OFF', 0, 0, '2025-12-21 15:46:30', '2026-03-23 11:08:54'),
(4, 'Winter Wear\'s', 'Stay warm with our winter collection', 'fashion-shopping-concept-fashionable-senior-asian-woman-winter-coat-headaband-pointing-fi1.jpg', 'home_top', 4, 'active', '2025-12-21 22:37:00', '2025-12-23 22:37:00', NULL, 'NEW', 0, 0, '2025-12-21 15:46:30', '2026-03-23 11:20:02'),
(9, 'Youtube  Chanel For more knowlage', 'Good For all of the Pankhudi Users........', 'banner.png', 'home_middle', 5, 'active', NULL, NULL, NULL, NULL, 0, 0, '2026-01-24 16:37:31', '2026-03-23 11:06:45');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `size` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` int(11) DEFAULT 0,
  `final_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `quantity`, `added_at`, `size`, `color`, `price`, `discount`, `final_price`, `updated_at`) VALUES
(5, 3, 1, 1, '2026-01-10 10:35:24', NULL, NULL, 0.00, 0, 0.00, '2026-02-06 05:28:08'),
(30, 1, 1, 3, '2026-02-06 09:14:07', 'S', 'Yellow', 1602.00, 10, 1441.80, '2026-02-06 09:38:40'),
(48, 5, 5, 1, '2026-02-09 05:00:03', NULL, NULL, 809.73, 73, 218.63, '2026-02-09 05:00:03');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_featured` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `status`, `description`, `image`, `created_at`, `updated_at`, `is_featured`) VALUES
(1, 'Men\'s', 'active', 'This categories only for ments', '/uploads/categories/categories_1774263802736_z4sed3wrci.jpg', '2025-12-20 06:10:53', '2026-03-23 11:03:22', 0),
(2, 'Women\'s', 'active', 'This is Only For Women\'s', '/uploads/categories/categories_1774263797416_u4wiwiok0pn.ebp', '2025-12-20 06:23:08', '2026-03-23 11:03:17', 0),
(3, 'Kid\'s', 'active', 'This is Only for Kid\'s', '/uploads/categories/categories_1774255618200_9kdh7vxh27.jpg', '2025-12-20 06:23:30', '2026-03-23 08:46:58', 0),
(5, 'Accessories\'', 'active', 'Accessories\' for everything ', '/uploads/categories/categories_1774285141886_9pfwmfsbvag.peg', '2026-03-23 16:59:01', '2026-03-23 16:59:01', 0);

-- --------------------------------------------------------

--
-- Table structure for table `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int(11) NOT NULL,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `order_number` varchar(50) DEFAULT NULL,
  `status` enum('sent','failed','pending') DEFAULT 'pending',
  `message_id` varchar(255) DEFAULT NULL,
  `error` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `order_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_logs`
--

INSERT INTO `email_logs` (`id`, `recipient`, `subject`, `order_number`, `status`, `message_id`, `error`, `created_at`, `order_id`) VALUES
(1, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260214-3761', 'ORD-20260214-3761', 'sent', '<ff0921d4-7d79-2bef-2710-11e577d35523@gmail.com>', NULL, '2026-02-14 09:34:02', NULL),
(2, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260214-6819', 'ORD-20260214-6819', 'sent', '<d516b9d6-8d16-f27a-d86e-d2e61d810f98@gmail.com>', NULL, '2026-02-14 09:45:15', NULL),
(3, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260214-5912', 'ORD-20260214-5912', 'sent', '<335c1737-051a-9f36-0276-7ccd18c7084a@gmail.com>', NULL, '2026-02-14 09:51:01', NULL),
(4, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260214-5204', 'ORD-20260214-5204', 'sent', '<d67fb206-12e3-3fac-2b0e-416a0a1fea12@gmail.com>', NULL, '2026-02-14 10:02:25', NULL),
(5, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260214-4329', 'ORD-20260214-4329', 'sent', '<7d64ec21-2c83-5cab-d55a-6024c8e9912b@gmail.com>', NULL, '2026-02-14 10:10:18', NULL),
(6, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260214-7855', 'ORD-20260214-7855', 'sent', '<ea37f588-0195-6209-0c8f-87bbe9924399@gmail.com>', NULL, '2026-02-14 10:53:10', NULL),
(7, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260214-3236', 'ORD-20260214-3236', 'sent', '<ec8506de-fdf4-1ecf-49f9-d6470c2892a2@gmail.com>', NULL, '2026-02-14 11:02:28', NULL),
(8, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260214-5144', 'ORD-20260214-5144', 'sent', '<a9ff2e1e-123d-dbbd-c1d9-c801e55c9ab1@gmail.com>', NULL, '2026-02-14 16:47:08', NULL),
(9, 'sohalansari4934@gmail.com', 'Order Confirmation #ORD-20260217-8140', 'ORD-20260217-8140', 'sent', '<253e8877-a54b-4d90-e445-222eb09f4322@gmail.com>', NULL, '2026-02-17 11:26:02', NULL),
(10, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260217-4772', 'ORD-20260217-4772', 'sent', '<13ab053b-eb0f-fc90-d62b-bc9a9b22636c@gmail.com>', NULL, '2026-02-17 11:57:14', NULL),
(11, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260217-4218', 'ORD-20260217-4218', 'sent', '<d320ca8d-3bd2-ea54-d58e-70151954abc9@gmail.com>', NULL, '2026-02-17 17:36:39', NULL),
(12, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260217-9889', 'ORD-20260217-9889', 'sent', '<6df7b789-66d0-c974-2bef-8b585a9b8712@gmail.com>', NULL, '2026-02-17 17:38:46', NULL),
(13, 'sohalansari4934@gmail.com', 'Order Confirmation #ORD-20260218-8686', 'ORD-20260218-8686', 'sent', '<ffbf398d-e256-c016-b30e-0b565cdc8a4a@gmail.com>', NULL, '2026-02-18 07:53:29', NULL),
(14, 'sohalansari4934@gmail.com', 'Order Confirmation #ORD-20260305-1138', 'ORD-20260305-1138', 'sent', '<22cade9b-e3b5-40b0-1f23-999116a7076c@gmail.com>', NULL, '2026-03-05 12:44:45', NULL),
(15, 'mosohal496@gmail.com', 'Order Confirmation #ORD-20260323-6769', 'ORD-20260323-6769', 'sent', '<df112bb2-3e60-1103-554e-fef8fa2a6ce5@gmail.com>', NULL, '2026-03-23 15:44:29', NULL),
(16, 'sohalansari4934@gmail.com', 'Order Confirmation #ORD-20260324-6288', 'ORD-20260324-6288', 'sent', '<dbf2415c-3607-18cb-9997-5da1a15eca80@gmail.com>', NULL, '2026-03-24 06:34:41', NULL),
(17, 'sohalansari4934@gmail.com', 'Order Confirmation', NULL, 'sent', '<df6dad42-7c58-0223-283d-2fc57e95fe2c@gmail.com>', NULL, '2026-03-24 07:27:53', 34),
(18, 'sohalansari4934@gmail.com', 'Order Confirmation', NULL, 'sent', '<0745872d-ed8b-9404-aead-e7c8483c1c60@gmail.com>', NULL, '2026-03-24 07:27:53', 34),
(19, 'sohalansari4934@gmail.com', 'Order Confirmation #ORD-20260324-1762', 'ORD-20260324-1762', 'sent', '<0745872d-ed8b-9404-aead-e7c8483c1c60@gmail.com>', NULL, '2026-03-24 07:27:53', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `login_activity`
--

CREATE TABLE `login_activity` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `device_type` varchar(20) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'success',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_activity`
--

INSERT INTO `login_activity` (`id`, `user_id`, `action`, `ip_address`, `user_agent`, `browser`, `os`, `device_type`, `location`, `status`, `timestamp`) VALUES
(40, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-02-17 10:54:38'),
(45, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-02-17 16:29:34'),
(46, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-02-17 16:29:45'),
(47, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-02-17 16:30:09'),
(48, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'failed_2fa', '2026-02-17 16:30:15'),
(49, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'failed_2fa', '2026-02-17 16:30:37'),
(50, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-02-17 16:30:47'),
(51, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-02-17 17:41:55'),
(52, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-02-17 17:42:16'),
(53, 4, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-02-17 17:44:13'),
(54, 4, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-02-17 17:44:38'),
(55, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-02-17 17:57:12'),
(56, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-02-18 07:42:58'),
(57, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-02-18 07:43:10'),
(58, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-02-18 07:44:24'),
(59, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-02-18 07:45:38'),
(60, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-02-18 07:45:46'),
(62, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-02-21 11:05:40'),
(63, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-02-21 11:12:52'),
(64, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-02-21 11:12:58'),
(67, 11, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-03-05 12:34:46'),
(68, 11, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-03-05 12:37:01'),
(69, 11, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-03-05 12:38:24'),
(70, 11, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-03-05 12:40:35'),
(71, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-03-12 06:43:22'),
(72, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-03-12 06:43:39'),
(73, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-03-12 06:43:57'),
(74, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'failed_2fa', '2026-03-12 06:44:05'),
(75, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'failed_2fa', '2026-03-12 06:44:23'),
(76, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-03-12 06:44:38'),
(77, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-03-23 08:45:25'),
(78, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-03-23 08:45:46'),
(79, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-03-24 02:45:50'),
(80, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-03-24 02:46:10'),
(81, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-03-24 02:46:48'),
(82, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-03-24 02:47:03'),
(83, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-03-24 02:48:12'),
(84, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'success', '2026-03-24 02:48:26'),
(85, 7, 'Login', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, 'pending_2fa', '2026-03-24 02:48:40'),
(86, 7, 'Login', '::1', 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Chrome', 'Linux', 'mobile', NULL, 'pending_2fa', '2026-03-24 02:50:45'),
(87, 11, 'Login', '::1', 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Chrome', 'Linux', 'mobile', NULL, 'success', '2026-03-24 02:51:07');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `shipping_full_name` varchar(100) NOT NULL,
  `shipping_address` text NOT NULL,
  `shipping_city` varchar(50) NOT NULL,
  `shipping_state` varchar(50) NOT NULL,
  `shipping_postal_code` varchar(20) NOT NULL,
  `shipping_country` varchar(50) DEFAULT 'India',
  `shipping_phone` varchar(15) NOT NULL,
  `shipping_email` varchar(100) NOT NULL,
  `billing_full_name` varchar(100) DEFAULT NULL,
  `billing_address` text DEFAULT NULL,
  `billing_city` varchar(50) DEFAULT NULL,
  `billing_state` varchar(50) DEFAULT NULL,
  `billing_postal_code` varchar(20) DEFAULT NULL,
  `billing_country` varchar(50) DEFAULT 'India',
  `payment_method` enum('cod','razorpay','card','upi','netbanking') NOT NULL,
  `payment_id` varchar(100) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `payment_amount` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `shipping_charge` decimal(10,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `order_status` enum('pending','processing','shipped','delivered','cancelled','returned') DEFAULT 'pending',
  `order_note` text DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_date` datetime DEFAULT NULL,
  `shipped_date` datetime DEFAULT NULL,
  `delivered_date` datetime DEFAULT NULL,
  `cancelled_date` datetime DEFAULT NULL,
  `checkout_type` enum('cart','direct') DEFAULT 'cart',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `cancelled_by` int(11) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `courier_name` varchar(100) DEFAULT NULL,
  `courier_website` varchar(255) DEFAULT NULL,
  `current_location` text DEFAULT NULL,
  `return_request_id` int(11) DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `shipping_full_name`, `shipping_address`, `shipping_city`, `shipping_state`, `shipping_postal_code`, `shipping_country`, `shipping_phone`, `shipping_email`, `billing_full_name`, `billing_address`, `billing_city`, `billing_state`, `billing_postal_code`, `billing_country`, `payment_method`, `payment_id`, `payment_status`, `payment_amount`, `subtotal`, `tax_amount`, `shipping_charge`, `discount_amount`, `total_amount`, `order_status`, `order_note`, `order_date`, `payment_date`, `shipped_date`, `delivered_date`, `cancelled_date`, `checkout_type`, `ip_address`, `user_agent`, `estimated_delivery`, `delivered_at`, `cancelled_at`, `cancelled_by`, `deleted_at`, `deleted_by`, `cancellation_reason`, `tracking_number`, `courier_name`, `courier_website`, `current_location`, `return_request_id`, `confirmed_at`, `updated_at`) VALUES
(27, 'ORD-20260217-4772', 7, 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', '', 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', 'razorpay', 'pay_SHCisN8hXm2bOH', 'completed', 0.00, 1.00, 0.00, 0.00, 0.00, 1.00, 'processing', NULL, '2026-02-17 11:57:08', NULL, NULL, NULL, NULL, 'cart', NULL, NULL, '2026-02-22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'ORD-20260217-9889', 7, 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', '', 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', 'cod', NULL, 'completed', 0.00, 2008.63, 0.00, 0.00, 0.00, 2008.63, 'pending', NULL, '2026-02-17 17:38:43', NULL, NULL, NULL, NULL, 'cart', NULL, NULL, '2026-02-22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 'ORD-20260305-1138', 11, 'Sohal Ansari', 'Kurla East\nS G Brave Marge', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', 'sohalansari4934@gmail.com', 'Sohal Ansari', 'Kurla East\nS G Brave Marge', 'Mumbai', 'Maharashtra', '400024', 'India', 'razorpay', 'pay_SNY52dlWb5Orjl', 'completed', 0.00, 1.00, 0.00, 0.00, 0.00, 1.00, 'processing', NULL, '2026-03-05 12:44:41', NULL, NULL, NULL, NULL, 'cart', NULL, NULL, '2026-03-10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'ORD-20260323-6769', 7, 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', '', 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', 'razorpay', 'pay_SUil2TyV2bt8UT', 'completed', 0.00, 1.00, 0.00, 0.00, 0.00, 1.00, 'shipped', NULL, '2026-03-23 15:44:25', NULL, '2026-03-23 21:21:01', NULL, NULL, 'cart', NULL, NULL, '2026-03-28', NULL, NULL, NULL, NULL, NULL, NULL, '85748149952', 'Delhivery', 'http://localhost:3000/orders', NULL, NULL, NULL, '2026-03-23 21:22:08'),
(33, 'ORD-20260324-6288', 11, 'Sohal Ansari', 'Kurla East\nS G Brave Marge', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', '', 'Sohal Ansari', 'Kurla East\nS G Brave Marge', 'Mumbai', 'Maharashtra', '400024', 'India', 'cod', NULL, 'completed', 0.00, 399.60, 0.00, 0.00, 0.00, 399.60, 'pending', NULL, '2026-03-24 06:34:36', NULL, NULL, NULL, NULL, 'cart', NULL, NULL, '2026-03-29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'ORD-20260324-1762', 11, 'Sohal Ansari', 'Kurla East\nS G Brave Marge', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', '', 'Sohal Ansari', 'Kurla East\nS G Brave Marge', 'Mumbai', 'Maharashtra', '400024', 'India', 'cod', NULL, 'completed', 0.00, 419.72, 0.00, 0.00, 0.00, 419.72, 'pending', NULL, '2026-03-24 07:27:49', NULL, NULL, NULL, NULL, 'cart', NULL, NULL, '2026-03-29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Triggers `orders`
--
DELIMITER $$
CREATE TRIGGER `before_insert_orders` BEFORE INSERT ON `orders` FOR EACH ROW BEGIN
    DECLARE year_prefix VARCHAR(4);
    DECLARE month_prefix VARCHAR(2);
    DECLARE day_prefix VARCHAR(2);
    DECLARE random_num INT;
    
    SET year_prefix = DATE_FORMAT(NOW(), '%Y');
    SET month_prefix = DATE_FORMAT(NOW(), '%m');
    SET day_prefix = DATE_FORMAT(NOW(), '%d');
    SET random_num = FLOOR(1000 + RAND() * 9000);
    
    SET NEW.order_number = CONCAT('ORD-', year_prefix, month_prefix, day_prefix, '-', random_num);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(500) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount_percent` decimal(5,2) DEFAULT 0.00,
  `final_price` decimal(10,2) NOT NULL,
  `size` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `shipping_cost` decimal(10,2) DEFAULT 0.00,
  `free_shipping` tinyint(4) DEFAULT 0,
  `tax_rate` decimal(5,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `total_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `order_number`, `product_id`, `product_name`, `product_image`, `sku`, `quantity`, `price`, `discount_percent`, `final_price`, `size`, `color`, `shipping_cost`, `free_shipping`, `tax_rate`, `tax_amount`, `total_price`) VALUES
(23, 27, 'ORD-20260217-4772', 7, 'DEELMO Men\'s Regular Fit Button Down Dress Shirts Textured Long Sleeve Casual Hawaiian Shirt', NULL, 'SKU - 6', 1, 1.00, 0.00, 1.00, 'L', 'Black', 0.00, 1, 0.00, 0.00, 1.00),
(25, 29, 'ORD-20260217-9889', 2, 'Pankhudi Essentials x Sofia Grainge Unisex Babies\' Snug-Fit Cotton Footed Pajamas', NULL, 'SKU -2', 1, 2008.63, 0.00, 2008.63, 'XS', 'Gray', 50.00, 0, 0.00, 0.00, 2008.63),
(27, 31, 'ORD-20260305-1138', 7, 'DEELMO Men\'s Regular Fit Button Down Dress Shirts Textured Long Sleeve Casual Hawaiian Shirt', NULL, 'SKU - 6', 1, 1.00, 0.00, 1.00, 'XL', 'Gray', 0.00, 1, 0.00, 0.00, 1.00),
(28, 32, 'ORD-20260323-6769', 7, 'DEELMO Men\'s Regular Fit Button Down Dress Shirts Textured Long Sleeve Casual Hawaiian Shirt', NULL, 'SKU - 6', 1, 1.00, 0.00, 1.00, NULL, NULL, 0.00, 1, 0.00, 0.00, 1.00),
(29, 33, 'ORD-20260324-6288', 10, 'DINGDONG Sweatshirt and Pant Set | Kids Cotton Printed Casual Dress | Full Sleeves Sweatshirt Joggers Dress For Boys', NULL, 'SKU - 9', 1, 399.60, 0.00, 399.60, NULL, NULL, 0.00, 1, 0.00, 0.00, 399.60),
(30, 34, 'ORD-20260324-1762', 9, 'Boys Cotton Clothing Set | Kids Dress for Boys Full Sleeve Printed T-Shirt & Pant | Soft Cotton Winter Wear Outfit for Boy | Comfortable for Wear', NULL, 'SKU - 8', 1, 419.72, 0.00, 419.72, NULL, NULL, 0.00, 1, 0.00, 0.00, 419.72);

-- --------------------------------------------------------

--
-- Table structure for table `order_returns`
--

CREATE TABLE `order_returns` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `comments` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','completed') DEFAULT 'pending',
  `requested_at` datetime DEFAULT current_timestamp(),
  `approved_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_settings`
--

CREATE TABLE `order_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_settings`
--

INSERT INTO `order_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_at`) VALUES
(1, 'cancellation_time_pending', '24', 'Cancellation time limit in hours for pending orders', '2026-02-17 17:46:33'),
(2, 'cancellation_time_processing', '12', 'Cancellation time limit in hours for processing orders', '2026-02-17 17:46:33'),
(3, 'cancellation_time_confirmed', '6', 'Cancellation time limit in hours for confirmed orders', '2026-02-17 17:46:33'),
(4, 'refund_time_message', '5-7', 'Refund processing time in days message', '2026-02-17 17:46:33'),
(5, 'return_window_days', '7', 'Return window in days after delivery', '2026-02-17 17:46:33');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `comment`, `created_by`, `created_at`) VALUES
(2, 27, 'processing', 'Order created successfully', 7, '2026-02-17 17:27:08'),
(6, 29, 'pending', 'Order created successfully', 7, '2026-02-17 23:08:43'),
(8, 31, 'processing', 'Order created successfully', 11, '2026-03-05 18:14:41'),
(9, 32, 'processing', 'Order created successfully', 7, '2026-03-23 21:14:25'),
(10, 32, 'shipped', 'Status changed from processing to shipped', 1, '2026-03-23 21:18:38'),
(11, 32, 'processing', 'Status changed from shipped to processing', 1, '2026-03-23 21:19:39'),
(12, 32, 'shipped', 'Status changed from processing to shipped', 1, '2026-03-23 21:21:01'),
(13, 33, 'pending', 'Order created successfully', 11, '2026-03-24 12:04:36'),
(14, 34, 'pending', 'Order created successfully', 11, '2026-03-24 12:57:49');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_timeouts`
--

CREATE TABLE `order_status_timeouts` (
  `id` int(11) NOT NULL,
  `from_status` varchar(50) NOT NULL,
  `to_status` varchar(50) NOT NULL,
  `timeout_hours` int(11) NOT NULL,
  `action` varchar(50) DEFAULT 'auto_cancel',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_status_timeouts`
--

INSERT INTO `order_status_timeouts` (`id`, `from_status`, `to_status`, `timeout_hours`, `action`, `is_active`, `created_at`) VALUES
(1, 'pending', 'cancelled', 48, 'auto_cancel', 1, '2026-02-17 17:46:33'),
(2, 'processing', 'cancelled', 24, 'auto_cancel', 1, '2026-02-17 17:46:33'),
(3, 'confirmed', 'processing', 2, 'auto_progress', 1, '2026-02-17 17:46:33'),
(4, 'processing', 'shipped', 24, 'auto_progress', 1, '2026-02-17 17:46:33');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'INR',
  `status` enum('pending','completed','failed','refunded','refund_pending') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `refund_id` varchar(100) DEFAULT NULL,
  `refunded_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_gateway` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'INR',
  `status` varchar(50) DEFAULT 'pending',
  `gateway_response` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(5,2) DEFAULT 0.00,
  `rating` decimal(4,2) DEFAULT 0.00,
  `stock` int(11) DEFAULT 0,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `colors` longtext DEFAULT NULL,
  `sizes` longtext DEFAULT NULL,
  `warranty` varchar(100) DEFAULT NULL,
  `return_policy` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `features` longtext DEFAULT NULL,
  `video` varchar(500) DEFAULT NULL,
  `min_order_quantity` int(11) DEFAULT 1,
  `max_order_quantity` int(11) DEFAULT NULL,
  `low_stock_threshold` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `category_id` int(11) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `images` text DEFAULT NULL,
  `sub_category_id` int(11) DEFAULT NULL,
  `sub_sub_category_id` int(11) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_trending` tinyint(1) DEFAULT 0,
  `is_bestseller` tinyint(1) DEFAULT 0,
  `is_virtual` tinyint(1) DEFAULT 0,
  `is_downloadable` tinyint(1) DEFAULT 0,
  `download_link` varchar(500) DEFAULT NULL,
  `shipping_class` varchar(50) DEFAULT 'Standard',
  `tax_class` varchar(50) DEFAULT '0',
  `free_shipping` tinyint(1) DEFAULT 0,
  `shipping_cost` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `sku`, `name`, `description`, `short_description`, `price`, `discount`, `rating`, `stock`, `weight`, `dimensions`, `material`, `colors`, `sizes`, `warranty`, `return_policy`, `slug`, `seo_title`, `seo_description`, `meta_keywords`, `tags`, `features`, `video`, `min_order_quantity`, `max_order_quantity`, `low_stock_threshold`, `created_at`, `updated_at`, `status`, `category_id`, `brand`, `images`, `sub_category_id`, `sub_sub_category_id`, `is_featured`, `is_trending`, `is_bestseller`, `is_virtual`, `is_downloadable`, `download_link`, `shipping_class`, `tax_class`, `free_shipping`, `shipping_cost`) VALUES
(1, 'SKU -1', 'Pankhudi Essentials women\'s French Terry Fleece Pullover Hoodie', '- REGULAR FIT: Close but comfortable fit through chest, waist, and hips.\r\n- COZY BRUSHED BACK FLEECE: Buttery soft and comfy midweight cotton blend fleece with brushed interior.\r\n- EVERYDAY HOODIE: Designed to be both your on the go and lounging essential. Pair back to jeans for a casual look or matching sweatpants for a head -to-toe comfy look.\r\n- DETAILS: Adjustable drawstring hood, roomy kangaroo front pocket, and soft rib detail at cuffs and hem for enhanced stretch and recovery.', 'Fabric type - 60% Cotton, 40% Polyester\r\nCare instructions - Machine Wash Warm, Tumble Dry Low\r\nOrigin - Imported\r\nClosure type - Pull On', 1780.00, 10.00, 4.90, 50, 1.00, '50*20*30', '60% Cotton, 40% Polyester', '[\"Yellow\",\"Red\",\"Blue\",\"Green\",\"Black\"]', '[\"S\",\"M\",\"L\",\"XL\",\"XXL\",\"XXXL\"]', '7 day\'s', '7 Days  Only', 'pankhudi-essentials-womens-french-terry-fleece-pullover-hoodie', 'eihfierhfierni', 'ihfiuerhiuerhierhieeihviue eirhiur', 'ogjiurhirtihtro', '[\"Good Quality\",\"Best product\"]', '[\"Eco-friendly\",\"Machine Washable\",\"Fast Drying\",\"UV Protection\"]', NULL, 1, 48, 10, '2025-12-20 10:12:37', '2025-12-28 11:34:44', 'Active', 2, 'Pankhudi', '[\"http://localhost:5001/uploads/1766225557396-775433594.png\",\"http://localhost:5001/uploads/1766225557404-583717110.png\",\"http://localhost:5001/uploads/1766225557408-72339923.png\",\"http://localhost:5001/uploads/1766225557411-854123874.png\",\"http://localhost:5001/uploads/1766225557413-848327406.png\"]', 6, 53, 1, 1, 0, 1, 1, '', 'Free', '18%', 1, 20.00),
(2, 'SKU -2', 'Pankhudi Essentials x Sofia Grainge Unisex Babies\' Snug-Fit Cotton Footed Pajamas', '- SOFIA GRAINGE COLLABORATION: Inspired styles for you and your little ones, created in collaboration with Sofia Grainge\r\n- MID RISE RELAXED: Top: Relaxed, comfortable fit, easy through the body. Bottoms: Relaxed, comfortable fit through the hip and thigh. Mid rise, sits below the natural waist\r\n- MODAL JERSEY: Lightweight, super soft modal jersey with gentle stretch, provides comfort and breathability for a good night\'s sleep\r\n- DETAILS: Crewneck with henley-style three-button placket, long sleeves, and elasticated waistband with drawcord\r\n- GARMENT MEASUREMENTS: Top Length 25 1/2\" from side neck and inseam 29\" on US size Small', 'Fabric type - 95% Tencel Modal, 5% Elastane ,\r\nCare instructions - Machine Wash Cold, Dry Flat ,\r\nOrigin - Imported ,\r\nClosure type - Pull-On ;', 2678.17, 25.00, 4.70, 88, 0.00, '', '95% Tencel Modal, 5% Elastane', '[\"Gray\",\"White\",\"Red\",\"Blue\",\"Yellow\"]', '[\"XS\",\"S\",\"M\",\"L\",\"XL\"]', '', '7 Days', 'p', '', '', '', '[\"Night Dress\",\"Sport Dress\"]', '[\"Eco-friendly\",\"Stain Resistant\"]', 'http://localhost:5001/uploads/1766324890029-872111950.mp4', 1, 20, 10, '2025-12-21 13:48:10', '2026-03-23 11:32:24', 'Active', 2, 'Pankhudi', '[\"http://localhost:5001/uploads/1766324889979-97070553.png\",\"http://localhost:5001/uploads/1766324889980-198043964.png\",\"http://localhost:5001/uploads/1766324889984-931687804.png\",\"http://localhost:5001/uploads/1766324889987-939377209.png\",\"http://localhost:5001/uploads/1766324890027-409202273.png\"]', 6, 22, 1, 0, 1, 1, 0, '', 'Standard', '18', 0, 50.00),
(4, 'SKU - 3', 'Pankhudi Essentials mens Pullover Sweatshirt Hoodie, Big & Tall Options Available', '- REGULAR FIT: Experience a relaxed fit in our men\'s sweatshirt hoodie with space through the shoulders, chest, and waist, ideal for daily wear\r\n- COZY COMFORT: Crafted from an 8.3 oz brushed-back cotton-polyester fleece, our hoodie for men provides warmth and softness\r\n- VERSATILE STYLE: Ideal for errands or casual outings, this men\'s pullover hoodie can also be layered with ease\r\n- QUALITY DETAILS: This men\'s hooded sweatshirt boasts a jersey-lined hood, metal eyelets, adjustable drawcord, kangaroo pocket, and heavyweight rib trim, all designed for durability\r\n- CUSTOMER-FOCUSED: Your feedback matters, enabling us to improve comfort, quality, and longevity in our men\'s pullover hoodie', 'Fabric typeBody:  - 56% Cotton, 44% Polyester; Hood Lining: 60% Cotton, 40% Polyester\r\nCare instructions - Machine Wash Warm, Tumble Dry Low\r\nOrigin - Imported\r\nClosure type - Pull On', 1907.86, 35.00, 3.50, 0, 0.00, '', '56% Cotton, 44% Polyester; Hood Lining: 60% Cotton, 40% Polyester', '[\"Brown\",\"Purple\",\"Black\",\"Blue\"]', '[\"S\",\"M\",\"L\",\"XL\",\"XXL\",\"32\",\"34\"]', '', '7 Day\'s ', 'pankhudi-essentials-mens-pullover-sweatshirt-hoodie-big-tall-options-available', '', '', '', '[]', '[\"Wrinkle Resistant\",\"UV Protection\",\"Fast Drying\"]', 'http://localhost:5001/uploads/1766325903255-970720845.mp4', 1, 30, 10, '2025-12-21 14:05:03', '2026-02-08 18:14:24', 'Active', 1, 'Pankhudi', '[\"http://localhost:5001/uploads/1766325903230-382805118.jpg\",\"http://localhost:5001/uploads/1766325903232-870903289.jpg\",\"http://localhost:5001/uploads/1766325903235-166503618.jpg\",\"http://localhost:5001/uploads/1766325903239-825916308.jpg\",\"http://localhost:5001/uploads/1766325903243-907758959.jpg\",\"http://localhost:5001/uploads/1766325903245-537402594.jpg\",\"http://localhost:5001/uploads/1766325903247-841248478.jpg\",\"http://localhost:5001/uploads/1766325903252-378126292.jpg\",\"http://localhost:5001/uploads/1766325903252-241005127.jpg\"]', 1, 2, 1, 1, 1, 0, 0, '', 'Free', '0', 1, 0.00),
(5, 'SKU -4', 'KLOSIA Women\'s Rayon Printed Anarkali Kurta and Pant with Dupatta Set', '- Fit Type: Anarkali Kurta; Anarkali Kurta set for women: Anarkali Kurta Pant and printed Dupatta Set\r\n- Product Material :- Viscose | Colour :- Teal Blue | Pattern :- Printed | Dupatta :- Chanderi Cotton |\r\n- Style :- Anarkali Kurta | Sleeve Length :- 3/4 Sleeve | Bottom :- Pant Includes a coordinated A-line kurta, ankle-length pants, and a stunning printed dupatta, offering a complete traditional look with minimal styling effort.\r\n- Showcase timeless elegance with this beautifully crafted blue kurta set featuring intricate ethnic block prints and a contrasting maroon border — perfect for festive, casual, and semi-formal occasions.\r\n- Sizes:- S, M, L, XL, XXL,3XL,4XL,5XL (All Regular Sizes Available)\r\n', 'Material composition - Viscose\r\nLength - Calf Length\r\nSleeve type - 3/4 Sleeve\r\nNeck style - V-Neck\r\nStyle - Anarkali\r\nMaterial type - Rayon', 2999.00, 73.00, 4.90, 12, 0.00, '', 'Viscose', '[\"Blue\",\"Red\",\"Black\"]', '[\"S\",\"M\",\"L\",\"XL\",\"XXL\"]', '', '7 Days', 'klosia-womens-rayon-printed-anarkali-kurta-and-pant-with-dupatta-set', '', '', '', '[\"kurti\",\"Indian Faishan\"]', '[\"Eco-friendly\",\"Breathable\"]', 'http://localhost:5001/uploads/1770575322919-776004524.mp4', 1, 20, 10, '2026-02-08 18:28:42', '2026-02-14 10:02:20', 'Active', 2, 'Pankhudi', '[\"http://localhost:5001/uploads/1770575322902-615727992.jpg\",\"http://localhost:5001/uploads/1770575322905-113042154.jpg\",\"http://localhost:5001/uploads/1770575322907-574863204.jpg\",\"http://localhost:5001/uploads/1770575322909-513332254.jpg\",\"http://localhost:5001/uploads/1770575322911-2804883.jpg\",\"http://localhost:5001/uploads/1770575322913-101755810.jpg\",\"http://localhost:5001/uploads/1770575322916-871458861.jpg\",\"http://localhost:5001/uploads/1770575322917-853969946.jpg\"]', 6, 24, 1, 1, 0, 1, 0, '', 'Free', '0', 1, 0.00),
(7, 'SKU - 6', 'DEELMO Men\'s Regular Fit Button Down Dress Shirts Textured Long Sleeve Casual Hawaiian Shirt', '- { FABRIC } : Soft & Breathable Polyster Fabric || Wrinkle-Resistant Fabric || Durable & Lightweight Material || Easy-Care Washable Blend || Stretchable – Offers Good Flexibility, Often Used In Stretchable Garments Like Tops And Dresses.\r\n- { PATTERN } : Elegant Minimal Pattern Detailing || Solid Design For Men || FIT TYPE : Tailored Regular Fit Design || Comfortable Regular Fit || Relaxed Casual Fit || Smart Structured Fit for Sharp Look\r\n- { NECK TYPE } : Button Down Collar || Round Neck with Placket || Stylish Collar Design || Classic V-Cut Neckline\r\n- { OCCASION } : Smart Casual Everyday Look || Party Ready Stylish Shirt || Weekend Brunch Wear || Formal Office Wear Shirt || Date Night Semi-Formal Premium Shirt || Wedding Wear Shirt || Elegant Shirt for Religious Functions\r\n- { WASH CARE INSTRUCTIONS } : Hand Wash || Do Not Bleach || Gentle Mashine Wash.', 'Material composition - Polyster , \r\nPattern - Solid , \r\nFit type - Regular Fit , \r\nSleeve type - Long Sleeve , \r\nCollar style - Spread Collar , \r\nNeck style - Collared Neck , \r\nCountry of Origin - India', 2.00, 50.00, 4.80, 188, 0.00, '', 'Polyster', '[\"Gray\",\"Brown\",\"Green\",\"Blue\",\"Red\",\"Black\"]', '[\"S\",\"M\",\"L\",\"XL\",\"XXL\",\"32\",\"34\",\"36\"]', '', '7 Days', 'deelmo-mens-regular-fit-button-down-dress-shirts-textured-long-sleeve-casual-hawaiian-shirt', '', '', '', '[\"Men\'s Shirts\",\"shirts\"]', '[\"Eco-friendly\",\"Machine Washable\",\"Wrinkle Resistant\"]', NULL, 1, 100, 10, '2026-02-08 19:03:32', '2026-03-23 15:44:25', 'Active', 1, 'Pankhudi', '[\"http://localhost:5001/uploads/1770577412352-792069910.jpg\",\"http://localhost:5001/uploads/1770577412354-368962446.jpg\",\"http://localhost:5001/uploads/1770577412354-218272047.jpg\",\"http://localhost:5001/uploads/1770577412355-250226279.jpg\",\"http://localhost:5001/uploads/1770577412356-543431877.jpg\",\"http://localhost:5001/uploads/1770577412357-376753291.jpg\",\"http://localhost:5001/uploads/1770577412357-109237902.jpg\"]', 1, 2, 0, 0, 0, 0, 0, '', 'Free', '0', 1, 0.00),
(8, 'SKU - 7', 'R.G Kids Dress | Cotton Kids Clothes for Boys | Dinosaur Printed Half Sleeve T-shirt and Denim Shorts Baby Clothes | Casual Summer Clothes for Baby Boy', '- Premium kid dress made with soft, breathable cotton that feels gentle on skin. Perfect kids clothes for boys choice for all-day comfort. Ideal in baby clothes range for daily wear, outings, and playtime without irritation or overheating.\r\n- Stylish baby dress design with modern print and smart fit that upgrades your child’s look instantly. This kids dress boy outfit works great as a trendy baby boy dress for casual events, travel, photos, and home wear.\r\n- Built for durability and repeated washing, this kids wear for boys set keeps color and shape intact. Strong stitching and quality fabric make it reliable baby clothes parents can trust for long-term regular use.\r\n- Lightweight and airy summer clothes for baby boy that help reduce sweat and discomfort. This baby boy summer clothes set supports airflow and free movement, making it perfect for hot weather and outdoor activities.\r\n- Easy wear and removal design saves parents time during dressing. Comfortable waistband and relaxed cut make this kids summer wear boys outfit practical. A go-to kid dress option for daycare, trips, and quick outfit changes.\r\n- Versatile kids clothes for boys piece that pairs easily with shoes and accessories. Use as daily baby boy dress or occasion wear. A smart pick in kids summer wear boys collections for comfort, style, and value in one set.', 'Material type - Hoseiry & Denim, Denim\r\nFit type - Regular\r\nStyle - Casual\r\nTheme - Animal\r\nClosure type - Pull On\r\nCare instructions - Hand Wash Only\r\nCountry of Origin - India', 999.00, 50.00, 4.90, 48, 0.00, '', 'Cotton', '[\"Yellow\",\"Black\"]', '[\"3 - 6 M\",\"0 - 6 M\",\"1 - 2 Y\",\"2 - 3 Y\",\"3 - 4 Y\"]', '', '7 Days', 'rg-kids-dress-cotton-kids-clothes-for-boys-dinosaur-printed-half-sleeve-t-shirt-and-denim-shorts-baby-clothes-casual-summer-clothes-for-baby-boy', '', '', '', '[]', '[\"Eco-friendly\",\"Fast Drying\"]', 'http://localhost:5001/uploads/products/video-1774265484301-285171276.mp4', 1, NULL, 10, '2026-03-23 11:31:24', '2026-03-23 11:31:24', 'Active', 3, 'Pankhudi', '[\"http://localhost:5001/uploads/products/img-1774265484294-650885527.jpg\",\"http://localhost:5001/uploads/products/img-1774265484295-956663331.jpg\",\"http://localhost:5001/uploads/products/img-1774265484296-493909737.jpg\",\"http://localhost:5001/uploads/products/img-1774265484297-670255319.png\",\"http://localhost:5001/uploads/products/img-1774265484298-854293592.png\",\"http://localhost:5001/uploads/products/img-1774265484299-624051086.png\"]', 13, 54, 0, 1, 1, 0, 0, '', 'Normal', '0', 1, 0.00),
(9, 'SKU - 8', 'Boys Cotton Clothing Set | Kids Dress for Boys Full Sleeve Printed T-Shirt & Pant | Soft Cotton Winter Wear Outfit for Boy | Comfortable for Wear', '- Premium Soft Cotton Fabric: Made from 100% breathable cotton, this boys clothing set is ultra-soft on delicate skin, ensuring all-day comfort for school, playtime, and home wear\r\n- Trendy Printed Full Sleeve T-Shirt: Stylish printed full sleeve t-shirt for boys paired with matching pants gives a modern and cute look for casual outings and daily wear\r\n- Comfortable Fit for Active Kids: Elastic waistband pants provide a snug yet flexible fit, allowing easy movement for running, playing, and relaxing\r\n- Versatile Kids Wear for All Seasons: Suitable as winter wear, mild cold weather outfit, or AC room wear, keeping kids warm without overheating\r\n- Easy Care & Durable Stitching: Fade-resistant fabric, strong stitching, and machine-wash friendly—designed to last even after multiple washes\r\n- Complete Coordinated Outfit Set: Full sleeve printed t-shirt and matching pants create a coordinated look that saves time in dressing and ensures style consistency for everyday wear', 'Material type - Cotton\r\nFit type - Regular\r\nStyle - Casual\r\nTheme - Printed\r\nClosure type - Pull On\r\nCare instructions - Machine Wash\r\nCountry of Origin - India', 1499.00, 72.00, 4.70, 49, 0.00, '', 'Cotton', '[\"White & Red\",\"Blue\",\"Pink\",\"Purple\"]', '[\"3 - 4 Y\",\"0 - 1 Y\",\"1 - 2 Y\",\"2 - 3 Y\",\"4 - 5 Y\"]', '', '', 'boys-cotton-clothing-set-kids-dress-for-boys-full-sleeve-printed-t-shirt-pant-soft-cotton-winter-wear-outfit-for-boy-comfortable-for-wear', '', '', '', '[\"Baby Clothes\",\"Baby Set\'s\"]', '[\"Eco-friendly\",\"Fast Drying\"]', 'http://localhost:5001/uploads/products/video-1774266063967-267674986.mp4', 1, 1, 10, '2026-03-23 11:41:03', '2026-03-24 07:27:49', 'Active', 3, 'Pankhudi', '[\"http://localhost:5001/uploads/products/img-1774266063957-518361488.png\",\"http://localhost:5001/uploads/products/img-1774266063958-718030271.png\",\"http://localhost:5001/uploads/products/img-1774266063960-284353552.png\",\"http://localhost:5001/uploads/products/img-1774266063962-201997971.png\",\"http://localhost:5001/uploads/products/img-1774266063963-221498163.png\",\"http://localhost:5001/uploads/products/img-1774266063966-982976429.png\"]', 13, 54, 1, 0, 0, 0, 0, '', 'Normal', '0', 1, 0.00),
(10, 'SKU - 9', 'DINGDONG Sweatshirt and Pant Set | Kids Cotton Printed Casual Dress | Full Sleeves Sweatshirt Joggers Dress For Boys', '- Stylish Astronaut Design ? Bright yellow sweatshirt with cute astronaut print makes kids look trendy and fun.\r\n- Complete Outfit Set ? Comes with a cozy sweatshirt and black pants for a ready-to-wear combo.\r\n- soft\r\n- Unisex Fashion ? Suitable for both boys and girls, perfect for toddlers and kids.\r\n- Occasion Ready ? Ideal for daily wear, birthday parties, outings, or casual play.', 'Colour - Yellow ,\r\nStyle Name - Modern ,\r\nSleeve Type - Long Sleeve ,\r\nFit Type - Regular ,\r\nClosure Type - Pull On ,\r\nPattern - Cartoon ', 999.00, 60.00, 4.50, 99, 0.00, '', 'Cotton', '[\"Yellow\",\"Red\",\"Blue\"]', '[\"2 - 3 Y\",\"18 - 36 M\",\"3 - 4 Y\"]', '', '7 Days Only', 'dingdong-sweatshirt-and-pant-set-kids-cotton-printed-casual-dress-full-sleeves-sweatshirt-joggers-dress-for-boys', '', '', '', '[\"Baby Clothe\'s\",\"Baby Boys Clothes\"]', '[\"Eco-friendly\",\"Fast Drying\"]', NULL, 1, 1, 10, '2026-03-23 12:01:09', '2026-03-24 06:34:36', 'Active', 3, 'Pankhudi', '[\"http://localhost:5001/uploads/products/img-1774267269629-8211105.png\",\"http://localhost:5001/uploads/products/img-1774267269630-704236263.png\",\"http://localhost:5001/uploads/products/img-1774267269631-315999258.png\",\"http://localhost:5001/uploads/products/img-1774267269632-914057738.png\",\"http://localhost:5001/uploads/products/img-1774267269633-25536984.png\",\"http://localhost:5001/uploads/products/img-1774267269634-131534554.png\"]', 13, 54, 0, 0, 0, 0, 0, '', 'Normal', '0', 1, 0.00),
(11, 'SKU - 10', 'Symbol Premium Men Stylish Solid All Day Fresh Buttondown Casual Shirt - Regular Fit | Plain | Full Sleeve | Cotton Semi Formal Wear (Available in Plus Size & Combo Pack)', '- Oxford cloth button down shirt – that timeless product\n- Anti-odor finish for all day freshness\n- Temperature control finish (Cool IT TM ) to keep you cool\n- Peached finish for a super soft touch\n- Pair up with a chino or a jeans for that smart casual look\n**Additional Information**\n*Manufacturer* Amazon Brand - Symbol, Formal Clothing Company (A Divn of Bang Overseas Ltd), #17/3, 9th Mile, Basapura Village, Begur Hobli, Electronic City (Post), Bangalore - 560100, Contact: +91 8574814934 pankhudi@pankhudi.com\n*Packer* Formal Clothing Company (A Divn of Bang Overseas Ltd), #17/3, 9th Mile, Basapura Village, Begur Hobli, Electronic City (Post), Bangalore - 560100, Contact: +91 8574814934,  pankhudi@pankhudishop.com\nItem Weight450 g\nItem Dimensions LxWxH20.3 x 24 x 10 Centimeters\nNet Quantity1 Count\nGeneric NameStylish Solid All Day Fresh Buttondown Casual Shirt - Regular Fit | Plain | Full Sleeve | Cotton Semi Formal Wear (Available in Plus Size & Combo Pack)', 'Material composition - 100% Cotton ,\r\nPattern - Solid ,\r\nFit type - Regular Fit ,\r\nSleeve type - Long Sleeve ,\r\nCollar style - Button Down ,\r\nLength - Standard Length \r\nCountry of OriginIndia', 2399.00, 35.00, 4.00, 200, 0.00, '', 'Cotton', '[\"Black\",\"Green\",\"Gray\",\"Blue\"]', '[\"XS\",\"S\",\"M\",\"L\",\"XL\",\"XXL\",\"XXXL\"]', '', '7 Dyas', 'symbol-premium-men-stylish-solid-all-day-fresh-buttondown-casual-shirt-regular-fit-plain-full-sleeve-cotton-semi-formal-wear-available-in-plus-size-combo-pack', '', '', '', '[\"Men\'s Shirt\"]', '[\"Eco-friendly\",\"Fast Drying\",\"Machine Washable\"]', 'http://localhost:5001/uploads/products/video-1774267943236-704375498.mp4', 1, NULL, 10, '2026-03-23 12:12:23', '2026-03-23 12:47:43', 'Active', 1, 'Pankhudi', '[\"http://localhost:5001/uploads/products/img-1774267943227-784483306.jpg\",\"http://localhost:5001/uploads/products/img-1774267943230-838276893.jpg\",\"http://localhost:5001/uploads/products/img-1774267943232-317590512.jpg\",\"http://localhost:5001/uploads/products/img-1774267943233-454679722.jpg\",\"http://localhost:5001/uploads/products/img-1774267943234-500696617.jpg\",\"http://localhost:5001/uploads/products/img-1774267943235-853615187.jpg\"]', 1, 2, 1, 0, 0, 0, 0, '', 'Normal', '0', 1, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `promo_codes`
--

CREATE TABLE `promo_codes` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed','shipping') DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT 0.00,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `per_user_limit` int(11) DEFAULT 1,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promo_codes`
--

INSERT INTO `promo_codes` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `used_count`, `per_user_limit`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', '10% off on your first order', 'percentage', 10.00, 0.00, 500.00, NULL, 0, 1, NULL, '2026-03-16 16:00:20', 1, '2026-02-14 10:30:20', '2026-02-14 10:30:20'),
(2, 'SAVE20', '20% off on orders above ₹1000', 'percentage', 20.00, 1000.00, 1000.00, NULL, 0, 1, NULL, '2026-03-16 16:00:20', 1, '2026-02-14 10:30:20', '2026-02-14 10:30:20'),
(3, 'FREESHIP', 'Free shipping on orders above ₹500', 'shipping', 0.00, 500.00, 0.00, NULL, 0, 1, NULL, '2026-03-16 16:00:20', 1, '2026-02-14 10:30:20', '2026-02-14 10:30:20'),
(4, 'FLAT100', '₹100 off on orders above ₹500', 'fixed', 100.00, 500.00, 100.00, NULL, 0, 1, NULL, '2026-03-16 16:00:20', 1, '2026-02-14 10:30:20', '2026-02-14 10:30:20');

-- --------------------------------------------------------

--
-- Table structure for table `promo_code_usage`
--

CREATE TABLE `promo_code_usage` (
  `id` int(11) NOT NULL,
  `promo_code_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `registration_otps`
--

CREATE TABLE `registration_otps` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `registration_otps`
--

INSERT INTO `registration_otps` (`id`, `email`, `otp`, `expires_at`, `used`, `created_at`) VALUES
(7, 'pankhudiforyou@gmail.com', '686577', '2026-01-24 22:25:12', 0, '2026-01-24 22:15:12'),
(8, 'pankhudiforyou@gmail.com', '305231', '2026-01-24 22:27:36', 0, '2026-01-24 22:17:36'),
(10, 'sohalansari496@gmail.com', '243343', '2026-02-12 10:07:54', 0, '2026-02-12 09:57:54'),
(11, 'sohalansari496@gmail.com', '544298', '2026-02-12 10:09:52', 0, '2026-02-12 09:59:52');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `review` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `review`, `created_at`) VALUES
(1, 1, 1, 5, 'I am 5\'5\", 150 lbs., and wear a 36D bra. I ordered large because I wanted this to be loose and comfy for pajamas. The fabric is a nice, thick sweatshirt fabric that is soft on the inside. The large fits perfectly through the shoulders, but is a bit big, square, and boxy through the torso. A medium probably would have been too snug across the shoulders, but a better loose fit through the torso, so the large is the best fit for what I wanted. Overall, I feel the quality is good, and I am happy with my purchase.', '2025-12-20 10:14:57'),
(2, 2, 1, 5, 'kkjjk', '2026-01-10 10:20:44'),
(3, 2, 1, 4, 'knkjnnjk\n', '2026-01-10 10:21:01'),
(4, 2, 1, 5, 'knkn', '2026-01-10 10:21:07'),
(5, 2, 1, 5, 'mn m', '2026-01-10 10:21:17'),
(6, 2, 1, 5, 'mn kkkkkkj', '2026-01-10 10:21:23'),
(7, 2, 1, 5, 'jhbnmjhb', '2026-01-10 10:21:32'),
(8, 2, 1, 5, 'kj', '2026-01-10 10:22:05');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `device_type` varchar(20) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `last_active` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_categories`
--

CREATE TABLE `sub_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_categories`
--

INSERT INTO `sub_categories` (`id`, `name`, `image`, `description`, `category_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Clothing', '/uploads/sub_categories/sub_categories_1774263743801_r5l3xefh4xg.peg', '', 1, 'active', '2025-12-20 06:32:23', '2026-03-23 11:02:23'),
(2, 'Footwear', '/uploads/sub_categories/sub_categories_1774263738592_b51xf484zf7.peg', NULL, 1, 'active', '2025-12-20 06:32:23', '2026-03-23 11:02:18'),
(3, 'Accessories', '/uploads/sub_categories/sub_categories_1774263731401_96n1cteaq9n.peg', NULL, 1, 'active', '2025-12-20 06:32:23', '2026-03-23 11:02:11'),
(4, 'Innerwear & Sleepwear', '/uploads/sub_categories/sub_categories_1774263721428_zvlvflcspni.peg', NULL, 1, 'inactive', '2025-12-20 06:32:23', '2026-03-23 11:02:06'),
(5, 'Sports & Activewear', '/uploads/sub_categories/sub_categories_1774263716254_zqkew9bmxn.peg', NULL, 1, 'active', '2025-12-20 06:32:23', '2026-03-23 11:01:56'),
(6, 'Clothing', '/uploads/sub_categories/sub_categories_1774263701829_9sqxn2gsf5.peg', NULL, 2, 'active', '2025-12-20 06:32:23', '2026-03-23 11:01:41'),
(7, 'Footwear', '/uploads/sub_categories/sub_categories_1774263696714_ubrgtbp9bjn.peg', NULL, 2, 'active', '2025-12-20 06:32:23', '2026-03-23 11:01:36'),
(8, 'Accessories', '/uploads/sub_categories/sub_categories_1774263691289_jer4j9cg2nm.peg', NULL, 2, 'active', '2025-12-20 06:32:23', '2026-03-23 11:01:31'),
(9, 'Beauty & Personal Care', '/uploads/sub_categories/sub_categories_1774263668451_ont78jzj74p.peg', NULL, 2, 'inactive', '2025-12-20 06:32:23', '2026-03-23 11:01:24'),
(10, 'Sports & Activewear', '/uploads/sub_categories/sub_categories_1774263661942_6itqpnm0uth.peg', NULL, 2, 'active', '2025-12-20 06:32:23', '2026-03-23 11:01:01'),
(11, 'Boys Clothing', NULL, NULL, 3, 'inactive', '2025-12-20 06:32:23', '2026-03-23 11:00:55'),
(12, 'Girls Clothing', '/uploads/sub_categories/sub_categories_1774263635001_zy9xgkc96ak.peg', NULL, 3, 'active', '2025-12-20 06:32:23', '2026-03-23 11:00:35'),
(13, 'Baby Clothing', '/uploads/sub_categories/sub_categories_1774263629436_lz5v9u9md5r.peg', NULL, 3, 'active', '2025-12-20 06:32:23', '2026-03-23 11:00:29'),
(14, 'Footwear', '/uploads/sub_categories/sub_categories_1774263623934_ipwp1z6azaf.peg', NULL, 3, 'active', '2025-12-20 06:32:23', '2026-03-23 11:00:23'),
(15, 'Toys & Accessorie\'s', '/uploads/sub_categories/sub_categories_1774263616962_2pjubj22doq.peg', '', 3, 'active', '2025-12-20 06:32:23', '2026-03-23 11:00:16');

-- --------------------------------------------------------

--
-- Table structure for table `sub_sub_categories`
--

CREATE TABLE `sub_sub_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sub_category_id` int(11) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_sub_categories`
--

INSERT INTO `sub_sub_categories` (`id`, `name`, `image`, `description`, `sub_category_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'T-Shirts', NULL, NULL, 1, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(2, 'Shirts', NULL, NULL, 1, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(3, 'Jeans', '1769348028025_------------------.png', NULL, 1, 'active', '2025-12-20 06:33:18', '2026-01-25 13:33:48'),
(4, 'Trousers', NULL, NULL, 1, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(5, 'Jackets & Coats', NULL, NULL, 1, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(6, 'Ethnic Wear', NULL, NULL, 1, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(7, 'Casual Shoes', NULL, NULL, 2, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(8, 'Formal Shoes', NULL, NULL, 2, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(9, 'Sports Shoes', NULL, NULL, 2, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(10, 'Sandals & Floaters', NULL, NULL, 2, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(11, 'Watches', NULL, NULL, 3, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(12, 'Wallets', NULL, NULL, 3, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(13, 'Belts', NULL, NULL, 3, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(14, 'Caps & Hats', NULL, NULL, 3, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(15, 'Briefs', NULL, NULL, 4, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(16, 'Boxers', NULL, NULL, 4, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(17, 'Vests', NULL, NULL, 4, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(18, 'Nightwear', NULL, NULL, 4, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(19, 'Track Pants', NULL, NULL, 5, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(20, 'Gym T-Shirts', NULL, NULL, 5, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(21, 'Shorts', NULL, NULL, 5, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(22, 'Dresses', NULL, NULL, 6, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(23, 'Tops & Tees', NULL, NULL, 6, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(24, 'Kurtas & Kurtis', NULL, '', 6, 'active', '2025-12-20 06:33:18', '2026-02-08 20:37:59'),
(25, 'Sarees', NULL, NULL, 6, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(26, 'Jeans & Jeggings', NULL, NULL, 6, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(27, 'Heels', NULL, NULL, 7, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(28, 'Flats', NULL, NULL, 7, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(29, 'Sandals', NULL, NULL, 7, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(30, 'Sports Shoes', NULL, NULL, 7, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(31, 'Handbags', NULL, NULL, 8, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(32, 'Jewellery', NULL, NULL, 8, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(33, 'Scarves & Stoles', NULL, NULL, 8, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(34, 'Makeup', NULL, NULL, 9, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(35, 'Skincare', NULL, NULL, 9, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(36, 'Hair Care', NULL, NULL, 9, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(37, 'Yoga Wear', NULL, NULL, 10, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(38, 'Running Wear', NULL, NULL, 10, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(39, 'T-Shirts', NULL, NULL, 11, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(40, 'Shorts', NULL, NULL, 11, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(41, 'Jeans', NULL, NULL, 11, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(42, 'Frocks', NULL, NULL, 12, 'active', '2025-12-20 06:33:18', '2026-01-23 05:13:57'),
(43, 'Leggings', NULL, NULL, 12, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(44, 'Tops', NULL, NULL, 12, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(45, 'Rompers', NULL, NULL, 13, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(46, 'Onesies', NULL, NULL, 13, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(47, 'School Shoes', NULL, NULL, 14, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(48, 'Sports Shoes', NULL, NULL, 14, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(49, 'Educational Toys', NULL, NULL, 15, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(50, 'Soft Toys', NULL, NULL, 15, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(51, 'Remote Toys', NULL, NULL, 15, 'active', '2025-12-20 06:33:18', '2025-12-20 06:33:18'),
(52, 'Sleep & Lounge', NULL, 'Sleep & Lounge', 1, 'active', '2025-12-21 13:33:22', '2025-12-21 13:33:22'),
(53, 'Fashion Hoodies & Sweatshirts', NULL, 'Fashion Hoodies & Sweatshirts', 6, 'active', '2025-12-21 14:00:16', '2025-12-21 14:00:16'),
(54, 'Clothing Set\'s', '', '', 13, 'active', '2026-03-23 11:27:29', '2026-03-23 11:27:29');

-- --------------------------------------------------------

--
-- Table structure for table `twofa_settings`
--

CREATE TABLE `twofa_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `secret` varchar(255) DEFAULT NULL,
  `is_enabled` tinyint(1) DEFAULT 0,
  `backup_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`backup_codes`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `two_fa`
--

CREATE TABLE `two_fa` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `secret` varchar(255) NOT NULL,
  `backup_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`backup_codes`)),
  `enabled` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `two_fa`
--

INSERT INTO `two_fa` (`id`, `user_id`, `secret`, `backup_codes`, `enabled`, `created_at`, `updated_at`) VALUES
(2, 5, 'JRSFUYLWJJLTM4BPJI2W2ORFGZBWEY2N', NULL, 0, '2026-02-08 13:46:20', '2026-02-09 04:53:24'),
(3, 7, 'GVFUSORIIFEUGKCUPVKDGT3OI4SEOWCU', '[\"RVBQ94Q9\",\"SHY4IW12\",\"EXCDBWKL\",\"17W83DZZ\",\"1QMQMXMJ\",\"OVU57M4U\",\"AUMFKNDT\",\"JAX2H1EG\"]', 1, '2026-02-14 08:43:46', '2026-02-18 07:45:06');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `auth_method` enum('local','google') DEFAULT 'local',
  `otp` varchar(10) DEFAULT NULL,
  `otp_expiration` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_premium` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'India',
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `newsletter_subscribed` tinyint(1) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`, `google_id`, `avatar`, `auth_method`, `otp`, `otp_expiration`, `is_active`, `is_verified`, `is_premium`, `created_at`, `updated_at`, `last_login`, `city`, `state`, `postal_code`, `country`, `date_of_birth`, `gender`, `newsletter_subscribed`, `is_deleted`, `deleted_at`) VALUES
(1, 'Sohal ansari', 'sss2424786@gmail.com', '$2b$12$LFpEWQGqxu9pKSS6rnaxFeTaFDAif/qMHawDHHCKEltvMrY7NVtQG', '1234567891', 'Near Noorani Masjid Kurla East Maharastra Mumbai', NULL, 'uploads/avatars/avatar_1.jpg', 'local', NULL, NULL, 1, 1, 1, '2025-12-20 06:13:26', '2025-12-28 12:37:42', NULL, NULL, NULL, NULL, 'India', NULL, NULL, 0, 0, NULL),
(3, 'Shaziya Khan', 'khanshaziya0221@gmail.com', '$2b$12$z0BVg3o/e/JALtU6dWPqme88a4OGcHLV03WZNfDD1UxuD60qczcfG', '8928242895', 'chirag nagar Ghatkopar West Mumbai Maharastra', NULL, NULL, 'local', NULL, NULL, 1, 1, 0, '2026-01-10 10:34:35', '2026-03-12 07:32:55', NULL, NULL, NULL, NULL, 'India', NULL, NULL, 0, 0, NULL),
(4, 'Pankhudi Demo', 'pankhudiforyou@gmail.com', '$2b$12$SNwnPyfsAy7VwG2UA8bsieT/9NKaRhR7Bve9xOH30MN8tl2IuYA4e', '1478523698', 'asfghjkl;weeyuiopxcvbnmfghjkl; er fdghjkl fghjkms sdvcn knkj nbnkf bngb gbkj bnfgb kbnk nfgnbkjnb krnbk knbknbgngnb kgnkgn ngkblgf ', NULL, NULL, 'local', NULL, NULL, 1, 1, 0, '2026-01-23 05:16:41', '2026-01-23 05:16:41', NULL, NULL, NULL, NULL, 'India', NULL, NULL, 0, 0, NULL),
(5, 'Kartik', 'shettykartik112@gmail.com', '$2b$10$zvu.2pvmKcRfenQDE0ACu.x.NCs85WDkGmqaIeCaMSjWguLwN1gyO', '1478523611', '123wydgferhri kdfjhjw kjrhhkjfbnk rkjjnkfn kfjjfkn kfjkjfn fkbfjkn kjfnbkjfn ', NULL, 'uploads/avatars/avatar_5.jpg', 'local', NULL, NULL, 1, 1, 0, '2026-01-23 05:23:27', '2026-02-08 20:23:42', NULL, NULL, NULL, NULL, 'India', NULL, NULL, 0, 0, NULL),
(7, 'sohail Ansari', 'mosohal496@gmail.com', '$2b$12$pg5p6PBTgFPaAl0mUmGAXeTYF85qe.y5F4ReExaWz1K5504i65J5W', '8574814920', 'near noorani masjid S G Brave Marge Kurla East', '108138111581736976242', 'https://lh3.googleusercontent.com/a/ACg8ocKqWBkR8XuKLdaHv03XcUKhZif2z_p5IG5CIUMJHmG5Nipbo2I=s96-c', 'local', NULL, NULL, 1, 1, 0, '2026-02-12 04:31:27', '2026-03-23 08:45:25', NULL, NULL, NULL, NULL, 'India', NULL, NULL, 0, 0, NULL),
(11, 'Sohal Ansari', 'sohalansari4934@gmail.com', '$2b$10$hkP9zZiSpP2EkfNqnP.3ie8APGFcurq5Mh.udrkqIxH1QEBP15.cS', '8574814934', 'Kurla East\nS G Brave Marge', '107588506937356749585', 'https://lh3.googleusercontent.com/a/ACg8ocJv8GL0p2oawNZ5pElX1m0edQtwsmfKlXI_PMhitihYXGKsBzFw=s96-c', 'local', NULL, NULL, 1, 1, 0, '2026-03-05 12:34:46', '2026-03-24 02:51:07', NULL, NULL, NULL, NULL, 'India', NULL, NULL, 0, 0, '2026-03-05 12:35:22');

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_type` varchar(20) DEFAULT 'home',
  `full_name` varchar(100) NOT NULL,
  `address_line` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(50) DEFAULT 'India',
  `phone` varchar(20) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `user_id`, `address_type`, `full_name`, `address_line`, `city`, `state`, `postal_code`, `country`, `phone`, `is_default`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'home', 'Sohal ansari', 'Near Noorani Masjid Kurla East Maharastra Mumbai', 'Mumbai', 'Maharastra', '224141', 'India', '8574814934', 1, 1, '2026-02-06 08:57:27', '2026-02-06 08:57:27'),
(5, 5, 'home', 'Kartik', '123wydgferhri kdfjhjw kjrhhkjfbnk rkjjnkfn kfjjfkn kfjkjfn fkbfjkn kjfnbkjfn', 'Mumbai', 'Maharsatra', '400024', 'India', '7485965487', 0, 0, '2026-02-06 17:44:10', '2026-02-08 17:04:46'),
(10, 5, 'home', 'Kartik', '123wydgferhri kdfjhjw kjrhhkjfbnk rkjjnkfn kfjjfkn kfjkjfn fkbfjkn kjfnbkjfn', 'mumbai', 'maharastra', '400024', 'India', '7854693215', 1, 1, '2026-02-09 04:55:43', '2026-02-09 04:55:43'),
(11, 7, 'home', 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', 1, 1, '2026-02-14 05:14:51', '2026-02-14 10:17:03'),
(12, 7, 'home', 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814920', 0, 0, '2026-02-14 06:38:40', '2026-02-14 07:01:54'),
(13, 7, 'home', 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814920', 0, 0, '2026-02-14 07:01:35', '2026-02-14 07:06:31'),
(14, 7, 'home', 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814926', 0, 0, '2026-02-14 07:13:57', '2026-02-14 07:25:44'),
(15, 7, 'office', 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', 0, 0, '2026-02-14 07:26:22', '2026-02-14 08:41:06'),
(16, 7, 'office', 'sohail Ansari', 'near noorani masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814920', 0, 1, '2026-02-14 10:16:54', '2026-02-14 10:17:33'),
(17, 2, 'home', 'Sohal Ansari', 'Near Noorani Masjid S G Brave Marge Kurla East', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', 1, 1, '2026-02-17 10:10:51', '2026-02-17 10:12:28'),
(18, 2, 'work', 'Sohal Ansari', 'Goshaiganj State Ayoudhya', 'Goshaiganj', 'Uttar Pradesh', '224141', 'India', '8574814934', 0, 1, '2026-02-17 10:12:21', '2026-02-17 10:12:28'),
(19, 8, 'home', 'Sohal Ansari', 'Kurla East\nS G Brave Marge', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', 1, 1, '2026-02-17 11:25:48', '2026-02-17 11:25:48'),
(20, 9, 'home', 'Sohal Ansari', 'Kurla East\nS G Brave Marge', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', 1, 1, '2026-02-18 07:52:41', '2026-02-18 07:52:41'),
(21, 11, 'home', 'Sohal Ansari', 'Kurla East\nS G Brave Marge', 'Mumbai', 'Maharashtra', '400024', 'India', '8574814934', 1, 1, '2026-03-05 12:43:47', '2026-03-05 12:43:47');

-- --------------------------------------------------------

--
-- Table structure for table `user_backup_codes`
--

CREATE TABLE `user_backup_codes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `backup_code` varchar(50) NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `browser` varchar(50) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL,
  `device_type` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_active` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_id`, `ip_address`, `user_agent`, `browser`, `os`, `device_type`, `created_at`, `last_active`, `expires_at`, `is_active`) VALUES
(8, 7, '69dfe76c-ffaa-43d5-b9ef-0654b94ad49e', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-02-17 10:54:38', '2026-02-18 07:43:30', '2026-03-19 10:54:38', 0),
(12, 7, 'cbb699b4-a602-4a61-b4f1-f39ad2accfa7', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-02-17 16:29:45', '2026-02-18 07:43:34', '2026-03-19 16:29:45', 0),
(13, 7, '855b713c-67f4-42cc-b05d-fcfb68c1fd8c', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-02-17 16:30:47', '2026-02-18 07:43:42', '2026-03-19 16:30:47', 0),
(14, 7, '9b47d3ec-7b50-4d8a-b8f7-1fbac6b8a95b', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-02-17 17:42:16', '2026-02-18 07:43:44', '2026-03-19 17:42:16', 0),
(15, 4, '586c1528-0ffe-4bb5-8b84-b3276a550b4b', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-02-17 17:44:13', '2026-02-17 17:45:12', '2026-03-19 17:44:13', 0),
(16, 4, '87ccbf7d-5753-4961-9736-0ce8ef8f539a', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-02-17 17:44:38', '2026-02-17 17:45:15', '2026-03-19 17:44:38', 0),
(17, 7, 'c2843a62-4ca1-4ffb-bbe1-15a114939b73', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-02-18 07:43:10', '2026-02-18 07:43:10', '2026-03-20 07:43:10', 1),
(18, 7, '0c8c4c1e-dc92-4dfd-be50-1847c65ee5e2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-02-18 07:44:24', '2026-02-18 07:44:24', '2026-03-20 07:44:24', 1),
(19, 7, '91e3b32a-eb90-48bb-b5b5-156250dd46fd', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-02-18 07:45:46', '2026-02-18 07:45:46', '2026-03-20 07:45:46', 1),
(21, 7, 'dcf078cc-049a-45e4-8999-e02b8b27fb88', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-02-21 11:12:58', '2026-02-21 11:12:58', '2026-03-23 11:12:58', 1),
(24, 11, '84590aef-a746-42ac-ad72-7c0e46e269dd', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-03-05 12:34:46', '2026-03-05 12:35:22', '2026-04-04 12:34:46', 0),
(25, 11, 'a5e9bea7-ae0d-449c-acd9-55a4523b8062', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-03-05 12:37:01', '2026-03-05 12:37:01', '2026-04-04 12:37:01', 1),
(26, 11, 'd81d803b-c123-48a1-b82c-c38d74a2c403', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-03-05 12:38:24', '2026-03-05 12:38:24', '2026-04-04 12:38:24', 1),
(27, 11, '1f2869d9-123f-4986-a7a2-b46dc5a1a0c3', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-03-05 12:40:35', '2026-03-05 12:40:35', '2026-04-04 12:40:35', 1),
(28, 7, '0c434ef1-2f9c-44f5-b442-3c4889621e80', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-03-12 06:43:39', '2026-03-12 06:43:39', '2026-04-11 06:43:39', 1),
(29, 7, '190a71bf-fc7d-4e6e-b474-3d131b7a32a1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-03-12 06:44:38', '2026-03-12 06:44:38', '2026-04-11 06:44:38', 1),
(30, 7, '99befbe7-3601-4c7e-aefa-18db1bb475e8', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-03-23 08:45:46', '2026-03-23 08:45:46', '2026-04-22 08:45:46', 1),
(31, 7, 'ad46b0da-b37d-47b1-b58e-1cf09d36e527', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-03-24 02:46:10', '2026-03-24 02:46:10', '2026-04-23 02:46:10', 1),
(32, 7, 'd754e1ce-bfac-41cd-96a1-fb2059051440', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', '2026-03-24 02:48:26', '2026-03-24 02:48:26', '2026-04-23 02:48:26', 1),
(33, 11, '5f55a02d-7e6c-4b09-bc42-b7e3ebfdc26d', '::1', 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Chrome', 'Linux', 'mobile', '2026-03-24 02:51:07', '2026-03-24 02:51:07', '2026-04-23 02:51:07', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `theme` varchar(20) DEFAULT 'light',
  `language` varchar(20) DEFAULT 'english',
  `notifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notifications`)),
  `privacy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`privacy`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_settings`
--

INSERT INTO `user_settings` (`id`, `user_id`, `theme`, `language`, `notifications`, `privacy`, `created_at`, `updated_at`) VALUES
(2, 5, 'light', 'hindi', '{\"email\":true,\"push\":true,\"sms\":false,\"marketing\":true,\"updates\":true}', '{\"profile_visibility\":\"private\",\"show_online_status\":false,\"allow_tagging\":true,\"search_visibility\":true,\"data_sharing\":false}', '2026-02-08 13:37:48', '2026-02-08 13:51:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_position` (`position`),
  ADD KEY `idx_display_order` (`display_order`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cart_user` (`user_id`),
  ADD KEY `fk_cart_product` (`product_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_name_unique` (`name`);

--
-- Indexes for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `fk_order_email` (`order_id`);

--
-- Indexes for table `login_activity`
--
ALTER TABLE `login_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_timestamp` (`user_id`,`timestamp`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_order_status` (`order_status`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_order_date` (`order_date`),
  ADD KEY `idx_tracking` (`tracking_number`),
  ADD KEY `idx_estimated_delivery` (`estimated_delivery`),
  ADD KEY `idx_deleted` (`deleted_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `order_returns`
--
ALTER TABLE `order_returns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_return_order` (`order_id`),
  ADD KEY `idx_return_status` (`status`);

--
-- Indexes for table `order_settings`
--
ALTER TABLE `order_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_status` (`order_id`,`status`);

--
-- Indexes for table `order_status_timeouts`
--
ALTER TABLE `order_status_timeouts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_order_payment` (`order_id`),
  ADD KEY `idx_razorpay_order` (`razorpay_order_id`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_transaction_id` (`transaction_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_unique` (`sku`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_products_category` (`category_id`),
  ADD KEY `fk_products_sub_category` (`sub_category_id`),
  ADD KEY `fk_products_sub_sub_category` (`sub_sub_category_id`);

--
-- Indexes for table `promo_codes`
--
ALTER TABLE `promo_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indexes for table `promo_code_usage`
--
ALTER TABLE `promo_code_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_promo_user` (`promo_code_id`,`user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `registration_otps`
--
ALTER TABLE `registration_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reviews_product` (`product_id`),
  ADD KEY `fk_reviews_user` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_id` (`session_id`),
  ADD KEY `idx_user_last_active` (`user_id`,`last_active`);

--
-- Indexes for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sub_category_category` (`category_id`);

--
-- Indexes for table `sub_sub_categories`
--
ALTER TABLE `sub_sub_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sub_sub_category` (`sub_category_id`);

--
-- Indexes for table `twofa_settings`
--
ALTER TABLE `twofa_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_2fa` (`user_id`);

--
-- Indexes for table `two_fa`
--
ALTER TABLE `two_fa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_is_default` (`is_default`);

--
-- Indexes for table `user_backup_codes`
--
ALTER TABLE `user_backup_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_backup_code` (`backup_code`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_id` (`session_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_session_id` (`session_id`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `login_activity`
--
ALTER TABLE `login_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `order_returns`
--
ALTER TABLE `order_returns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_settings`
--
ALTER TABLE `order_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `order_status_timeouts`
--
ALTER TABLE `order_status_timeouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `promo_codes`
--
ALTER TABLE `promo_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `promo_code_usage`
--
ALTER TABLE `promo_code_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `registration_otps`
--
ALTER TABLE `registration_otps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sub_categories`
--
ALTER TABLE `sub_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `sub_sub_categories`
--
ALTER TABLE `sub_sub_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `twofa_settings`
--
ALTER TABLE `twofa_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `two_fa`
--
ALTER TABLE `two_fa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `user_backup_codes`
--
ALTER TABLE `user_backup_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD CONSTRAINT `fk_order_email` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `login_activity`
--
ALTER TABLE `login_activity`
  ADD CONSTRAINT `login_activity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_returns`
--
ALTER TABLE `order_returns`
  ADD CONSTRAINT `order_returns_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_returns_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `payment_transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_products_sub_category` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_products_sub_sub_category` FOREIGN KEY (`sub_sub_category_id`) REFERENCES `sub_sub_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `promo_code_usage`
--
ALTER TABLE `promo_code_usage`
  ADD CONSTRAINT `promo_code_usage_ibfk_1` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `promo_code_usage_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `promo_code_usage_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD CONSTRAINT `fk_sub_category_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sub_sub_categories`
--
ALTER TABLE `sub_sub_categories`
  ADD CONSTRAINT `fk_sub_sub_category` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `twofa_settings`
--
ALTER TABLE `twofa_settings`
  ADD CONSTRAINT `twofa_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `two_fa`
--
ALTER TABLE `two_fa`
  ADD CONSTRAINT `two_fa_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_backup_codes`
--
ALTER TABLE `user_backup_codes`
  ADD CONSTRAINT `user_backup_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
