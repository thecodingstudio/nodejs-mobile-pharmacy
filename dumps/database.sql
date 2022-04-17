use `pharmacy_app`;
DROP TABLE IF EXISTS `admin_config`;
CREATE TABLE IF NOT EXISTS `admin_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(40) DEFAULT NULL,
  `config_value` varchar(200) DEFAULT NULL,
  `value_unit` varchar(20) DEFAULT NULL,
  `is_test` tinyint(1) DEFAULT '0' COMMENT '0 = Test, 1 = Production',
  `is_delete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` tinyint(1) DEFAULT '0' COMMENT '0 = Admin, 1 = Coustomer, 2 = Pharmacist',
  `name`  varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `gender` tinyint(1) DEFAULT '0' COMMENT '0 = Male, 1 = Female',
  `password` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `mobile` bigint(20) DEFAULT NULL,
  `is_verify` tinyint(1) DEFAULT '0' COMMENT '0 = No, 1 = Yes',
  `is_active` tinyint(1) DEFAULT '0' COMMENT '0 = No, 1 = Yes',
  `is_test` tinyint(1) DEFAULT '0' COMMENT '0 = Test, 1 = Production',
  `is_delete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=447 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `app_tokens`;
CREATE TABLE IF NOT EXISTS `app_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `token` varchar(200) DEFAULT NULL,
  `token_type` enum('access_token') DEFAULT 'access_token',
  `status` enum('active','expired') DEFAULT 'active',
  `expiry` varchar(30) DEFAULT NULL,
  `access_count` int(11) DEFAULT NULL,
  `device_token` varchar(255) DEFAULT NULL,
  `device_type` tinyint(1) DEFAULT NULL COMMENT '0 = iOS, 1 = Android, 2 = Postman, 3 = Browser',
  `is_test` tinyint(1) DEFAULT '0' COMMENT '0 = Test, 1 = Production',
  `is_delete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=447 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `addresses`;
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `address_type` tinyint(1) DEFAULT '0' COMMENT '0 = Home, 1 = Office, 3 = None',
  `primary_address` varchar(255) DEFAULT NULL,
  `addition_address_info` varchar(255) DEFAULT NULL,
  `let` varchar(255) DEFAULT NULL,
  `long` varchar(255) DEFAULT NULL,
  `is_test` tinyint(1) DEFAULT '0' COMMENT '0 = Test, 1 = Production',
  `is_delete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=447 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `prescriptions`;
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `madicine_name`  VARCHAR(100) DEFAULT NULL,
  `text_note` VARCHAR(100) DEFAULT NULL,
  `quantity` INT(5) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0' COMMENT '0 = pending, 1 = completed, 2 = rejected',
  `is_test` tinyint(1) DEFAULT '0' COMMENT '0 = Test, 1 = Production',
  `is_delete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=447 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `stores`;
CREATE TABLE IF NOT EXISTS `stores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `name`  varchar(50) DEFAULT NULL,
  `license` varchar(100) DEFAULT NULL,
  `address_id` INT(11) DEFAULT NULL,
  `pharmacy_id` INT(7) DEFAULT NULL,
  `is_test` tinyint(1) DEFAULT '0' COMMENT '0 = Test, 1 = Production',
  `is_delete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=447 DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `quotes`;
CREATE TABLE IF NOT EXISTS `quotes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `store_id` INT(11) DEFAULT NULL,
  `price` DECIMAL(5,2) DEFAULT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `is_test` tinyint(1) DEFAULT '0' COMMENT '0 = Test, 1 = Production',
  `is_delete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=447 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `quote_id` INT(11) DEFAULT NULL,
  `payment_method` tinyint(1) DEFAULT '0' COMMENT '0 = COD, 1 = Online',
  `checkout_type` tinyint(1) DEFAULT '0' COMMENT '0 = Pay & Collect from store, 1 = Book & Collect from store, 2 = Pay & Get delivery, 3 = Get delivery & Do COD.',
  `delivary_charge` DECIMAL(5,2) DEFAULT NULL,
  `total_amount` DECIMAL(5,2) DEFAULT NULL,
  `user_id` INT(11) DEFAULT NULL,
  `store_id` INT(11) DEFAULT NULL,
  `is_test` tinyint(1) DEFAULT '0' COMMENT '0 = Test, 1 = Production',
  `is_delete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=447 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` VARCHAR(50) DEFAULT NULL,
  `amount` DECIMAL(5,2) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0' COMMENT '0 = Test, 1 = Production',
  `user_id` INT(11) DEFAULT NULL,
  `store_id` INT(11) DEFAULT NULL,
  `order_id` INT(11) DEFAULT NULL,
  `is_test` tinyint(1) DEFAULT '0' COMMENT '0 = Process, 1 = Success, 2 = Failed',
  `is_delete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=447 DEFAULT CHARSET=utf8;