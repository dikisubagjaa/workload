ALTER TABLE `user`
	CHANGE COLUMN `is_hrd` `is_hrd` ENUM('true','false') NULL DEFAULT NULL AFTER `attendance_type`,
	CHANGE COLUMN `is_operational_director` `is_operational_director` ENUM('true','false') NULL DEFAULT NULL AFTER `is_hrd`,
	ADD COLUMN `is_superadmin` ENUM('true','false') NULL DEFAULT NULL AFTER `is_operational_director`;
ALTER TABLE `user`
	ADD COLUMN `is_ae` ENUM('true','false') NULL DEFAULT NULL AFTER `is_superadmin`;

UPDATE user SET is_hrd = null;
UPDATE user SET is_operational_director = null;
ALTER TABLE `timesheet`
	CHANGE COLUMN `created_by` `created_by` INT NOT NULL DEFAULT (0) AFTER `created`,
	CHANGE COLUMN `updated_by` `updated_by` INT NOT NULL DEFAULT (0) AFTER `updated`,
	CHANGE COLUMN `deleted_by` `deleted_by` INT NULL DEFAULT NULL AFTER `deleted`;

ALTER TABLE `task`
	CHANGE COLUMN `priority` `priority` ENUM('low','medium','high','urgent') NULL DEFAULT 'medium' COLLATE 'utf8mb4_0900_ai_ci' AFTER `description`;

ALTER TABLE `user_location` CHANGE `created_by` `created_by` INT NULL DEFAULT NULL; 