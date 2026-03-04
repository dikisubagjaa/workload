-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.12.0.7122
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table v2workload.menu
DROP TABLE IF EXISTS `menu`;
CREATE TABLE IF NOT EXISTS `menu` (
  `menu_id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `path` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ordered` int unsigned DEFAULT NULL,
  `is_show` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'true',
  `type` enum('dashboard','page','button') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'page',
  `is_active` enum('false','true') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'true',
  `parent_id` int unsigned DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`menu_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=195 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table v2workload.menu: ~30 rows (approximately)
DELETE FROM `menu`;
INSERT INTO `menu` (`menu_id`, `title`, `path`, `icon`, `ordered`, `is_show`, `type`, `is_active`, `parent_id`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
	(100, 'General', NULL, NULL, 1, 'true', 'page', 'true', NULL, 1755492679, 1, 1755812211, 1, NULL, NULL),
	(101, 'Task', NULL, NULL, 2, 'true', 'page', 'true', NULL, 1758857362, 1, 1765445615, 21, NULL, NULL),
	(164, 'Dashboard', '/dashboard', 'MdOutlineHome', 1, 'true', 'page', 'true', 100, 1755492679, 1, 1765445646, 21, NULL, NULL),
	(165, 'Projects', '/project', 'MdOutlineWorkspaces', 2, 'true', 'page', 'true', 100, 1755492679, 1, 1765445670, 21, NULL, NULL),
	(166, 'Timesheet', '/timesheet', 'MdOutlineTimer', 3, 'true', 'page', 'true', 100, 1755492679, 1, 1765445698, 21, NULL, NULL),
	(167, 'Clients', '/client', 'MdBusiness', 4, 'true', 'page', 'true', 100, 1755492679, 1, 1765445765, 21, NULL, NULL),
	(168, 'Team', '/team', 'MdOutlineGroups2', 5, 'true', 'page', 'true', 100, 1755492679, 1, 1765445787, 21, NULL, NULL),
	(169, 'Calendar', '/calendar', 'MdOutlineCalendarMonth', 6, 'true', 'page', 'true', 100, 1755492679, 1, 1765445825, 21, NULL, NULL),
	(173, 'Setting', NULL, NULL, 4, 'true', 'page', 'true', NULL, 1755812307, 1, 1765446072, 21, NULL, NULL),
	(174, 'Menu', '/menu', 'MdOutlineSettingsSuggest', 1, 'true', 'page', 'true', 173, 1755812408, 1, 1765446085, 21, NULL, NULL),
	(175, 'Role', '/role', 'MdOutlineManageAccounts', 2, 'true', 'page', 'true', 173, 1755812445, 1, 1765446094, 21, NULL, NULL),
	(176, 'All Tasks', '/task', 'MdOutlineChecklistRtl', 1, 'true', 'page', 'true', 101, 1755812546, 1, 1765445862, 21, NULL, NULL),
	(177, 'Overview', '/overview', 'MdDashboard', 1, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1755490131, 1, NULL, NULL),
	(178, 'Team Performance', '/team-performance', 'MdOutlineGroups2', 2, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1765445791, 21, NULL, NULL),
	(179, 'Task List', '/task-list', 'MdOutlineChecklistRtl', 3, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1765445905, 21, NULL, NULL),
	(180, 'Client Review', '/client-review', 'MdBusiness', 4, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1765445760, 21, NULL, NULL),
	(181, 'Ongoing Project', '/ongoing-project', 'MdOutlineWorkspaces', 5, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1765445680, 21, NULL, NULL),
	(182, 'Weekly Attendance', '/weekly-attendance', 'MdOutlineCalendarMonth', 6, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1765445829, 21, NULL, NULL),
	(183, 'Add Pitching', 'add_pitching', NULL, 1, 'false', 'button', 'true', 100, 1755812546, 1, 1755812546, 1, NULL, NULL),
	(184, 'Add Project', 'add_project', NULL, 1, 'false', 'button', 'true', 100, 1755812546, 1, 1755812546, 1, NULL, NULL),
	(185, 'Add Task', 'add_task', NULL, 1, 'false', 'button', 'true', 100, 1755812546, 1, 1755812546, 1, NULL, NULL),
	(186, 'HOD', '/task-hod', 'MdOutlineAdminPanelSettings', 2, 'true', 'page', 'true', 101, 1755812546, 1, 1765445875, 21, NULL, NULL),
	(187, 'Review', '/task-review', 'MdOutlineFactCheck', 3, 'true', 'page', 'true', 101, 1755812546, 1, 1765445893, 21, NULL, NULL),
	(188, 'User', '/user', 'MdOutlinePeopleAlt', 3, 'true', 'page', 'true', 100, 1755812546, 1, 1765445727, 21, NULL, NULL),
	(189, 'Website', NULL, NULL, 3, 'true', 'page', 'true', NULL, 1759904084, 1, 1765445921, 21, NULL, NULL),
	(190, 'Blog', '/website/blog', 'FaBlog', 1, 'true', 'page', 'true', 189, 1759904127, 1, 1759904127, 1, NULL, NULL),
	(191, 'Clients', '/website/clients', 'MdBusiness', 2, 'true', 'page', 'true', 189, 1759904159, 1, 1765445755, 21, NULL, NULL),
	(192, 'page', '/website/page', 'MdOutlineFolderCopy', 3, 'true', 'page', 'true', 189, 1759904184, 1, 1765445943, 21, NULL, NULL),
	(193, 'Project', '/website/project', 'MdOutlineWorkspaces', 4, 'true', 'page', 'true', 189, 1759904206, 1, 1765445676, 21, NULL, NULL),
	(194, 'Services', '/website/services', 'MdOutlineDvr', 15, 'true', 'page', 'true', 189, 1759904225, 1, 1765445982, 21, NULL, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
