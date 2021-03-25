CREATE DATABASE `alpha_company`;
CREATE DATABASE `empty`;

CREATE TABLE `alpha_company`.`computer` (
  `computer_id` binary(16) NOT NULL COMMENT ':uuid:unique id',
  `computer_serial` varchar(9) NOT NULL COMMENT 'manufacturer serial number',
  `computer_brand` enum('HP','Dell') NOT NULL COMMENT 'manufacturer brand',
  `computer_built` date NOT NULL COMMENT 'manufactured date',
  `computer_processor` double NOT NULL COMMENT 'processing power in GHz',
  `computer_memory` int NOT NULL COMMENT 'RAM in GB',
  `computer_weight` float NOT NULL COMMENT 'weight in lbs',
  `computer_cost` decimal(6,2) NOT NULL COMMENT 'purchased price',
  `computer_preowned` tinyint(1) NOT NULL COMMENT 'purchased as new or used',
  `computer_purchased` datetime NOT NULL COMMENT 'purchased date and time',
  `computer_updates` time DEFAULT NULL COMMENT 'scheduled daily update timeslot',
  PRIMARY KEY (`computer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Computers that belong to the company';

INSERT INTO `alpha_company`.`computer` (computer_id, computer_serial, computer_brand, computer_built, computer_processor, computer_memory, computer_weight, computer_cost, computer_preowned, computer_purchased, computer_updates)
VALUES
(X'4e41491a86d54af7a01389bde75528bd', 'DJS1JA17G', 'Dell', '2020-05-25', 2.2, 16, 4.4, 700.99, 0, '2020-10-20 08:04:21', NULL)
,(X'dcd4cfd96791433ca805f391c289e6ea', 'HUA20K9LL', 'HP', '2020-07-12', 2.8, 32, 5.7, 693.54, 1, '2020-11-05 13:58:02', '23:30:05');

CREATE TABLE `alpha_company`.`#employee` (
  `computer_id` binary(16) NOT NULL COMMENT ':uuid:unique id',
  `employee_name` varchar(30) NOT NULL COMMENT 'employee name',
  PRIMARY KEY (`computer_id`),
  CONSTRAINT `#employee_ibfk_1` FOREIGN KEY (`computer_id`) REFERENCES `alpha_company`.`computer` (`computer_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Employees that are assigned a computer';

INSERT INTO `alpha_company`.`#employee` (computer_id, employee_name)
VALUES
(X'4e41491a86d54af7a01389bde75528bd', 'Raphael Guzman')
,(X'dcd4cfd96791433ca805f391c289e6ea', 'John Doe');
