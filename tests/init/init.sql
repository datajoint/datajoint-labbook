CREATE DATABASE `alpha_company`;

CREATE TABLE `alpha_company`.`~log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'event order id',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'event timestamp',
  `version` varchar(12) NOT NULL COMMENT 'datajoint version',
  `user` varchar(255) NOT NULL COMMENT 'user@host',
  `host` varchar(255) NOT NULL DEFAULT '' COMMENT 'system hostname',
  `event` varchar(255) NOT NULL DEFAULT '' COMMENT 'event message',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='event logging table for `alpha_company`';

CREATE TABLE `alpha_company`.`computer` (
  `computer_id` binary(16) NOT NULL COMMENT ':uuid:unique id',
  `computer_serial` varchar(9) NOT NULL DEFAULT 'ABC101' COMMENT 'manufacturer serial number',
  `computer_brand` enum('HP','Dell') NOT NULL COMMENT 'manufacturer brand',
  `computer_built` date NOT NULL COMMENT 'manufactured date',
  `computer_processor` double NOT NULL COMMENT 'processing power in GHz',
  `computer_memory` int NOT NULL COMMENT 'RAM in GB',
  `computer_weight` float NOT NULL COMMENT 'weight in lbs',
  `computer_cost` decimal(6,2) NOT NULL COMMENT 'purchased price',
  `computer_preowned` tinyint(1) NOT NULL COMMENT 'purchased as new or used',
  `computer_purchased` datetime NOT NULL COMMENT 'purchased date and time',
  `computer_updates` time DEFAULT NULL COMMENT 'scheduled daily update timeslot',
  `computer_accessories` longblob COMMENT 'included additional accessories',
  PRIMARY KEY (`computer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Computers that belong to the company';

INSERT INTO `alpha_company`.`computer` (computer_id, computer_serial, computer_brand, computer_built, computer_processor, computer_memory, computer_weight, computer_cost, computer_preowned, computer_purchased, computer_updates, computer_accessories)
VALUES
(X'4E41491A86D54AF7A01389BDE75528BD', 'DJS1JA17G', 'Dell', '2020-05-25', 2.2, 16, 4.4, 700.99, 0, '2020-10-20 08:04:21', NULL, NULL)
,(X'DCD4CFD96791433CA805F391C289E6EA', 'HUA20K9LL', 'HP', '2020-07-12', 2.8, 32, 5.7, 693.54, 1, '2020-11-05 13:58:02', '23:30:05', X'646A30000403000000000000001400000000000000050B00000000000000706F7765725F6361626C6504000000000000000A0100010E000000000000000505000000000000006D6F75736504000000000000000A01000111000000000000000508000000000000006B6579626F61726404000000000000000A010001');

CREATE TABLE `alpha_company`.`#employee` (
  `computer_id` binary(16) NOT NULL COMMENT ':uuid:unique id',
  `employee_name` varchar(30) NOT NULL COMMENT 'employee name',
  PRIMARY KEY (`computer_id`),
  CONSTRAINT `#employee_ibfk_1` FOREIGN KEY (`computer_id`) REFERENCES `alpha_company`.`computer` (`computer_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Employees that are assigned a computer';

INSERT INTO `alpha_company`.`#employee` (computer_id, employee_name)
VALUES
(X'4E41491A86D54AF7A01389BDE75528BD', 'Raphael Guzman')
,(X'DCD4CFD96791433CA805F391C289E6EA', 'John Doe');

CREATE DATABASE `empty`;
