-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table workload.website_blog
CREATE TABLE IF NOT EXISTS `website_blog` (
  `blog_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `category` json DEFAULT NULL,
  `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `meta_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `meta_keyword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`blog_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table workload.website_blog: ~5 rows (approximately)
DELETE FROM `website_blog`;
INSERT INTO `website_blog` (`blog_id`, `title`, `category`, `cover_url`, `description`, `meta_title`, `meta_description`, `meta_keyword`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
	(9, 'dawdaw', NULL, NULL, '<p>dawawdadw</p>', 'awdawdwd', 'awdawdawd', 'awddawawdawd', 1755682518, NULL, 1755682518, NULL, 1755682916, 1),
	(10, 'diki test', NULL, NULL, '<p>asdasdmasdk</p>', 'dawawdawd', 'awdawdawd', 'awdawdadw', 1755682906, NULL, 1755682906, NULL, 1756107233, 14),
	(11, '12 Blog Terbaik di Indonesia dalam Berbagai Macam Topik', NULL, '/uploads/avatar.jpg', '<p><em><strong>Catatan dari Mas Sugeng Januari 2020: Postingan ini dibuat 5 tahun yang lalu (tahun 2015). Daftar blog terbaik di bawah tidak diperbarui sejak awal postingan ini dipublikasikan.</strong></em></p>\n<p><em><strong>Setelah 5 tahun, tentunya saat ini sudah semakin banyak blog-blog baru yang bermunculan. Dan bukan tidak mungkin banyak blog-blog terbaik lainnya yang bermunculan yang tidak masuk dalam daftar blog terbaik di bawah ini.</strong></em></p>\n<p>Beberapa hari yang lalu saya iseng googling dengan kata kunci &ldquo;<strong>Blog Terbaik di Indonesia</strong>&ldquo;</p>', '12 Blog Terbaik di Indonesia dalam Berbagai Macam Topik', '12 Blog Terbaik di Indonesia dalam Berbagai Macam Topik', '12 Blog Terbaik di Indonesia dalam Berbagai Macam Topik', 1755785158, NULL, 1755785158, NULL, NULL, NULL),
	(12, 'diki', '["Mobile Application", "Website Development"]', '/uploads/Cuplikan layar 2025-08-07 160933.png', '<p>asdds</p>', 'adssd', 'asdsdsd', 'asdadsds', 1756107199, 14, 1756195714, 14, NULL, NULL),
	(13, 'terbaru', '["Social Media Management", "neww"]', '', '<p>dawawdawd</p>', 'addwwd', 'adwwdwd', 'awdadwawd', 1756111211, 14, 1756111211, 14, 1756194448, 14);

-- Dumping structure for table workload.website_client
CREATE TABLE IF NOT EXISTS `website_client` (
  `client_id` int NOT NULL AUTO_INCREMENT,
  `cover_url` varchar(50) DEFAULT NULL,
  `client_name` varchar(50) DEFAULT NULL,
  `meta_keyword` varchar(50) DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table workload.website_client: ~5 rows (approximately)
DELETE FROM `website_client`;
INSERT INTO `website_client` (`client_id`, `cover_url`, `client_name`, `meta_keyword`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
	(1, '/uploads/a259b13ad3df36027681210de6ab2ef5.png', 'Mundipharma', 'Mundipharma', 1755682906, NULL, 1755785430, NULL, NULL, NULL),
	(2, '', 'diki', 'dawdwawd', 1755685043, NULL, 1755685143, NULL, 1755685153, 1),
	(3, '/uploads/fe20866c98916c3fcbb088c5d34dde57.png', 'Clean & Clean', 'Clean & Clean', 1755785514, NULL, 1755785543, NULL, NULL, NULL),
	(4, '/uploads/Cuplikan layar 2025-08-11 154657.png', 'newww', 'adsdsasd', 1756107306, 14, 1756107306, 14, 1756107321, 14),
	(5, '', 'diki', 'awddaw', 1756194693, 14, 1756194712, 14, 1756194718, 14);

-- Dumping structure for table workload.website_page
CREATE TABLE IF NOT EXISTS `website_page` (
  `page_id` int NOT NULL AUTO_INCREMENT,
  `page_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `meta_description` varchar(255) DEFAULT NULL,
  `meta_keyword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`page_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table workload.website_page: ~5 rows (approximately)
DELETE FROM `website_page`;
INSERT INTO `website_page` (`page_id`, `page_name`, `description`, `meta_title`, `meta_description`, `meta_keyword`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
	(6, 'About Us', '<section class="container mt-first">\n<div class="row justify-content-between">\n<div class="col-sm-7 pt-sm-5">\n<div class="text-detail-page mb-5">\n<p>As a digital agency headquartered in Jakarta, we help your business to get closer to consumers through our outstanding work. Provision of the most professional of capabilities in every service we provide. Don\'t be late to update yourself with the latest trends in the digital age with us as we slowly soar to skies above!</p>\n</div>\n</div>\n</div>\n</section>\n<div class="bg-address py-5">\n<section class="container">\n<div class="row">\n<div class="col-sm-6 mb-4">&nbsp;</div>\n</div>\n</section>\n</div>', 'About Us\n', 'About Us\n', 'About Us\n', 1755786235, NULL, 1755786482, NULL, NULL, NULL),
	(7, 'Privacy Policy', '<p>We reserve the right to modify this Policy or its terms relating to the Website and Services from time to time in our discretion and will notify you of any material changes to the way in which we treat Personal Information. When we do, we will revise the updated date at the bottom of this page. We may also provide notice to you in other ways in our discretion, such as through contact information you have provided. Any updated version of this Policy will be effective immediately upon the posting of the revised Policy unless otherwise specified. Your continued use of the Website and Services after the effective date of the revised Policy (or such other act specified at that time) will constitute your consent to those changes. However, we will not, without your consent, use your Personal Information in a manner materially different than what was stated at the time your Personal Information was collected.&nbsp;</p>', 'Privacy Policy', 'Privacy Policy', 'Privacy Policy', 1755786515, NULL, 1755786563, NULL, NULL, NULL),
	(8, 'Terms & Conditions', '<p>Although the Website and Services may link to other resources (such as websites, mobile applications, etc.), we are not, directly or indirectly, implying any approval, association, sponsorship, endorsement, or affiliation with any linked resource, unless specifically stated herein. We are not responsible for examining or evaluating, and we do not warrant the offerings of, any businesses or individuals or the content of their resources. We do not assume any responsibility or liability for the actions, products, services, and content of any other third parties. You should carefully review the legal statements and other conditions of use of any resource which you access through a link on the Website and Services. Your linking to any other off-site resources is at your own risk.</p>', 'Terms & Conditions\n', 'Terms & Conditions\n', 'Terms & Conditions\n', 1755786581, NULL, 1755786581, NULL, NULL, NULL),
	(9, 'dawadw', '<p>adwawdawd</p>', 'awdawd', 'awdaw', 'adwwddw', 1756107363, 14, 1756107363, 14, 1756107378, 14),
	(10, 'asdsdas', '<p>asdds</p>', 'asd', 'dasasd', 'ads', 1756194801, 14, 1756194801, 14, 1756194809, 14);

-- Dumping structure for table workload.website_project
CREATE TABLE IF NOT EXISTS `website_project` (
  `project_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `category` json DEFAULT NULL,
  `year` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `meta_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `meta_keyword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`project_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table workload.website_project: ~6 rows (approximately)
DELETE FROM `website_project`;
INSERT INTO `website_project` (`project_id`, `title`, `category`, `year`, `description`, `cover_url`, `meta_title`, `meta_description`, `meta_keyword`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
	(17, 'Pharmaton (Video and Motion Graphic)', '["Social Media Management"]', '2020', '<h2>Photo and video production service. Implementing a concept and idea into a creative key visual.</h2>', '/uploads/road-sunset-car-city-buildings-scenery-digital-art-2k-wallpaper-uhdpaper.com-334@1@m.jpg', 'Pharmaton (Video and Motion Graphic)', 'Pharmaton (Video and Motion Graphic)', 'Pharmaton (Video and Motion Graphic)', 1756957946, 14, 1756957946, 14, NULL, NULL),
	(18, 'Sanofi (Video and Motion Graphic)', '["Social Media Management"]', '2020', '<div class="row mb-5">\n<div class="col-md-8">\n<div class="text-detail-page detail-project">\n<h2>Photo and video production service. Implementing a concept and idea into a creative key visual.</h2>\n</div>\n</div>\n</div>', '/uploads/sports-car-futuristic-mountain-sunset-scenery-digital-art-2k-wallpaper-uhdpaper.com-537@0@i.jpg', 'Photo and video production service. Implementing a concept and idea into a creative key visual.', 'Photo and video production service. Implementing a concept and idea into a creative key visual.', 'Photo and video production service. Implementing a concept and idea into a creative key visual.', 1756958031, 14, 1756958065, 14, NULL, NULL),
	(19, 'Sinarmas Land (Video and Motion Graphic)', '["Website Development"]', '2020', '<h2>Photo and video production service. Implementing a concept and idea into a creative key visual.</h2>', '/uploads/sukuna-itadori-jujutsu-kaisen-2k-wallpaper-uhdpaper.com-194@2@a.jpg', 'Photo and video production service. Implementing a concept and idea into a creative key visual.', 'Photo and video production service. Implementing a concept and idea into a creative key visual.', 'Photo and video production service. Implementing a concept and idea into a creative key visual.', 1756958105, 14, 1756958105, 14, NULL, NULL),
	(20, 'Cari Nama Bayi (Web Development)', '["Website Development"]', '2020', '<h2>Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications.&nbsp;</h2>', '/uploads/sunset-horizon-standing-alone-mountains-scenery-ai-art-2k-wallpaper-uhdpaper.com-715@1@l.jpg', 'Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications. ', 'Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications. ', 'Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications. ', 1756958162, 14, 1756958162, 14, NULL, NULL),
	(21, 'Nutriclub (Web Development)', '["Mobile Application"]', '2029', '<div class="row mb-5">\n<div class="col-md-8">\n<div class="text-detail-page detail-project">\n<h2>Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications.&nbsp;</h2>\n</div>\n</div>\n</div>', '/uploads/wallpaperflare.com_wallpaper (1).jpg', 'Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications. \n', 'Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications. \n', 'Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications. \n', 1756958192, 14, 1756958192, 14, NULL, NULL),
	(22, 'Lactamil (Web Development)', '["Mobile Application"]', '2023', '<div class="row mb-5">\n<div class="col-md-8">\n<div class="text-detail-page detail-project">\n<h2>Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications.&nbsp;</h2>\n</div>\n</div>\n</div>', '/uploads/anime-girl-countryside-scenery-2k-wallpaper-uhdpaper.com-187@3@a.jpg', 'Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications. \n', 'Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications. \n', 'Create Responsive Web Design, Custom Web Design, and Web Maintenance. Ready to take responsibility the coding, and layout of the website in accordance with company specifications. \n', 1756958219, 14, 1756958219, 14, NULL, NULL);

-- Dumping structure for table workload.website_service
CREATE TABLE IF NOT EXISTS `website_service` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text,
  `text_list` json DEFAULT NULL,
  `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table workload.website_service: ~6 rows (approximately)
DELETE FROM `website_service`;
INSERT INTO `website_service` (`service_id`, `created`, `created_by`, `deleted`, `deleted_by`, `updated`, `updated_by`, `title`, `subtitle`, `description`, `text_list`, `cover_url`) VALUES
	(3, 1755850850, NULL, NULL, NULL, 1755850850, NULL, 'Website Development', 'Responsible in determining the layout, design and coding on the website that will be built according to the company\'s specifications.', '<p>Today, web design is one of the most effective marketing and promotion tools. The target market can be determined by how the website works, the design, and understanding of the content by the user.</p>\n<p>A well-designed website will increase the impression and credibility of the company, so it will automatically increase the prospects of the goods or services on offer, as most people will find out in advance on the internet before they decide to make a purchase. In addition to being well designed, a website must also be easy to find in search engines (google) in order to reach the desired target audience.</p>', '["Responsive Web Design", "Custom Web Design", "Web Maintenance"]', '/uploads/Putih Coklat Minimalis Tasyakuran Aqiqah.png'),
	(4, 1756095760, NULL, NULL, NULL, 1756095760, NULL, 'Mobile Application', 'We are experts at creating, maintaining, and implementing code to develop mobile applications and programs using computer programming languages.', '<p>Build strong digital products and be able to compete with other partners. This modern age has changed the way we live and work as we move, we listen, design, develop, and help you launch great products.</p>\n<p>The development phase is where all previous product decisions, components, and assets come together. This includes mobile development, web parts and backend integration, even artificial intelligence and data science solutions if needed.</p>\n<p>We have the expertise to walk you through the entire process, from ideas to products launched, ready to please users and generate revenue.</p>', '["Cross-platform applications using React Native", "Native iOS & Android apps"]', '/uploads/Cuplikan layar 2025-08-22 090635.png'),
	(5, 1756097215, NULL, NULL, NULL, 1756097215, NULL, 'Social Media Management', 'Developing relevant content topics is our expertise. Create, curate, and manage all published content (images, videos, writing and audio/podcasts)', '<p>Social media is very powerful. This is the easiest way to see a place, peek at someone else\'s life, and even read someone\'s thoughts. Social media is an amazing way to build great brand relationships. However, there are no magic tricks or tools. Social media is hard. This requires a clear strategy based on a clear set of brand values, or more specifically your mission &amp; vision.</p>\n<p><br>And above all, it takes management, resources, and the right time to work. We are a social media agency to help you with this long-term investment. We provide services to harness the power of Social Media by providing social media management, strategy, media purchases, content creation and influencer marketing as well as campaigns to connect your business with your consumers on Social Media.</p>', '["Strategic", "Management", "Content Creation"]', '/uploads/Cuplikan layar 2025-08-09 060035.png'),
	(6, 1756097403, NULL, 1756105620, 14, 1756097403, NULL, 'adwdw', 'awdwd', '<p>wdawd</p>', '["wadawd"]', ''),
	(7, 1756097534, 14, 1756105549, 14, 1756105476, 14, 'diki', 'awddw', '<p>awd</p>', '["adwawd"]', ''),
	(8, 1756107525, 14, 1756194985, 14, 1756107525, 14, 'neww', 'awdwd', '<p>awdw</p>', '["awddw"]', '/uploads/Cuplikan layar 2025-08-09 062055.png');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
