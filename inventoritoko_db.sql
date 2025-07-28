/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('PAID','PENDING') DEFAULT 'PENDING',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `auth` (`id`, `username`, `email`, `password`, `createdAt`, `updatedAt`) VALUES
(3, 'test', 'test@gmail.com', '$2a$10$LLrodunaIZtP/mwjpKhGIugT9A.XClBsPt3sAe9GnsCAUaffchHJ6', '2025-07-28 10:23:12', '2025-07-28 10:23:12'),
(4, 'lalala', 'lala@gmail.com', '$2a$10$21cwXr227lR76OvPCwEKqupZUIbFSD4GR//Udo5YC/d1vAPIE5p2q', '2025-07-28 14:23:07', '2025-07-28 14:23:07'),
(5, 'lulu', 'lulu@gmail.com', '$2a$10$aHGKbDt4r5zmfcxN.RaQouKA5LY4SSemK/Y4jYZ7BtIlhn0.2FXPS', '2025-07-28 14:32:40', '2025-07-28 14:32:40'),
(6, 'lili', 'li@gmail.com', '$2a$10$5VQBqQbooyUWrIZVoBACiOf5wQKDa0kFYUAjSnZil1FVz2haBgZg.', '2025-07-28 14:34:46', '2025-07-28 14:34:46'),
(7, 'lolo', 'lo@gmail.com', '$2a$10$TqLcEnZDgp6krTR48a5vaukMNH8QUHYxoYi3Ly.h.tDf6rpSGhFze', '2025-07-28 14:36:00', '2025-07-28 14:36:00');
INSERT INTO `carts` (`id`, `user_id`, `product_id`, `quantity`, `createdAt`, `updatedAt`) VALUES
(44, 4, 1, 1, '2025-07-28 22:24:16', '2025-07-28 22:24:16');
INSERT INTO `products` (`id`, `name`, `price`, `stock`, `createdAt`, `updatedAt`, `image`) VALUES
(1, 'Sabun Cuci Piring', '7000.00', 39, '2025-07-27 11:16:24', '2025-07-28 21:23:46', '/uploads/sabun-cuci-piring.jpg'),
(2, 'Minyak Goreng 1L', '14000.00', 24, '2025-07-27 11:16:24', '2025-07-28 20:14:41', '/uploads/minyak-goreng-1L.jpg'),
(3, 'Beras 5kg', '60000.00', 17, '2025-07-27 11:16:24', '2025-07-28 18:19:57', '/uploads/beras-5KG.jpg'),
(4, 'Gula Pasir 1kg', '13000.00', 22, '2025-07-27 11:16:24', '2025-07-28 19:29:53', '/uploads/gula-pasir-1Kg.jpg'),
(5, 'Mie Instan', '2500.00', 76, '2025-07-27 11:16:24', '2025-07-28 22:36:33', '/uploads/mie-instan.jpg');
INSERT INTO `transaction_items` (`id`, `transaction_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 2, '7000.00'),
(2, 1, 5, 5, '2500.00'),
(3, 5, 1, 2, '7000.00'),
(4, 5, 5, 5, '2500.00'),
(5, 5, 3, 2, '60000.00'),
(6, 6, 2, 1, '14000.00'),
(7, 6, 2, 1, '14000.00'),
(8, 7, 1, 2, '7000.00'),
(22, 18, 4, 1, '13000.00'),
(23, 18, 5, 1, '2500.00'),
(24, 19, 5, 1, '2500.00'),
(25, 20, 5, 1, '2500.00'),
(26, 21, 5, 1, '2500.00'),
(27, 22, 5, 1, '2500.00'),
(28, 23, 1, 2, '7000.00'),
(29, 23, 2, 1, '14000.00'),
(30, 24, 1, 1, '7000.00'),
(31, 24, 5, 1, '2500.00'),
(32, 25, 5, 2, '2500.00'),
(33, 26, 5, 1, '2500.00');
INSERT INTO `transactions` (`id`, `user_id`, `total_price`, `status`, `createdAt`, `updatedAt`) VALUES
(18, 3, '15500.00', 'PAID', '2025-07-28 19:29:53', '2025-07-28 19:29:53'),
(19, 3, '2500.00', 'PAID', '2025-07-28 19:35:45', '2025-07-28 19:35:45'),
(20, 3, '2500.00', 'PAID', '2025-07-28 19:41:56', '2025-07-28 19:41:56'),
(21, 3, '2500.00', 'PAID', '2025-07-28 19:49:48', '2025-07-28 19:49:48'),
(22, 3, '2500.00', 'PAID', '2025-07-28 20:13:57', '2025-07-28 20:13:57'),
(23, 3, '28000.00', 'PAID', '2025-07-28 20:14:41', '2025-07-28 20:14:41'),
(24, 4, '9500.00', 'PAID', '2025-07-28 21:23:46', '2025-07-28 21:23:46'),
(25, 4, '5000.00', 'PAID', '2025-07-28 21:24:03', '2025-07-28 21:24:03'),
(26, 4, '2500.00', 'PAID', '2025-07-28 22:36:33', '2025-07-28 22:36:33');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;