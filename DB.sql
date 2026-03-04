-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 23, 2026 at 03:51 AM
-- Server version: 8.0.40
-- PHP Version: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `v2workload`
--

-- --------------------------------------------------------

--
-- Table structure for table `annual_assestment`
--

DROP TABLE IF EXISTS `annual_assestment`;
CREATE TABLE `annual_assestment` (
  `annual_assestment_id` bigint UNSIGNED NOT NULL,
  `period_from_year` smallint UNSIGNED NOT NULL,
  `period_to_year` smallint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NOT NULL,
  `hod_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('draft','submitted_by_staff','reviewed_by_hod','finalized') NOT NULL DEFAULT 'draft',
  `staff_payload_json` json NOT NULL,
  `hod_payload_json` json DEFAULT NULL,
  `staff_total_score` smallint UNSIGNED DEFAULT NULL,
  `hod_total_score` smallint UNSIGNED DEFAULT NULL,
  `staff_submitted_at` int UNSIGNED DEFAULT NULL,
  `hod_submitted_at` int UNSIGNED DEFAULT NULL,
  `finalized_at` int UNSIGNED DEFAULT NULL,
  `created` int UNSIGNED DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated` int UNSIGNED DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL,
  `questions_json` json DEFAULT NULL,
  `staff_answers_json` json DEFAULT NULL,
  `hod_answers_json` json DEFAULT NULL,
  `staff_average` decimal(4,2) DEFAULT NULL,
  `staff_grade` char(1) DEFAULT NULL,
  `hod_average` decimal(4,2) DEFAULT NULL,
  `hod_grade` char(1) DEFAULT NULL,
  `final_average` decimal(4,2) DEFAULT NULL,
  `final_grade` char(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `annual_assestment`
--

INSERT INTO `annual_assestment` (`annual_assestment_id`, `period_from_year`, `period_to_year`, `staff_id`, `hod_id`, `status`, `staff_payload_json`, `hod_payload_json`, `staff_total_score`, `hod_total_score`, `staff_submitted_at`, `hod_submitted_at`, `finalized_at`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`, `questions_json`, `staff_answers_json`, `hod_answers_json`, `staff_average`, `staff_grade`, `hod_average`, `hod_grade`, `final_average`, `final_grade`) VALUES
(1, 2024, 2025, 19, NULL, 'submitted_by_staff', '{\"answers\": {\"pers_dukungan\": {\"text\": \"\", \"value\": 3}, \"pers_komitmen\": {\"text\": \"\", \"value\": 4}, \"pers_motivasi\": {\"text\": \"\", \"value\": 3}, \"pers_semangat\": {\"text\": \"\", \"value\": 2}, \"prof_inisiatif\": {\"text\": \"\", \"value\": 3}, \"pers_daya_tahan\": {\"text\": \"\", \"value\": 2}, \"pers_integritas\": {\"text\": \"\", \"value\": 2}, \"pers_kompetensi\": {\"text\": \"\", \"value\": 3}, \"prof_pola_pikir\": {\"text\": \"\", \"value\": 2}, \"pers_ramah_sopan\": {\"text\": \"\", \"value\": 2}, \"pers_reliability\": {\"text\": \"\", \"value\": 4}, \"pers_rendah_hati\": {\"text\": \"\", \"value\": 3}, \"pers_trustworthy\": {\"text\": \"\", \"value\": 2}, \"prof_kreatifitas\": {\"text\": \"\", \"value\": 3}, \"dev_target_tujuan\": {\"note\": \"\", \"text\": \"fdfdf\"}, \"pers_flexibilitas\": {\"text\": \"\", \"value\": 2}, \"prof_kedisiplinan\": {\"text\": \"\", \"value\": 3}, \"prof_kepemimpinan\": {\"text\": \"\", \"value\": 3}, \"dev_pelatihan_nama\": {\"note\": \"\", \"text\": \"dsfjskfhd\"}, \"dev_pelatihan_jenis\": {\"note\": \"\", \"text\": \"fsfdsdfsdf\"}, \"prof_efektif_efisien\": {\"text\": \"\", \"value\": 3}, \"dev_pelatihan_periode\": {\"note\": \"\", \"text\": \"sfdsfdfss\"}, \"prof_pengaturan_waktu\": {\"text\": \"\", \"value\": 2}, \"prof_pengorganisasian\": {\"text\": \"\", \"value\": 2}, \"dev_saran_kritik_divisi\": {\"note\": \"\", \"text\": \"fdsfsdf\"}, \"prof_kemampuan_strategis\": {\"text\": \"\", \"value\": 2}, \"dev_harapan_jangka_pendek\": {\"note\": \"\", \"text\": \"Coba apanya\"}, \"dev_pencapaian_hard_skill\": {\"note\": \"\", \"text\": \"hdsiodhsid\"}, \"dev_pencapaian_soft_skill\": {\"note\": \"\", \"text\": \"fdfdsfdf\"}, \"prof_orientasi_pada_hasil\": {\"text\": \"\", \"value\": 2}, \"dev_harapan_jangka_panjang\": {\"note\": \"\", \"text\": \"hdsdosdh\"}, \"dev_catatan_tambahan_penilai\": {\"note\": \"\", \"text\": \"fdsfdsfsdf\"}, \"prof_kemampuan_berkomunikasi\": {\"text\": \"\", \"value\": 3}, \"dev_catatan_tambahan_karyawan\": {\"note\": \"\", \"text\": \"fdsfdsfsf\"}, \"dev_rencana_pencapaian_target\": {\"note\": \"\", \"text\": \"fdsfdsfsf\"}, \"prof_kualitas_dalam_pekerjaan\": {\"text\": \"\", \"value\": 3}, \"prof_pemahaman_tanggung_jawab\": {\"text\": \"\", \"value\": 3}, \"pers_perhatian_penerimaan_diri\": {\"text\": \"\", \"value\": 3}}}', NULL, 69, NULL, 1766039422, NULL, NULL, 1765885263, 19, 1766039422, 19, NULL, NULL, '[{\"title\": \"HARAPAN PRIBADI (JANGKA PENDEK – KURANG DARI 3 TAHUN)\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 27, \"description\": null, \"question_id\": 27, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_harapan_jangka_pendek\"}, {\"title\": \"HARAPAN PRIBADI (JANGKA PANJANG – LEBIH DARI 3 TAHUN)\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 28, \"description\": null, \"question_id\": 28, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_harapan_jangka_panjang\"}, {\"title\": \"PENCAPAIAN PENGEMBANGAN DIRI SAMPAI SAAT INI (HARD SKILL)\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 29, \"description\": null, \"question_id\": 29, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_pencapaian_hard_skill\"}, {\"title\": \"PENCAPAIAN PENGEMBANGAN DIRI SAMPAI SAAT INI (SOFT SKILL)\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 30, \"description\": null, \"question_id\": 30, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_pencapaian_soft_skill\"}, {\"title\": \"TARGET PENGEMBANGAN DIRI KEDEPAN (TARGET / TUJUAN YANG DITETAPKAN)\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 31, \"description\": null, \"question_id\": 31, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_target_tujuan\"}, {\"title\": \"RENCANA PENCAPAIAN TARGET\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 32, \"description\": null, \"question_id\": 32, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_rencana_pencapaian_target\"}, {\"title\": \"PELATIHAN YANG DIPERLUKAN (NAMA PELATIHAN)\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 33, \"description\": null, \"question_id\": 33, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_pelatihan_nama\"}, {\"title\": \"PELATIHAN YANG DIPERLUKAN (JENIS PELATIHAN)\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 34, \"description\": null, \"question_id\": 34, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_pelatihan_jenis\"}, {\"title\": \"PELATIHAN YANG DIPERLUKAN (PERIODE YANG DI JADWALKAN)\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 35, \"description\": null, \"question_id\": 35, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_pelatihan_periode\"}, {\"title\": \"CATATAN TAMBAHAN DARI KARYAWAN\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 36, \"description\": null, \"question_id\": 36, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_catatan_tambahan_karyawan\"}, {\"title\": \"SARAN DAN KRITIK UNTUK DIVISI\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 37, \"description\": null, \"question_id\": 37, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_saran_kritik_divisi\"}, {\"title\": \"CATATAN TAMBAHAN DARI PENILAI\", \"scale_max\": null, \"scale_min\": null, \"input_type\": \"textarea\", \"sort_order\": 38, \"description\": null, \"question_id\": 38, \"section_key\": \"development\", \"options_json\": null, \"question_key\": \"dev_catatan_tambahan_penilai\"}, {\"title\": \"INTEGRITAS\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 14, \"description\": \"Telah menunjukkan kemampuan dan kemauan untuk selalu menunjukkan kejujuran dan ketulusan ketika berhubungan dengan pekerjaan dan orang lain.\", \"question_id\": 14, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_integritas\"}, {\"title\": \"KOMITMEN\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 15, \"description\": \"Telah menunjukkan kemampuan dan kemauan untuk bertanggung jawab terhadap pekerjaan atau pengambilan keputusan.\", \"question_id\": 15, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_komitmen\"}, {\"title\": \"DAYA TAHAN\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 16, \"description\": \"Telah menunjukan kemampuan dan kemauan untuk menunjukkan daya tahan dalam menghadapi pekerjaan yang berat dan sulit. Tidak mudah menyerah dalam menghadapi segala tantangan pekerjaan.\", \"question_id\": 16, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_daya_tahan\"}, {\"title\": \"FLEXIBILITAS\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 17, \"description\": \"Telah menunjukkan kemampuan dan kemauan untuk bersikap fleksibel terhadap perubahan yang timbul. Mudah beradaptasi dan peningkatan dalam berbagai situasi.\", \"question_id\": 17, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_flexibilitas\"}, {\"title\": \"RENDAH HATI\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 18, \"description\": \"Telah menunjukkan kemampuan dan juga kemauan untuk bersikap rendah hati, tidak sombong atau tidak mudah puas dengan hasil yang di capai saat ini.\", \"question_id\": 18, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_rendah_hati\"}, {\"title\": \"SEMANGAT\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 19, \"description\": \"Telah menunjukkan semangat yang tinggi untuk terus berkembang dan tidak mudah puas dengan hasil kerja yang dicapai saat ini.\", \"question_id\": 19, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_semangat\"}, {\"title\": \"RAMAH DAN SOPAN\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 20, \"description\": \"Telah menunjukkan sikap yang ramah dan sopan terhadap pimpinan, rekan kerja dan juga pihak lainnya.\", \"question_id\": 20, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_ramah_sopan\"}, {\"title\": \"RELIABILITY / KEPERCAYAAN / KEANDALAN / DAPAT DIANDALKAN\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 21, \"description\": \"Telah menunjukan dapat dipercaya, konsisten, keandalan, kestabilan dan menunjukan hasil yang dapat dipercaya dan tidak bertentangan.\", \"question_id\": 21, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_reliability\"}, {\"title\": \"KOMPETENSI\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 22, \"description\": \"Telah menunjukan kinerja yang dapat diamati, terukur dan sangat penting terhadap aspek Pengetahuan, Pemahaman, Kemampuan dan Sikap untuk keberhasilan kinerja individu terhadap perusahaan.\", \"question_id\": 22, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_kompetensi\"}, {\"title\": \"TRUSWORTHY / DAPAT DIPERCAYA / TERPERCAYA\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 23, \"description\": \"Telah bekerja dengan baik untuk menjaga kepercayaan yang diberikan oleh perusahaan dan atasan langsung serta klien. Serta bersikap jujur dalam melakukan setiap tindakan.\", \"question_id\": 23, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_trustworthy\"}, {\"title\": \"PERHATIAN DAN PENERIMAAN DIRI\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 24, \"description\": \"Telah melakukan komunikasi dan menghargai pendapat mereka tentang suatu hal yang sedang dibicarakan. Mengetahui tentang diri sendiri dan posisinya, menghormati dan mengerti orang lain (Sub ordinate / Rekan kerja / Atasan / Bawahan).\", \"question_id\": 24, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_perhatian_penerimaan_diri\"}, {\"title\": \"DUKUNGAN\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 25, \"description\": \"Hubungan dengan orang lain yang diketahui kemampuannya dan percaya bahwa mereka memiliki kapabilitas yang dibutuhkan.\", \"question_id\": 25, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_dukungan\"}, {\"title\": \"MOTIVASI\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 26, \"description\": \"Motivasi ialah suatu proses yang menjelaskan intensitas, arah dan ketekunan individu agar dapat mencapai tujuannya.\", \"question_id\": 26, \"section_key\": \"personal\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"pers_motivasi\"}, {\"title\": \"PEMAHAMAN TANGGUNG JAWAB\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 1, \"description\": \"Telah memahami tanggung jawab tugasnya dengan baik dan benar.\", \"question_id\": 1, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_pemahaman_tanggung_jawab\"}, {\"title\": \"KUALITAS DALAM PEKERJAAN\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 2, \"description\": \"Telah menunjukkan kemampuan dan kemauan untuk selalu berusaha untuk mengutamakan hasil pekerjaan yang berkualitas serta meningkatkan mutu dalam bekerja.\", \"question_id\": 2, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_kualitas_dalam_pekerjaan\"}, {\"title\": \"KEMAMPUAN STRATEGIS\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 3, \"description\": \"Telah menunjukan kemampuan berpikir atau menganalisa dengan baik dan efektif terhadap suatu masalah. Termasuk dalam mengidentifikasi masalah untuk dapat diselesaikan dengan baik dan benar.\", \"question_id\": 3, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_kemampuan_strategis\"}, {\"title\": \"POLA PIKIR\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 4, \"description\": \"Telah menunjukan kemampuan dan kemauan untuk selalu berpikir maju dan kreatif dalam bekerja serta bersikap jujur dalam melakukan segala hal.\", \"question_id\": 4, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_pola_pikir\"}, {\"title\": \"KEPEMIMPINAN\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 5, \"description\": \"Telah menunjukan kemampuan untuk memimpin dan memotivasi bawahan, dapat menjadi contoh bagi rekan kerja dan juga melakukan pengarahan yang baik.\", \"question_id\": 5, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_kepemimpinan\"}, {\"title\": \"PENGATURAN WAKTU\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 6, \"description\": \"Telah mampu mengatur dan membagi waktu untuk mengerjakan pekerjaan sehingga semua pekerjaan dapat selesai dengan tepat, baik dan benar.\", \"question_id\": 6, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_pengaturan_waktu\"}, {\"title\": \"KEMAMPUAN BERKOMUNIKASI\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 7, \"description\": \"Telah menunjukkan kemampuan untuk mengkomunikasikan suatu masalah dan berbicara secara efektif baik kepada atasan, rekan kerja dan atau pihak lainnya.\", \"question_id\": 7, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_kemampuan_berkomunikasi\"}, {\"title\": \"KREATIFITAS\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 8, \"description\": \"Telah menunjukkan kemampuan untuk mengeluarkan hasil pemikiran yang kreatif kepada pemimpin dan juga dapat menerapkannya dengan baik.\", \"question_id\": 8, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_kreatifitas\"}, {\"title\": \"INISIATIF\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 9, \"description\": \"Telah menunjukkan kemampuan dalam memberikan alternatif solusi atas sebuah masalah dan dapat melihat suatu masalah dari berbagai sudut pertimbangan.\", \"question_id\": 9, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_inisiatif\"}, {\"title\": \"EFEKTIF & EFISIEN\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 10, \"description\": \"Telah menunjukkan usaha untuk bekerja secara efektif dan efisien. Termasuk dalam hal meminimalisasi biaya / kerugian (misal: penggunaan atau pemilihan barang dan pengeluaran biaya).\", \"question_id\": 10, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_efektif_efisien\"}, {\"title\": \"KEDISPLINAN\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 11, \"description\": \"Telah menunjukkan kemampuan berdisiplin selalu tepat waktu, taat dan menghormati struktur peraturan dan tata tertib Perusahaan, termasuk ketepatan waktu hadir/ kehadiran di tempat, dan penggunaan waktu kerja secara maksimal.\", \"question_id\": 11, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_kedisiplinan\"}, {\"title\": \"ORIENTASI PADA HASIL\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 12, \"description\": \"Telah menunjukan kemampuan dan pengertian untuk memahami tujuan / hasil akhir dengan baik.\", \"question_id\": 12, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_orientasi_pada_hasil\"}, {\"title\": \"PENGORGANISASIAN\", \"scale_max\": 5, \"scale_min\": 1, \"input_type\": \"rating\", \"sort_order\": 13, \"description\": \"Telah menunjukan kemampuan untuk mengelola pekerjaan dengan memanfaatkan sumber-sumber yang tersedia (orang, waktu, biaya, dan material) sehingga tercapainya tujuan Perusahaan yang telah disepakati dan Membantu dalam menjalin kerjasama dengan pihak lain demi kepentingan Perusahaan, membuka diri terhadap kritik dan saran.\", \"question_id\": 13, \"section_key\": \"professional\", \"options_json\": [{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}], \"question_key\": \"prof_pengorganisasian\"}]', '{\"pers_dukungan\": {\"text\": \"\", \"value\": 3}, \"pers_komitmen\": {\"text\": \"\", \"value\": 4}, \"pers_motivasi\": {\"text\": \"\", \"value\": 3}, \"pers_semangat\": {\"text\": \"\", \"value\": 2}, \"prof_inisiatif\": {\"text\": \"\", \"value\": 3}, \"pers_daya_tahan\": {\"text\": \"\", \"value\": 2}, \"pers_integritas\": {\"text\": \"\", \"value\": 2}, \"pers_kompetensi\": {\"text\": \"\", \"value\": 3}, \"prof_pola_pikir\": {\"text\": \"\", \"value\": 2}, \"pers_ramah_sopan\": {\"text\": \"\", \"value\": 2}, \"pers_reliability\": {\"text\": \"\", \"value\": 4}, \"pers_rendah_hati\": {\"text\": \"\", \"value\": 3}, \"pers_trustworthy\": {\"text\": \"\", \"value\": 2}, \"prof_kreatifitas\": {\"text\": \"\", \"value\": 3}, \"dev_target_tujuan\": {\"note\": \"\", \"text\": \"fdfdf\"}, \"pers_flexibilitas\": {\"text\": \"\", \"value\": 2}, \"prof_kedisiplinan\": {\"text\": \"\", \"value\": 3}, \"prof_kepemimpinan\": {\"text\": \"\", \"value\": 3}, \"dev_pelatihan_nama\": {\"note\": \"\", \"text\": \"dsfjskfhd\"}, \"dev_pelatihan_jenis\": {\"note\": \"\", \"text\": \"fsfdsdfsdf\"}, \"prof_efektif_efisien\": {\"text\": \"\", \"value\": 3}, \"dev_pelatihan_periode\": {\"note\": \"\", \"text\": \"sfdsfdfss\"}, \"prof_pengaturan_waktu\": {\"text\": \"\", \"value\": 2}, \"prof_pengorganisasian\": {\"text\": \"\", \"value\": 2}, \"dev_saran_kritik_divisi\": {\"note\": \"\", \"text\": \"fdsfsdf\"}, \"prof_kemampuan_strategis\": {\"text\": \"\", \"value\": 2}, \"dev_harapan_jangka_pendek\": {\"note\": \"\", \"text\": \"Coba apanya\"}, \"dev_pencapaian_hard_skill\": {\"note\": \"\", \"text\": \"hdsiodhsid\"}, \"dev_pencapaian_soft_skill\": {\"note\": \"\", \"text\": \"fdfdsfdf\"}, \"prof_orientasi_pada_hasil\": {\"text\": \"\", \"value\": 2}, \"dev_harapan_jangka_panjang\": {\"note\": \"\", \"text\": \"hdsdosdh\"}, \"dev_catatan_tambahan_penilai\": {\"note\": \"\", \"text\": \"fdsfdsfsdf\"}, \"prof_kemampuan_berkomunikasi\": {\"text\": \"\", \"value\": 3}, \"dev_catatan_tambahan_karyawan\": {\"note\": \"\", \"text\": \"fdsfdsfsf\"}, \"dev_rencana_pencapaian_target\": {\"note\": \"\", \"text\": \"fdsfdsfsf\"}, \"prof_kualitas_dalam_pekerjaan\": {\"text\": \"\", \"value\": 3}, \"prof_pemahaman_tanggung_jawab\": {\"text\": \"\", \"value\": 3}, \"pers_perhatian_penerimaan_diri\": {\"text\": \"\", \"value\": 3}}', NULL, 2.65, 'C', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `appraisal`
--

DROP TABLE IF EXISTS `appraisal`;
CREATE TABLE `appraisal` (
  `appraisal_id` bigint UNSIGNED NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(180) DEFAULT NULL,
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `submitted_at` int DEFAULT NULL,
  `status` enum('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
  `current_step` enum('staff','hod','hrd','director','done') NOT NULL DEFAULT 'staff',
  `staff_snapshot_json` json NOT NULL,
  `employment_snapshot_json` json DEFAULT NULL,
  `rating_scale_json` json NOT NULL,
  `questions_json` json NOT NULL,
  `answers_json` json NOT NULL,
  `total_score` decimal(10,2) NOT NULL DEFAULT '0.00',
  `average_score` decimal(10,3) NOT NULL DEFAULT '0.000',
  `grade` char(1) DEFAULT NULL,
  `scoring_json` json DEFAULT NULL,
  `approvals_json` json DEFAULT NULL,
  `general_comment` text,
  `created` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `appraisal`
--

INSERT INTO `appraisal` (`appraisal_id`, `user_id`, `title`, `period_start`, `period_end`, `submitted_at`, `status`, `current_step`, `staff_snapshot_json`, `employment_snapshot_json`, `rating_scale_json`, `questions_json`, `answers_json`, `total_score`, `average_score`, `grade`, `scoring_json`, `approvals_json`, `general_comment`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(1, 19, 'Performance Appraisal (Probation Period)', NULL, NULL, NULL, 'draft', 'staff', '{\"email\": \"bayu@vp-digital.com\", \"phone\": \"0822468117\", \"user_id\": 19, \"fullname\": \"Bayu Nugroho\", \"user_type\": \"staff\", \"job_position\": \"Backend Developer 2\", \"department_id\": null}', '{\"user_type\": \"staff\", \"employment\": {\"type\": \"staff\", \"notes\": null, \"created\": 1761546065, \"deleted\": null, \"updated\": 1761546065, \"user_id\": 19, \"end_date\": null, \"created_by\": 1, \"start_date\": 1761546065, \"salary_json\": null, \"employment_id\": 2, \"contract_number\": null, \"duration_months\": null, \"evaluation_notes\": null, \"recommended_status\": null}, \"after_status\": null, \"before_status\": \"Baru Masuk\"}', '{\"1\": \"Tidak Memuaskan\", \"2\": \"Kurang Memuaskan\", \"3\": \"Cukup Memuaskan\", \"4\": \"Memuaskan\", \"5\": \"Sangat Memuaskan\"}', '[{\"title\": \"TARGET ACHIEVEMENT\", \"sort_order\": 1, \"description\": \"Kemampuan untuk mencapai target kerja yang telah ditetapkan\", \"question_id\": 1, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"STRATEGIC CAPABILITIES\", \"sort_order\": 2, \"description\": \"Telah menunjukkan kemampuan berfikir analitis dan strategis, memiliki dan menangani masalah/ isu dengan cara yang paling efektif.\", \"question_id\": 2, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"QUALITY DRIVEN ATTITUDE\", \"sort_order\": 3, \"description\": \"Telah menunjukkan sikap, kehadiran dan perilaku yang berkualitas pada setiap proses kerja.\", \"question_id\": 3, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"JOB EXELLENCE\", \"sort_order\": 4, \"description\": \"Telah menunjukkan kemampuan dan kemauan untuk melaksanakan tugas sesuai standart keterampilan yang ditetapkan, memperhatikan setiap detail dan memastikan kualitas yang dihasilkan sesuai dengan standart.\", \"question_id\": 4, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"TEAMWORK AND COOPERATION\", \"sort_order\": 5, \"description\": \"Telah menunjukkan kemampuan dan kemauan menjadi Team Kerja. Dapat bekerja dalam Team dan mau bekerja sama dengan yang lain.\", \"question_id\": 5, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"PROBLEM SOLVING AND DECISION MAKING\", \"sort_order\": 6, \"description\": \"Telah menunjukkan kemampuan untuk memecahkan masalah dan melihat berbagai pertimbangan dalam mengambil keputusan.\", \"question_id\": 6, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"PASSIONATE\", \"sort_order\": 7, \"description\": \"Menunjukkan kemajuan perolehan pengetahuan dalam waktu tertentu (Knowledge), kemampuan dan kemauan dalam menerapkan cara untuk mendukung diri dalam proses kerja agar lebih efektif dan efisien (Innovatif), kemampuan dan kemauan untuk mencapai hasil terbaik dalam setiap usaha (Achievement).\", \"question_id\": 7, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"COMMITMENT\", \"sort_order\": 8, \"description\": \"Telah menunjukkan kemampuan dan kemauan untuk bertanggungjawab terhadap pekerjaan/ pengambilan keputusan.\", \"question_id\": 8, \"master_title\": \"Performance Appraisal (Probation Period)\"}]', '{\"1\": {\"note\": \"\", \"value\": 2}, \"2\": {\"note\": \"\", \"value\": 2}, \"3\": {\"note\": \"\", \"value\": null}, \"4\": {\"note\": \"\", \"value\": null}, \"5\": {\"note\": \"\", \"value\": null}, \"6\": {\"note\": \"\", \"value\": null}, \"7\": {\"note\": \"\", \"value\": null}, \"8\": {\"note\": \"\", \"value\": null}}', 4.00, 0.500, 'E', '{\"note\": null, \"rule\": {\"A\": 4.1, \"B\": 3, \"C\": 2, \"D\": 1.1, \"E\": 0}, \"grade\": \"E\", \"total_score\": 4, \"average_score\": 0.5, \"answered_count\": 2, \"question_count\": 8}', NULL, '', 1766400484, 19, 1766400523, 19, NULL, NULL),
(2, 20, 'Performance Appraisal (Probation Period)', NULL, NULL, 1766401280, 'approved', 'done', '{\"email\": \"seto@vp-digital.com\", \"phone\": \"08563171799\", \"user_id\": 20, \"fullname\": \"Seto Enggar (VP Digital)\", \"user_type\": \"staff\", \"job_position\": \"Direktur Operasional\", \"department_id\": null}', '{\"user_type\": \"staff\", \"employment\": null, \"after_status\": \"Diangkat Karyawan Tetap\", \"before_status\": \"Diangkat Karyawan Kontrak\"}', '{\"1\": \"Tidak Memuaskan\", \"2\": \"Kurang Memuaskan\", \"3\": \"Cukup Memuaskan\", \"4\": \"Memuaskan\", \"5\": \"Sangat Memuaskan\"}', '[{\"title\": \"TARGET ACHIEVEMENT\", \"sort_order\": 1, \"description\": \"Kemampuan untuk mencapai target kerja yang telah ditetapkan\", \"question_id\": 1, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"STRATEGIC CAPABILITIES\", \"sort_order\": 2, \"description\": \"Telah menunjukkan kemampuan berfikir analitis dan strategis, memiliki dan menangani masalah/ isu dengan cara yang paling efektif.\", \"question_id\": 2, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"QUALITY DRIVEN ATTITUDE\", \"sort_order\": 3, \"description\": \"Telah menunjukkan sikap, kehadiran dan perilaku yang berkualitas pada setiap proses kerja.\", \"question_id\": 3, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"JOB EXELLENCE\", \"sort_order\": 4, \"description\": \"Telah menunjukkan kemampuan dan kemauan untuk melaksanakan tugas sesuai standart keterampilan yang ditetapkan, memperhatikan setiap detail dan memastikan kualitas yang dihasilkan sesuai dengan standart.\", \"question_id\": 4, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"TEAMWORK AND COOPERATION\", \"sort_order\": 5, \"description\": \"Telah menunjukkan kemampuan dan kemauan menjadi Team Kerja. Dapat bekerja dalam Team dan mau bekerja sama dengan yang lain.\", \"question_id\": 5, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"PROBLEM SOLVING AND DECISION MAKING\", \"sort_order\": 6, \"description\": \"Telah menunjukkan kemampuan untuk memecahkan masalah dan melihat berbagai pertimbangan dalam mengambil keputusan.\", \"question_id\": 6, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"PASSIONATE\", \"sort_order\": 7, \"description\": \"Menunjukkan kemajuan perolehan pengetahuan dalam waktu tertentu (Knowledge), kemampuan dan kemauan dalam menerapkan cara untuk mendukung diri dalam proses kerja agar lebih efektif dan efisien (Innovatif), kemampuan dan kemauan untuk mencapai hasil terbaik dalam setiap usaha (Achievement).\", \"question_id\": 7, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"COMMITMENT\", \"sort_order\": 8, \"description\": \"Telah menunjukkan kemampuan dan kemauan untuk bertanggungjawab terhadap pekerjaan/ pengambilan keputusan.\", \"question_id\": 8, \"master_title\": \"Performance Appraisal (Probation Period)\"}]', '{\"1\": {\"note\": \"Test\", \"value\": 2}, \"2\": {\"note\": \"saksl \", \"value\": 3}, \"3\": {\"note\": \"\", \"value\": 2}, \"4\": {\"note\": \"\", \"value\": 3}, \"5\": {\"note\": \"\", \"value\": 3}, \"6\": {\"note\": \"\", \"value\": 2}, \"7\": {\"note\": \"\", \"value\": 3}, \"8\": {\"note\": \"\", \"value\": 2}}', 20.00, 2.500, 'C', '{\"note\": null, \"rule\": {\"A\": 4.1, \"B\": 3, \"C\": 2, \"D\": 1.1, \"E\": 0}, \"grade\": \"C\", \"total_score\": 20, \"average_score\": 2.5, \"answered_count\": 8, \"question_count\": 8}', NULL, 'ghjskdsd', 1766401191, 19, 1766557748, 19, NULL, NULL),
(3, 20, 'Performance Appraisal (Probation Period)', NULL, NULL, NULL, 'draft', 'staff', '{\"email\": \"seto@vp-digital.com\", \"phone\": \"08563171799\", \"user_id\": 20, \"fullname\": \"Seto Enggar (VP Digital)\", \"user_type\": \"staff\", \"job_position\": \"Direktur Operasional\", \"department_id\": null}', '{\"user_type\": \"staff\", \"employment\": null, \"after_status\": null, \"before_status\": null}', '{\"1\": \"Tidak Memuaskan\", \"2\": \"Kurang Memuaskan\", \"3\": \"Cukup Memuaskan\", \"4\": \"Memuaskan\", \"5\": \"Sangat Memuaskan\"}', '[{\"title\": \"TARGET ACHIEVEMENT\", \"sort_order\": 1, \"description\": \"Kemampuan untuk mencapai target kerja yang telah ditetapkan\", \"question_id\": 1, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"STRATEGIC CAPABILITIES\", \"sort_order\": 2, \"description\": \"Telah menunjukkan kemampuan berfikir analitis dan strategis, memiliki dan menangani masalah/ isu dengan cara yang paling efektif.\", \"question_id\": 2, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"QUALITY DRIVEN ATTITUDE\", \"sort_order\": 3, \"description\": \"Telah menunjukkan sikap, kehadiran dan perilaku yang berkualitas pada setiap proses kerja.\", \"question_id\": 3, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"JOB EXELLENCE\", \"sort_order\": 4, \"description\": \"Telah menunjukkan kemampuan dan kemauan untuk melaksanakan tugas sesuai standart keterampilan yang ditetapkan, memperhatikan setiap detail dan memastikan kualitas yang dihasilkan sesuai dengan standart.\", \"question_id\": 4, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"TEAMWORK AND COOPERATION\", \"sort_order\": 5, \"description\": \"Telah menunjukkan kemampuan dan kemauan menjadi Team Kerja. Dapat bekerja dalam Team dan mau bekerja sama dengan yang lain.\", \"question_id\": 5, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"PROBLEM SOLVING AND DECISION MAKING\", \"sort_order\": 6, \"description\": \"Telah menunjukkan kemampuan untuk memecahkan masalah dan melihat berbagai pertimbangan dalam mengambil keputusan.\", \"question_id\": 6, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"PASSIONATE\", \"sort_order\": 7, \"description\": \"Menunjukkan kemajuan perolehan pengetahuan dalam waktu tertentu (Knowledge), kemampuan dan kemauan dalam menerapkan cara untuk mendukung diri dalam proses kerja agar lebih efektif dan efisien (Innovatif), kemampuan dan kemauan untuk mencapai hasil terbaik dalam setiap usaha (Achievement).\", \"question_id\": 7, \"master_title\": \"Performance Appraisal (Probation Period)\"}, {\"title\": \"COMMITMENT\", \"sort_order\": 8, \"description\": \"Telah menunjukkan kemampuan dan kemauan untuk bertanggungjawab terhadap pekerjaan/ pengambilan keputusan.\", \"question_id\": 8, \"master_title\": \"Performance Appraisal (Probation Period)\"}]', '{\"1\": {\"note\": \"\", \"value\": null}, \"2\": {\"note\": \"\", \"value\": null}, \"3\": {\"note\": \"\", \"value\": null}, \"4\": {\"note\": \"\", \"value\": null}, \"5\": {\"note\": \"\", \"value\": null}, \"6\": {\"note\": \"\", \"value\": null}, \"7\": {\"note\": \"\", \"value\": null}, \"8\": {\"note\": \"\", \"value\": null}}', 0.00, 0.000, 'E', '{\"note\": null, \"rule\": {\"A\": 4.1, \"B\": 3, \"C\": 2, \"D\": 1.1, \"E\": 0}, \"grade\": \"E\", \"total_score\": 0, \"average_score\": 0}', NULL, NULL, 1766401281, 19, 1766401281, 19, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `attendance_id` int NOT NULL,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `clock_in` int DEFAULT NULL,
  `clock_out` int DEFAULT NULL,
  `status` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'absent',
  `late_reason` text,
  `minutes_late` int DEFAULT '0',
  `notes` text,
  `location_latitude` decimal(10,7) DEFAULT NULL,
  `location_longitude` decimal(10,7) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` text,
  `timesheet` enum('true','false') DEFAULT NULL,
  `created` int NOT NULL,
  `created_by` int NOT NULL DEFAULT (0),
  `updated` int NOT NULL,
  `updated_by` int NOT NULL DEFAULT (0),
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `user_id`, `date`, `clock_in`, `clock_out`, `status`, `late_reason`, `minutes_late`, `notes`, `location_latitude`, `location_longitude`, `ip_address`, `device_info`, `timesheet`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(43, 25, '2025-10-27', 1761546194, NULL, 'late', 'mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules mules ', 233, NULL, NULL, NULL, NULL, NULL, 'true', 1761546194, 25, 1761554003, 25, NULL, NULL),
(46, 20, '2025-12-09', 1765254518, NULL, 'present', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 1765254518, 20, 1765254518, 20, NULL, NULL),
(47, 20, '2025-12-11', 1765441293, NULL, 'present', NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, 1765441293, 20, 1765441293, 20, NULL, NULL),
(57, 25, '2026-02-10', 1770694560, NULL, 'present', NULL, 0, NULL, NULL, NULL, NULL, NULL, 'true', 1770780977, 25, 1770780977, 25, NULL, NULL),
(59, 29, '2026-02-10', 1770714180, NULL, 'present', NULL, 0, NULL, NULL, NULL, NULL, NULL, 'true', 1770800609, 29, 1770800609, 29, NULL, NULL),
(60, 29, '2026-02-11', 1770801960, NULL, 'present', NULL, 0, NULL, NULL, NULL, NULL, NULL, 'true', 1770801987, 29, 1770802036, 29, NULL, NULL),
(61, 30, '2026-02-10', 1770719040, NULL, 'present', NULL, 0, NULL, NULL, NULL, NULL, NULL, 'true', 1770805466, 30, 1770805466, 30, NULL, NULL),
(62, 30, '2026-02-11', 1770785460, NULL, 'present', NULL, 0, NULL, NULL, NULL, NULL, NULL, 'true', 1770871903, 30, 1770871903, 30, NULL, NULL),
(63, 30, '2026-02-12', 1770866400, NULL, 'present', NULL, 0, NULL, NULL, NULL, NULL, NULL, 'true', 1770952841, 30, 1770952841, 30, NULL, NULL),
(64, 30, '2026-02-17', 1771296900, NULL, 'present', NULL, 0, NULL, NULL, NULL, NULL, NULL, 'true', 1771383321, 30, 1771383321, 30, NULL, NULL),
(65, 30, '2026-02-20', 1771551540, NULL, 'present', NULL, 0, NULL, NULL, NULL, NULL, NULL, 'true', 1771810773, 30, 1771810773, 30, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance_config`
--

DROP TABLE IF EXISTS `attendance_config`;
CREATE TABLE `attendance_config` (
  `id` bigint UNSIGNED NOT NULL,
  `label` varchar(100) NOT NULL,
  `ip` varchar(64) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `note` text,
  `created` int UNSIGNED NOT NULL,
  `created_by` bigint NOT NULL,
  `updated` int UNSIGNED NOT NULL,
  `updated_by` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `attendance_config`
--

INSERT INTO `attendance_config` (`id`, `label`, `ip`, `active`, `note`, `created`, `created_by`, `updated`, `updated_by`) VALUES
(1, 'HQ Jakarta', '103.10.20.0/24', 1, 'WAN kantor utama', 1759453913, 1, 1759453913, 1),
(2, 'Backup HQ', '103.10.21.45', 1, 'IP failover', 1759453913, 1, 1759453913, 1),
(3, 'Surabaya', '36.80.12.0/24', 1, 'Cabang SBY', 1759453913, 1, 1759453913, 1),
(4, 'IPv6 Test', '2406:da1a::/48', 1, 'IPv6 kantor', 1759453913, 1, 1759453913, 1);

-- --------------------------------------------------------

--
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
CREATE TABLE `brand` (
  `brand_id` int NOT NULL,
  `title` varchar(50) NOT NULL DEFAULT '',
  `created` int NOT NULL DEFAULT (0),
  `created_by` int NOT NULL DEFAULT (0),
  `updated` int NOT NULL DEFAULT (0),
  `updated_by` int NOT NULL DEFAULT (0),
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `brand`
--

INSERT INTO `brand` (`brand_id`, `title`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(8, 'Brand 2', 1754300302, 13, 1754300302, 13, NULL, NULL),
(9, 'Brand 4', 1754367392, 13, 1754367392, 13, NULL, NULL),
(10, 'brand 3', 1755760643, 13, 1755760643, 13, NULL, NULL),
(11, 'Brand A', 1758660071, 19, 1758660071, 19, NULL, NULL),
(12, 'CDE Tawar', 1761546346, 25, 1761546346, 25, NULL, NULL),
(13, 'Yayasan Kanker Indonesia', 1770799387, 27, 1770799387, 27, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `calendar_event`
--

DROP TABLE IF EXISTS `calendar_event`;
CREATE TABLE `calendar_event` (
  `event_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `start_at` int NOT NULL,
  `end_at` int NOT NULL,
  `color` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `deleted` int DEFAULT NULL,
  `created` int NOT NULL,
  `updated` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `calendar_event`
--

INSERT INTO `calendar_event` (`event_id`, `user_id`, `title`, `description`, `start_at`, `end_at`, `color`, `is_public`, `deleted`, `created`, `updated`) VALUES
(1, 29, 'Testing', 'kdjawkl jkldajw lkjaw kljdaw kl', 1770775200, 1770778800, '#14AE5C', 0, NULL, 1770802308, 1770802308);

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE `client` (
  `client_id` int NOT NULL,
  `uuid` varchar(50) DEFAULT NULL,
  `type` enum('PT','CV','UNOFFICIAL') NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `brand` json DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `pic_name` varchar(255) NOT NULL,
  `pic_phone` varchar(255) NOT NULL,
  `pic_email` varchar(255) NOT NULL,
  `finance_name` varchar(255) DEFAULT NULL,
  `finance_phone` varchar(255) DEFAULT NULL,
  `finance_email` varchar(255) DEFAULT NULL,
  `division` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `assign_to` int DEFAULT NULL,
  `leadsource_id` int UNSIGNED DEFAULT NULL,
  `teams` json DEFAULT NULL,
  `created` int NOT NULL DEFAULT (0),
  `created_by` int NOT NULL DEFAULT (0),
  `updated` int NOT NULL DEFAULT (0),
  `updated_by` int NOT NULL DEFAULT (0),
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `client_type` enum('leads','customer') NOT NULL DEFAULT 'leads',
  `lead_status` enum('new','validate','lost','won') DEFAULT NULL,
  `contacted` int DEFAULT NULL,
  `won` int DEFAULT NULL,
  `lost` int DEFAULT NULL,
  `follow_up` int DEFAULT NULL,
  `leadstatus_id` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`client_id`, `uuid`, `type`, `client_name`, `brand`, `address`, `pic_name`, `pic_phone`, `pic_email`, `finance_name`, `finance_phone`, `finance_email`, `division`, `assign_to`, `leadsource_id`, `teams`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`, `client_type`, `lead_status`, `contacted`, `won`, `lost`, `follow_up`, `leadstatus_id`) VALUES
(51, NULL, 'PT', 'sony music', '[]', 'dawd awd aw dawd a w', 'kinta', '+62645646454', 'kinta@hotmail.com', 'ayase', '+62534534534', 'ayase@hotmail.com', 'it', NULL, NULL, NULL, 1770796400, 28, 1770976907, 30, NULL, NULL, 'customer', 'validate', 1770976348, NULL, NULL, 1770836520, NULL),
(52, NULL, 'PT', 'sony music', '[]', 'dawd awd aw dawd a w', 'kinta', '+62645646454', 'kinta@hotmail.com', 'ayase', '+62534534534', 'ayase@hotmail.com', 'it', 27, NULL, NULL, 1770796406, 28, 1771398332, 30, NULL, NULL, 'leads', NULL, NULL, NULL, NULL, NULL, NULL),
(53, NULL, 'CV', 'sony music store', '[{\"title\": \"Brand 4\", \"brand_id\": 9}, {\"title\": \"brand 3\", \"brand_id\": 10}]', 'awddawadw', 'dwadawdawd', '+6208549459', 'dasdakmdas@hotmail.com', 'awdawd', '+620695969595', 'mmm@hotmail.com', 'it', 27, NULL, NULL, 1770798234, 29, 1771383652, 30, NULL, NULL, 'leads', NULL, NULL, NULL, NULL, NULL, NULL),
(54, NULL, 'CV', 'sony music', '[]', 'jl jakarta barat no.2002', 'sony', '+6298549358034', 'sony@hotmail.com', 'jessy', '+6287667677', 'jessy@hotmail.com', 'it', NULL, NULL, NULL, 1770799339, 29, 1770799339, 29, NULL, NULL, 'leads', NULL, NULL, NULL, NULL, NULL, NULL),
(55, NULL, 'CV', 'sony music', '[]', 'jl jakarta barat no.2002', 'sony', '+6298549358034', 'sony@hotmail.com', 'jessy', '+6287667677', 'jessy@hotmail.com', 'it', NULL, NULL, NULL, 1770799360, 29, 1770799360, 29, NULL, NULL, 'leads', NULL, NULL, NULL, NULL, NULL, NULL),
(56, NULL, 'PT', 'Yayasan Kanker Indonesia', '[{\"title\": \"brand 3\", \"brand_id\": 10}]', 'Jl. Dr. GSSJ Ratulangi No.35 2, RT.2/RW.3, Gondangdia, Kec. Menteng, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10350', 'Vivien Kusumowardhani', '+62816800338', 'veekay@indo.net.id', 'Pratiwi', '+62811894458', 'pratiwi.yki@gmail.com', 'Hubungan Masyarakat', 27, NULL, NULL, 1770799943, 27, 1771385273, 30, NULL, NULL, 'leads', 'validate', NULL, NULL, NULL, 1770930000, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `client_activity`
--

DROP TABLE IF EXISTS `client_activity`;
CREATE TABLE `client_activity` (
  `activity_id` int NOT NULL,
  `client_id` int NOT NULL,
  `type` enum('note','file') NOT NULL DEFAULT 'note',
  `note` text,
  `file_name` varchar(255) DEFAULT NULL,
  `real_filename` varchar(255) DEFAULT NULL,
  `filetype` varchar(120) DEFAULT NULL,
  `created` int NOT NULL,
  `created_by` int NOT NULL,
  `updated` int NOT NULL,
  `updated_by` int NOT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `client_activity`
--

INSERT INTO `client_activity` (`activity_id`, `client_id`, `type`, `note`, `file_name`, `real_filename`, `filetype`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(1, 51, 'note', 'halo', NULL, NULL, NULL, 1770974342, 30, 1770974342, 30, NULL, NULL),
(2, 51, 'file', NULL, '1770976670098-a3bb61abf6a4-doc-api-call-smart-pbx-pt-global-motion-ventures-2026-1.pdf', 'Doc API Call_Smart PBX - PT. Global Motion Ventures 2026 (1).pdf', 'application/pdf', 1770976670, 30, 1770976670, 30, NULL, NULL),
(3, 52, 'note', 'testdd', NULL, NULL, NULL, 1771396949, 30, 1771398316, 30, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `client_assign_history`
--

DROP TABLE IF EXISTS `client_assign_history`;
CREATE TABLE `client_assign_history` (
  `assign_history_id` int UNSIGNED NOT NULL,
  `client_id` int UNSIGNED NOT NULL,
  `from_assign_to` int UNSIGNED DEFAULT NULL,
  `to_assign_to` int UNSIGNED DEFAULT NULL,
  `assigned_at` int NOT NULL,
  `moved_at` int DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client_assign_history`
--

INSERT INTO `client_assign_history` (`assign_history_id`, `client_id`, `from_assign_to`, `to_assign_to`, `assigned_at`, `moved_at`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(1, 53, NULL, 27, 1771383652, NULL, 1771383652, 30, 1771383652, 30, NULL, NULL),
(2, 56, NULL, 27, 1771385273, NULL, 1771385273, 30, 1771385273, 30, NULL, NULL),
(4, 52, NULL, 27, 1771398332, NULL, 1771398332, 30, 1771398332, 30, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `client_leadstatus_history`
--

DROP TABLE IF EXISTS `client_leadstatus_history`;
CREATE TABLE `client_leadstatus_history` (
  `leadstatus_history_id` int UNSIGNED NOT NULL,
  `client_id` int UNSIGNED NOT NULL,
  `from_leadstatus_id` int UNSIGNED DEFAULT NULL,
  `to_leadstatus_id` int UNSIGNED DEFAULT NULL,
  `changed_at` int NOT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `countrycode`
--

DROP TABLE IF EXISTS `countrycode`;
CREATE TABLE `countrycode` (
  `countrycode_id` int UNSIGNED NOT NULL,
  `title` varchar(100) NOT NULL,
  `code` varchar(10) NOT NULL,
  `iso` varchar(100) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `countrycode`
--

INSERT INTO `countrycode` (`countrycode_id`, `title`, `code`, `iso`, `updated`) VALUES
(1, 'Albania', '+355', 'AL / ALB', '2023-03-28 20:11:45'),
(2, 'Algeria', '+213', 'DZ / DZA', '2023-03-28 20:11:45'),
(3, 'American Samoa', '+1684', 'AS / ASM', '2023-03-28 20:11:45'),
(4, 'Andorra', '+376', 'AD / AND', '2023-03-28 20:11:45'),
(5, 'Angola', '+244', 'AO / AGO', '2023-03-28 20:11:45'),
(6, 'Anguilla', '+1264', 'AI / AIA', '2023-03-28 20:11:45'),
(7, 'Antarctica', '+672', 'AQ / ATA', '2023-03-28 20:11:45'),
(8, 'Antigua and Barbuda', '+1268', 'AG / ATG', '2023-03-28 20:11:45'),
(9, 'Argentina', '+54', 'AR / ARG', '2023-03-28 20:11:45'),
(10, 'Armenia', '+374', 'AM / ARM', '2023-03-28 20:11:45'),
(11, 'Aruba', '+297', 'AW / ABW', '2023-03-28 20:11:45'),
(12, 'Australia', '+61', 'AU / AUS', '2023-03-28 20:11:45'),
(13, 'Austria', '+43', 'AT / AUT', '2023-03-28 20:11:45'),
(14, 'Azerbaijan', '+994', 'AZ / AZE', '2023-03-28 20:11:45'),
(15, 'Bahamas', '+1242', 'BS / BHS', '2023-03-28 20:11:45'),
(16, 'Bahrain', '+973', 'BH / BHR', '2023-03-28 20:11:45'),
(17, 'Bangladesh', '+880', 'BD / BGD', '2023-03-28 20:11:45'),
(18, 'Barbados', '+1246', 'BB / BRB', '2023-03-28 20:11:45'),
(19, 'Belarus', '+375', 'BY / BLR', '2023-03-28 20:11:45'),
(20, 'Belgium', '+32', 'BE / BEL', '2023-03-28 20:11:45'),
(21, 'Belize', '+501', 'BZ / BLZ', '2023-03-28 20:11:45'),
(22, 'Benin', '+229', 'BJ / BEN', '2023-03-28 20:11:45'),
(23, 'Bermuda', '+1441', 'BM / BMU', '2023-03-28 20:11:45'),
(24, 'Bhutan', '+975', 'BT / BTN', '2023-03-28 20:11:45'),
(25, 'Bolivia', '+591', 'BO / BOL', '2023-03-28 20:11:45'),
(26, 'Bosnia and Herzegovina', '+387', 'BA / BIH', '2023-03-28 20:11:45'),
(27, 'Botswana', '+267', 'BW / BWA', '2023-03-28 20:11:45'),
(28, 'Brazil', '+55', 'BR / BRA', '2023-03-28 20:11:45'),
(29, 'British Indian Ocean Territory', '+246', 'IO / IOT', '2023-03-28 20:11:45'),
(30, 'British Virgin Islands', '+1284', 'VG / VGB', '2023-03-28 20:11:45'),
(31, 'Brunei', '+673', 'BN / BRN', '2023-03-28 20:11:45'),
(32, 'Bulgaria', '+359', 'BG / BGR', '2023-03-28 20:11:45'),
(33, 'Burkina Faso', '+226', 'BF / BFA', '2023-03-28 20:11:45'),
(34, 'Burundi', '+257', 'BI / BDI', '2023-03-28 20:11:45'),
(35, 'Cambodia', '+855', 'KH / KHM', '2023-03-28 20:11:45'),
(36, 'Cameroon', '+237', 'CM / CMR', '2023-03-28 20:11:45'),
(37, 'Canada', '+1', 'CA / CAN', '2023-03-28 20:11:45'),
(38, 'Cape Verde', '+238', 'CV / CPV', '2023-03-28 20:11:45'),
(39, 'Cayman Islands', '+1345', 'KY / CYM', '2023-03-28 20:11:45'),
(40, 'Central African Republic', '+236', 'CF / CAF', '2023-03-28 20:11:45'),
(41, 'Chad', '+235', 'TD / TCD', '2023-03-28 20:11:45'),
(42, 'Chile', '+56', 'CL / CHL', '2023-03-28 20:11:45'),
(43, 'China', '+86', 'CN / CHN', '2023-03-28 20:11:45'),
(44, 'Christmas Island', '+61', 'CX / CXR', '2023-03-28 20:11:45'),
(45, 'Cocos Islands', '+61', 'CC / CCK', '2023-03-28 20:11:45'),
(46, 'Colombia', '+57', 'CO / COL', '2023-03-28 20:11:45'),
(47, 'Comoros', '+269', 'KM / COM', '2023-03-28 20:11:45'),
(48, 'Cook Islands', '+682', 'CK / COK', '2023-03-28 20:11:45'),
(49, 'Costa Rica', '+506', 'CR / CRI', '2023-03-28 20:11:45'),
(50, 'Croatia', '+385', 'HR / HRV', '2023-03-28 20:11:45'),
(51, 'Cuba', '+53', 'CU / CUB', '2023-03-28 20:11:45'),
(52, 'Curacao', '+599', 'CW / CUW', '2023-03-28 20:11:45'),
(53, 'Cyprus', '+357', 'CY / CYP', '2023-03-28 20:11:45'),
(54, 'Czech Republic', '+420', 'CZ / CZE', '2023-03-28 20:11:45'),
(55, 'Democratic Republic of the Congo', '+243', 'CD / COD', '2023-03-28 20:11:45'),
(56, 'Denmark', '+45', 'DK / DNK', '2023-03-28 20:11:45'),
(57, 'Djibouti', '+253', 'DJ / DJI', '2023-03-28 20:11:45'),
(58, 'Dominica', '+1767', 'DM / DMA', '2023-03-28 20:11:45'),
(59, 'Dominican Republic', '+1809', 'DO / DOM', '2023-03-28 20:11:45'),
(60, 'Dominican Republic', '+1829', 'DO / DOM', '2023-03-28 20:11:45'),
(61, 'Dominican Republic', '+1849', 'DO / DOM', '2023-03-28 20:11:45'),
(62, 'East Timor', '+670', 'TL / TLS', '2023-03-28 20:11:45'),
(63, 'Ecuador', '+593', 'EC / ECU', '2023-03-28 20:11:45'),
(64, 'Egypt', '+20', 'EG / EGY', '2023-03-28 20:11:45'),
(65, 'El Salvador', '+503', 'SV / SLV', '2023-03-28 20:11:45'),
(66, 'Equatorial Guinea', '+240', 'GQ / GNQ', '2023-03-28 20:11:45'),
(67, 'Eritrea', '+291', 'ER / ERI', '2023-03-28 20:11:45'),
(68, 'Estonia', '+372', 'EE / EST', '2023-03-28 20:11:45'),
(69, 'Ethiopia', '+251', 'ET / ETH', '2023-03-28 20:11:45'),
(70, 'Falkland Islands', '+500', 'FK / FLK', '2023-03-28 20:11:45'),
(71, 'Faroe Islands', '+298', 'FO / FRO', '2023-03-28 20:11:45'),
(72, 'Fiji', '+679', 'FJ / FJI', '2023-03-28 20:11:45'),
(73, 'Finland', '+358', 'FI / FIN', '2023-03-28 20:11:45'),
(74, 'France', '+33', 'FR / FRA', '2023-03-28 20:11:45'),
(75, 'French Polynesia', '+689', 'PF / PYF', '2023-03-28 20:11:45'),
(76, 'Gabon', '+241', 'GA / GAB', '2023-03-28 20:11:45'),
(77, 'Gambia', '+220', 'GM / GMB', '2023-03-28 20:11:45'),
(78, 'Georgia', '+995', 'GE / GEO', '2023-03-28 20:11:45'),
(79, 'Germany', '+49', 'DE / DEU', '2023-03-28 20:11:45'),
(80, 'Ghana', '+233', 'GH / GHA', '2023-03-28 20:11:45'),
(81, 'Gibraltar', '+350', 'GI / GIB', '2023-03-28 20:11:45'),
(82, 'Greece', '+30', 'GR / GRC', '2023-03-28 20:11:45'),
(83, 'Greenland', '+299', 'GL / GRL', '2023-03-28 20:11:45'),
(84, 'Grenada', '+1473', 'GD / GRD', '2023-03-28 20:11:45'),
(85, 'Guam', '+1671', 'GU / GUM', '2023-03-28 20:11:45'),
(86, 'Guatemala', '+502', 'GT / GTM', '2023-03-28 20:11:45'),
(87, 'Guernsey', '+441481', 'GG / GGY', '2023-03-28 20:11:45'),
(88, 'Guinea', '+224', 'GN / GIN', '2023-03-28 20:11:45'),
(89, 'GuineaBissau', '+245', 'GW / GNB', '2023-03-28 20:11:45'),
(90, 'Guyana', '+592', 'GY / GUY', '2023-03-28 20:11:45'),
(91, 'Haiti', '+509', 'HT / HTI', '2023-03-28 20:11:45'),
(92, 'Honduras', '+504', 'HN / HND', '2023-03-28 20:11:45'),
(93, 'Hong Kong', '+852', 'HK / HKG', '2023-03-28 20:11:45'),
(94, 'Hungary', '+36', 'HU / HUN', '2023-03-28 20:11:45'),
(95, 'Iceland', '+354', 'IS / ISL', '2023-03-28 20:11:45'),
(96, 'India', '+91', 'IN / IND', '2023-03-28 20:11:45'),
(97, 'Indonesia', '+62', 'ID / IDN', '2023-03-28 20:11:45'),
(98, 'Iran', '+98', 'IR / IRN', '2023-03-28 20:11:45'),
(99, 'Iraq', '+964', 'IQ / IRQ', '2023-03-28 20:11:45'),
(100, 'Ireland', '+353', 'IE / IRL', '2023-03-28 20:11:45'),
(101, 'Isle of Man', '+441624', 'IM / IMN', '2023-03-28 20:11:45'),
(102, 'Israel', '+972', 'IL / ISR', '2023-03-28 20:11:45'),
(103, 'Italy', '+39', 'IT / ITA', '2023-03-28 20:11:45'),
(104, 'Ivory Coast', '+225', 'CI / CIV', '2023-03-28 20:11:45'),
(105, 'Jamaica', '+1876', 'JM / JAM', '2023-03-28 20:11:45'),
(106, 'Japan', '+81', 'JP / JPN', '2023-03-28 20:11:45'),
(107, 'Jersey', '+441534', 'JE / JEY', '2023-03-28 20:11:45'),
(108, 'Jordan', '+962', 'JO / JOR', '2023-03-28 20:11:45'),
(109, 'Kazakhstan', '+7', 'KZ / KAZ', '2023-03-28 20:11:45'),
(110, 'Kenya', '+254', 'KE / KEN', '2023-03-28 20:11:45'),
(111, 'Kiribati', '+686', 'KI / KIR', '2023-03-28 20:11:45'),
(112, 'Kosovo', '+383', 'XK / XKX', '2023-03-28 20:11:45'),
(113, 'Kuwait', '+965', 'KW / KWT', '2023-03-28 20:11:45'),
(114, 'Kyrgyzstan', '+996', 'KG / KGZ', '2023-03-28 20:11:45'),
(115, 'Laos', '+856', 'LA / LAO', '2023-03-28 20:11:45'),
(116, 'Latvia', '+371', 'LV / LVA', '2023-03-28 20:11:45'),
(117, 'Lebanon', '+961', 'LB / LBN', '2023-03-28 20:11:45'),
(118, 'Lesotho', '+266', 'LS / LSO', '2023-03-28 20:11:45'),
(119, 'Liberia', '+231', 'LR / LBR', '2023-03-28 20:11:45'),
(120, 'Libya', '+218', 'LY / LBY', '2023-03-28 20:11:45'),
(121, 'Liechtenstein', '+423', 'LI / LIE', '2023-03-28 20:11:45'),
(122, 'Lithuania', '+370', 'LT / LTU', '2023-03-28 20:11:45'),
(123, 'Luxembourg', '+352', 'LU / LUX', '2023-03-28 20:11:45'),
(124, 'Macau', '+853', 'MO / MAC', '2023-03-28 20:11:45'),
(125, 'Macedonia', '+389', 'MK / MKD', '2023-03-28 20:11:45'),
(126, 'Madagascar', '+261', 'MG / MDG', '2023-03-28 20:11:45'),
(127, 'Malawi', '+265', 'MW / MWI', '2023-03-28 20:11:45'),
(128, 'Malaysia', '+60', 'MY / MYS', '2023-03-28 20:11:45'),
(129, 'Maldives', '+960', 'MV / MDV', '2023-03-28 20:11:45'),
(130, 'Mali', '+223', 'ML / MLI', '2023-03-28 20:11:45'),
(131, 'Malta', '+356', 'MT / MLT', '2023-03-28 20:11:45'),
(132, 'Marshall Islands', '+692', 'MH / MHL', '2023-03-28 20:11:45'),
(133, 'Mauritania', '+222', 'MR / MRT', '2023-03-28 20:11:45'),
(134, 'Mauritius', '+230', 'MU / MUS', '2023-03-28 20:11:45'),
(136, 'Mexico', '+52', 'MX / MEX', '2023-03-28 20:11:45'),
(137, 'Micronesia', '+691', 'FM / FSM', '2023-03-28 20:11:45'),
(138, 'Moldova', '+373', 'MD / MDA', '2023-03-28 20:11:45'),
(139, 'Monaco', '+377', 'MC / MCO', '2023-03-28 20:11:45'),
(140, 'Mongolia', '+976', 'MN / MNG', '2023-03-28 20:11:45'),
(141, 'Montenegro', '+382', 'ME / MNE', '2023-03-28 20:11:45'),
(142, 'Montserrat', '+1664', 'MS / MSR', '2023-03-28 20:11:45'),
(143, 'Morocco', '+212', 'MA / MAR', '2023-03-28 20:11:45'),
(144, 'Mozambique', '+258', 'MZ / MOZ', '2023-03-28 20:11:45'),
(145, 'Myanmar', '+95', 'MM / MMR', '2023-03-28 20:11:45'),
(146, 'Namibia', '+264', 'NA / NAM', '2023-03-28 20:11:45'),
(147, 'Nauru', '+674', 'NR / NRU', '2023-03-28 20:11:45'),
(148, 'Nepal', '+977', 'NP / NPL', '2023-03-28 20:11:45'),
(149, 'Netherlands', '+31', 'NL / NLD', '2023-03-28 20:11:45'),
(150, 'Netherlands Antilles', '+599', 'AN / ANT', '2023-03-28 20:11:45'),
(151, 'New Caledonia', '+687', 'NC / NCL', '2023-03-28 20:11:45'),
(152, 'New Zealand', '+64', 'NZ / NZL', '2023-03-28 20:11:45'),
(153, 'Nicaragua', '+505', 'NI / NIC', '2023-03-28 20:11:45'),
(154, 'Niger', '+227', 'NE / NER', '2023-03-28 20:11:45'),
(155, 'Nigeria', '+234', 'NG / NGA', '2023-03-28 20:11:45'),
(156, 'Niue', '+683', 'NU / NIU', '2023-03-28 20:11:45'),
(157, 'North Korea', '+850', 'KP / PRK', '2023-03-28 20:11:45'),
(158, 'Northern Mariana Islands', '+1670', 'MP / MNP', '2023-03-28 20:11:45'),
(159, 'Norway', '+47', 'NO / NOR', '2023-03-28 20:11:45'),
(160, 'Oman', '+968', 'OM / OMN', '2023-03-28 20:11:45'),
(161, 'Pakistan', '+92', 'PK / PAK', '2023-03-28 20:11:45'),
(162, 'Palau', '+680', 'PW / PLW', '2023-03-28 20:11:45'),
(163, 'Palestine', '+970', 'PS / PSE', '2023-03-28 20:11:45'),
(164, 'Panama', '+507', 'PA / PAN', '2023-03-28 20:11:45'),
(165, 'Papua New Guinea', '+675', 'PG / PNG', '2023-03-28 20:11:45'),
(166, 'Paraguay', '+595', 'PY / PRY', '2023-03-28 20:11:45'),
(167, 'Peru', '+51', 'PE / PER', '2023-03-28 20:11:45'),
(168, 'Philippines', '+63', 'PH / PHL', '2023-03-28 20:11:45'),
(169, 'Pitcairn', '+64', 'PN / PCN', '2023-03-28 20:11:45'),
(170, 'Poland', '+48', 'PL / POL', '2023-03-28 20:11:45'),
(171, 'Portugal', '+351', 'PT / PRT', '2023-03-28 20:11:45'),
(172, 'Puerto Rico', '+1787', 'PR / PRI', '2023-03-28 20:11:45'),
(173, 'Puerto Rico', '+1939', 'PR / PRI', '2023-03-28 20:11:45'),
(174, 'Qatar', '+974', 'QA / QAT', '2023-03-28 20:11:45'),
(175, 'Republic of the Congo', '+242', 'CG / COG', '2023-03-28 20:11:45'),
(176, 'Reunion', '+262', 'RE / REU', '2023-03-28 20:11:45'),
(177, 'Romania', '+40', 'RO / ROU', '2023-03-28 20:11:45'),
(178, 'Russia', '+7', 'RU / RUS', '2023-03-28 20:11:45'),
(179, 'Rwanda', '+250', 'RW / RWA', '2023-03-28 20:11:45'),
(180, 'Saint Barthelemy', '+590', 'BL / BLM', '2023-03-28 20:11:45'),
(181, 'Saint Helena', '+290', 'SH / SHN', '2023-03-28 20:11:45'),
(182, 'Saint Kitts and Nevis', '+1869', 'KN / KNA', '2023-03-28 20:11:45'),
(183, 'Saint Lucia', '+1758', 'LC / LCA', '2023-03-28 20:11:45'),
(184, 'Saint Martin', '+590', 'MF / MAF', '2023-03-28 20:11:45'),
(185, 'Saint Pierre and Miquelon', '+508', 'PM / SPM', '2023-03-28 20:11:45'),
(186, 'Saint Vincent and the Grenadines', '+1784', 'VC / VCT', '2023-03-28 20:11:45'),
(187, 'Samoa', '+685', 'WS / WSM', '2023-03-28 20:11:45'),
(188, 'San Marino', '+378', 'SM / SMR', '2023-03-28 20:11:45'),
(189, 'Sao Tome and Principe', '+239', 'ST / STP', '2023-03-28 20:11:45'),
(190, 'Saudi Arabia', '+966', 'SA / SAU', '2023-03-28 20:11:45'),
(191, 'Senegal', '+221', 'SN / SEN', '2023-03-28 20:11:45'),
(192, 'Serbia', '+381', 'RS / SRB', '2023-03-28 20:11:45'),
(193, 'Seychelles', '+248', 'SC / SYC', '2023-03-28 20:11:45'),
(194, 'Sierra Leone', '+232', 'SL / SLE', '2023-03-28 20:11:45'),
(195, 'Singapore', '+65', 'SG / SGP', '2023-03-28 20:11:45'),
(196, 'Sint Maarten', '+1721', 'SX / SXM', '2023-03-28 20:11:45'),
(197, 'Slovakia', '+421', 'SK / SVK', '2023-03-28 20:11:45'),
(198, 'Slovenia', '+386', 'SI / SVN', '2023-03-28 20:11:45'),
(199, 'Solomon Islands', '+677', 'SB / SLB', '2023-03-28 20:11:45'),
(200, 'Somalia', '+252', 'SO / SOM', '2023-03-28 20:11:45'),
(201, 'South Africa', '+27', 'ZA / ZAF', '2023-03-28 20:11:45'),
(202, 'South Korea', '+82', 'KR / KOR', '2023-03-28 20:11:45'),
(203, 'South Sudan', '+211', 'SS / SSD', '2023-03-28 20:11:45'),
(204, 'Spain', '+34', 'ES / ESP', '2023-03-28 20:11:45'),
(205, 'Sri Lanka', '+94', 'LK / LKA', '2023-03-28 20:11:45'),
(206, 'Sudan', '+249', 'SD / SDN', '2023-03-28 20:11:45'),
(207, 'Suriname', '+597', 'SR / SUR', '2023-03-28 20:11:45'),
(208, 'Svalbard and Jan Mayen', '+47', 'SJ / SJM', '2023-03-28 20:11:45'),
(209, 'Swaziland', '+268', 'SZ / SWZ', '2023-03-28 20:11:45'),
(210, 'Sweden', '+46', 'SE / SWE', '2023-03-28 20:11:45'),
(211, 'Switzerland', '+41', 'CH / CHE', '2023-03-28 20:11:45'),
(212, 'Syria', '+963', 'SY / SYR', '2023-03-28 20:11:45'),
(213, 'Taiwan', '+886', 'TW / TWN', '2023-03-28 20:11:45'),
(214, 'Tajikistan', '+992', 'TJ / TJK', '2023-03-28 20:11:45'),
(215, 'Tanzania', '+255', 'TZ / TZA', '2023-03-28 20:11:45'),
(216, 'Thailand', '+66', 'TH / THA', '2023-03-28 20:11:45'),
(217, 'Togo', '+228', 'TG / TGO', '2023-03-28 20:11:45'),
(218, 'Tokelau', '+690', 'TK / TKL', '2023-03-28 20:11:45'),
(219, 'Tonga', '+676', 'TO / TON', '2023-03-28 20:11:45'),
(220, 'Trinidad and Tobago', '+1868', 'TT / TTO', '2023-03-28 20:11:45'),
(221, 'Tunisia', '+216', 'TN / TUN', '2023-03-28 20:11:45'),
(222, 'Turkey', '+90', 'TR / TUR', '2023-03-28 20:11:45'),
(223, 'Turkmenistan', '+993', 'TM / TKM', '2023-03-28 20:11:45'),
(224, 'Turks and Caicos Islands', '+1649', 'TC / TCA', '2023-03-28 20:11:45'),
(225, 'Tuvalu', '+688', 'TV / TUV', '2023-03-28 20:11:45'),
(226, 'U.S. Virgin Islands', '+1340', 'VI / VIR', '2023-03-28 20:11:45'),
(227, 'Uganda', '+256', 'UG / UGA', '2023-03-28 20:11:45'),
(228, 'Ukraine', '+380', 'UA / UKR', '2023-03-28 20:11:45'),
(229, 'United Arab Emirates', '+971', 'AE / ARE', '2023-03-28 20:11:45'),
(230, 'United Kingdom', '+44', 'GB / GBR', '2023-03-28 20:11:45'),
(231, 'United States', '+1', 'US / USA', '2023-03-28 20:11:45'),
(232, 'Uruguay', '+598', 'UY / URY', '2023-03-28 20:11:45'),
(233, 'Uzbekistan', '+998', 'UZ / UZB', '2023-03-28 20:11:45'),
(234, 'Vanuatu', '+678', 'VU / VUT', '2023-03-28 20:11:45'),
(235, 'Vatican', '+379', 'VA / VAT', '2023-03-28 20:11:45'),
(236, 'Venezuela', '+58', 'VE / VEN', '2023-03-28 20:11:45'),
(237, 'Vietnam', '+84', 'VN / VNM', '2023-03-28 20:11:45'),
(238, 'Wallis and Futuna', '+681', 'WF / WLF', '2023-03-28 20:11:45'),
(239, 'Western Sahara', '+212', 'EH / ESH', '2023-03-28 20:11:45'),
(240, 'Yemen', '+967', 'YE / YEM', '2023-03-28 20:11:45'),
(241, 'Zambia', '+260', 'ZM / ZMB', '2023-03-28 20:11:45'),
(242, 'Zimbabwe', '+263', 'ZW / ZWE', '2023-03-28 20:11:45');

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `department_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text,
  `created_by` int UNSIGNED NOT NULL,
  `created` datetime NOT NULL DEFAULT (now()),
  `updated_by` int UNSIGNED NOT NULL,
  `updated` datetime NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` int DEFAULT NULL,
  `deleted` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`department_id`, `title`, `description`, `created_by`, `created`, `updated_by`, `updated`, `deleted_by`, `deleted`) VALUES
(1, 'Creative', 'Desain, visual, konten kreatif', 0, '2025-04-09 20:15:07', 0, '2025-04-09 20:15:07', NULL, NULL),
(2, 'Finance', 'Pengelolaan anggaran dan transaksi', 0, '2025-04-09 20:15:07', 0, '2025-04-09 20:15:07', NULL, NULL),
(3, 'Developer', 'Teknis dan pengembangan aplikasi', 0, '2025-04-09 20:15:07', 0, '2025-04-09 20:15:07', NULL, NULL),
(4, 'Account', 'Pengelolaan klien dan akun', 0, '2025-04-09 20:15:07', 0, '2025-04-09 20:15:07', NULL, NULL),
(5, 'Content', 'Penulisan dan strategi konten', 0, '2025-04-09 20:15:07', 0, '2025-04-09 20:15:07', NULL, NULL),
(6, 'IT', 'Information Technology', 0, '2025-04-09 20:15:07', 0, '2025-04-09 20:15:07', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `email_log`
--

DROP TABLE IF EXISTS `email_log`;
CREATE TABLE `email_log` (
  `id` bigint UNSIGNED NOT NULL,
  `notification_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `to_email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_key` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_vars` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `body` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('queued','attempt','sent','skipped','failed','throttled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'queued',
  `reason` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_message_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smtp_response` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `attempt_no` int UNSIGNED NOT NULL DEFAULT '1',
  `dedup_key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created` int UNSIGNED NOT NULL,
  `updated` int UNSIGNED NOT NULL,
  `attempted` int UNSIGNED DEFAULT NULL,
  `sent` int UNSIGNED DEFAULT NULL,
  `created_by` int UNSIGNED NOT NULL,
  `updated_by` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_log`
--

INSERT INTO `email_log` (`id`, `notification_id`, `user_id`, `to_email`, `type`, `subject`, `template_key`, `template_vars`, `body`, `status`, `reason`, `provider`, `provider_message_id`, `smtp_response`, `error_code`, `error_message`, `attempt_no`, `dedup_key`, `created`, `updated`, `attempted`, `sent`, `created_by`, `updated_by`) VALUES
(5, 1076, 21, 'diki@vp-digital.com', 'generic', '[Workload] Notification', 'generic', '{\"title\":\"Account Status Updated\",\"body\":\"Previous status: \\\"active\\\" → New status: \\\"waiting\\\"\",\"link\":\"https://vp-digital.my.id/profile/21\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Account Status Updated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Account Status Updated</p><p>Previous status: \"active\" → New status: \"waiting\"</p></div>\n      <p><a href=\"https://vp-digital.my.id/profile/21\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'sent', NULL, NULL, '<8dade583-6a19-b7e7-a950-0222ea0165c6@vp-digital.my.id>', '250 Ok: queued as gOHPAEG0Td2YQA8Xv2juxQ', NULL, NULL, 1, 'user_status_21_waiting', 1760946625, 1760946627, 1760946625, 1760946627, 1, 1),
(6, 1077, 21, 'diki@vp-digital.com', 'generic', '[Workload] Notification', 'generic', '{\"title\":\"Account Status Updated\",\"body\":\"Previous status: \\\"waiting\\\" → New status: \\\"active\\\"\",\"link\":\"https://vp-digital.my.id/profile/21\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Account Status Updated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Account Status Updated</p><p>Previous status: \"waiting\" → New status: \"active\"</p></div>\n      <p><a href=\"https://vp-digital.my.id/profile/21\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'sent', NULL, NULL, '<bcff0ca0-5ca7-dda8-6b01-d80ff8b34200@vp-digital.my.id>', '250 Ok: queued as H7CCyF1zR2mNKygrf3QawQ', NULL, NULL, 1, 'user_status_21_active', 1760947169, 1760947170, 1760947169, 1760947170, 1, 1),
(7, 1078, 19, 'bayu@vp-digital.com', 'generic', '[Workload] Notification', 'generic', '{\"title\":\"Account Status Updated\",\"body\":\"Previous status: \\\"waiting\\\" → New status: \\\"active\\\"\",\"link\":\"https://vp-digital.my.id/profile/19\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Account Status Updated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Account Status Updated</p><p>Previous status: \"waiting\" → New status: \"active\"</p></div>\n      <p><a href=\"https://vp-digital.my.id/profile/19\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'sent', NULL, NULL, '<8559b1b2-7209-b3a9-0be2-43d34735bf48@vp-digital.my.id>', '250 Ok: queued as xiZxY47jQPaQNrKl4bcP9w', NULL, NULL, 1, 'user_status_19_active', 1760947253, 1760947253, 1760947253, 1760947253, 1, 1),
(8, 1081, 25, 'kevin@vp-digital.com', 'generic', '[Workload] Notification', 'generic', '{\"title\":\"You were mentioned in a task comment\",\"body\":\"You were mentioned in a task comment\",\"link\":\"https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=97\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">You were mentioned in a task comment</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>You were mentioned in a task comment</p><p>You were mentioned in a task comment</p></div>\n      <p><a href=\"https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=97\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'sent', NULL, NULL, '<f3a686da-d95d-c4fd-beee-2cd051b096f2@vp-digital.my.id>', '250 Ok: queued as c08XAn98T1WSInJjwFjxdQ', NULL, NULL, 1, NULL, 1761551346, 1761551347, 1761551346, 1761551347, 1, 1),
(9, 1141, 21, 'diki@vp-digital.com', 'leave', '[Workload] Notification', 'generic', '{\"title\":\"Leave request needs approval (Assign)\",\"body\":\"Leave request #2\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave request needs approval (Assign)</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave request needs approval (Assign)</p><p>Leave request #2</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'leave:2:assign', 1769501432, 1769501432, 1769501432, NULL, 1, 1),
(10, 1141, 21, 'diki@vp-digital.com', 'leave', '[Workload] Notification', 'generic', '{\"title\":\"Leave request needs approval (Assign)\",\"body\":\"Leave request #2\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave request needs approval (Assign)</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave request needs approval (Assign)</p><p>Leave request #2</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, 'leave:2:assign', 1769501432, 1769501432, NULL, NULL, 1, 1),
(11, 1142, 20, 'seto@vp-digital.com', 'leave', '[Workload] Notification', 'generic', '{\"title\":\"Leave request needs approval (HOD)\",\"body\":\"Leave request #2\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave request needs approval (HOD)</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave request needs approval (HOD)</p><p>Leave request #2</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'leave:2:hod', 1769501432, 1769501432, 1769501432, NULL, 1, 1),
(12, 1142, 20, 'seto@vp-digital.com', 'leave', '[Workload] Notification', 'generic', '{\"title\":\"Leave request needs approval (HOD)\",\"body\":\"Leave request #2\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave request needs approval (HOD)</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave request needs approval (HOD)</p><p>Leave request #2</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, 'leave:2:hod', 1769501432, 1769501432, NULL, NULL, 1, 1),
(13, 1143, 19, 'bayu@vp-digital.com', 'leave_approval_progress', '[Workload] Notification', 'generic', '{\"title\":\"Leave approval updated\",\"body\":\"Your leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 was approved by Bayu Nugroho.\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2,\"scope\":\"assign_to\",\"action\":\"approve\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave approval updated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave approval updated</p><p>Your leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 was approved by Bayu Nugroho.</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'leave_progress:2:19:assign_to:1769501476', 1769501476, 1769501476, 1769501476, NULL, 1, 1),
(14, 1143, 19, 'bayu@vp-digital.com', 'leave_approval_progress', '[Workload] Notification', 'generic', '{\"title\":\"Leave approval updated\",\"body\":\"Your leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 was approved by Bayu Nugroho.\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2,\"scope\":\"assign_to\",\"action\":\"approve\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave approval updated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave approval updated</p><p>Your leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 was approved by Bayu Nugroho.</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, 'leave_progress:2:19:assign_to:1769501476', 1769501476, 1769501476, NULL, NULL, 1, 1),
(15, 1144, 20, 'seto@vp-digital.com', 'leave_need_approval_hod', '[Workload] Notification', 'generic', '{\"title\":\"Leave needs your approval\",\"body\":\"Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is ready for your approval.\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2,\"scope\":\"hod\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave needs your approval</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave needs your approval</p><p>Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is ready for your approval.</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'leave_need_approval_hod:2:20', 1769501476, 1769501476, 1769501476, NULL, 1, 1),
(16, 1144, 20, 'seto@vp-digital.com', 'leave_need_approval_hod', '[Workload] Notification', 'generic', '{\"title\":\"Leave needs your approval\",\"body\":\"Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is ready for your approval.\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2,\"scope\":\"hod\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave needs your approval</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave needs your approval</p><p>Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is ready for your approval.</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, 'leave_need_approval_hod:2:20', 1769501476, 1769501476, NULL, NULL, 1, 1),
(17, 1145, 19, 'bayu@vp-digital.com', 'leave_approved', '[Workload] Notification', 'generic', '{\"title\":\"Leave approved\",\"body\":\"Your leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2,\"action\":\"approve\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave approved</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave approved</p><p>Your leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'leave_approved:2:19', 1769501478, 1769501478, 1769501478, NULL, 1, 1),
(18, 1145, 19, 'bayu@vp-digital.com', 'leave_approved', '[Workload] Notification', 'generic', '{\"title\":\"Leave approved\",\"body\":\"Your leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2,\"action\":\"approve\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave approved</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave approved</p><p>Your leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, 'leave_approved:2:19', 1769501478, 1769501478, NULL, NULL, 1, 1),
(19, 1146, 21, 'diki@vp-digital.com', 'leave_approved_fyi', '[Workload] Notification', 'generic', '{\"title\":\"Leave approved (FYI)\",\"body\":\"Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2,\"action\":\"approve\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave approved (FYI)</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave approved (FYI)</p><p>Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'leave_approved_fyi:2:21', 1769501478, 1769501478, 1769501478, NULL, 1, 1),
(20, 1146, 21, 'diki@vp-digital.com', 'leave_approved_fyi', '[Workload] Notification', 'generic', '{\"title\":\"Leave approved (FYI)\",\"body\":\"Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2,\"action\":\"approve\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave approved (FYI)</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave approved (FYI)</p><p>Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, 'leave_approved_fyi:2:21', 1769501478, 1769501478, NULL, NULL, 1, 1),
(21, 1147, 20, 'seto@vp-digital.com', 'leave_approved_fyi', '[Workload] Notification', 'generic', '{\"title\":\"Leave approved (FYI)\",\"body\":\"Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2,\"action\":\"approve\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave approved (FYI)</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave approved (FYI)</p><p>Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'leave_approved_fyi:2:20', 1769501478, 1769501478, 1769501478, NULL, 1, 1),
(22, 1147, 20, 'seto@vp-digital.com', 'leave_approved_fyi', '[Workload] Notification', 'generic', '{\"title\":\"Leave approved (FYI)\",\"body\":\"Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.\",\"link\":\"http://localhost:3000/leave\",\"leave_id\":2,\"action\":\"approve\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Leave approved (FYI)</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Leave approved (FYI)</p><p>Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.</p></div>\n      <p><a href=\"http://localhost:3000/leave\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, 'leave_approved_fyi:2:20', 1769501478, 1769501478, NULL, NULL, 1, 1),
(23, 1148, 28, 'diki@vp-digital.com', 'user_status_changed', '[Workload] Notification', 'generic', '{\"title\":\"Account status updated\",\"body\":\"Hello Diki Subagja, your account is now ACTIVE.\",\"link\":null,\"user_id\":28,\"status_from\":\"new\",\"status_to\":\"active\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Account status updated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Account status updated</p><p>Hello Diki Subagja, your account is now ACTIVE.</p></div>\n      \n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 1770795473, 1770795473, 1770795473, NULL, 1, 1),
(24, 1148, 28, 'diki@vp-digital.com', 'user_status_changed', '[Workload] Notification', 'generic', '{\"title\":\"Account status updated\",\"body\":\"Hello Diki Subagja, your account is now ACTIVE.\",\"link\":null,\"user_id\":28,\"status_from\":\"new\",\"status_to\":\"active\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Account status updated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>Account status updated</p><p>Hello Diki Subagja, your account is now ACTIVE.</p></div>\n      \n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, NULL, 1770795473, 1770795473, NULL, NULL, 1, 1),
(25, 1150, 29, 'diki@vp-digital.com', 'user_status_changed', '[Workload] Account status updated: active', 'user_status_changed', '{\"title\":\"Your account has been activated\",\"body\":\"Hello Diki Subagja, your account is now active. You can continue to the dashboard.\",\"link\":\"http://localhost:3000/dashboard\",\"user_id\":29,\"user_name\":\"Diki Subagja\",\"user_email\":\"diki@vp-digital.com\",\"status_from\":\"waiting\",\"status_to\":\"active\",\"activated_by\":\"Bayu Nugroho\",\"activated_at\":1770797341}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Account Activated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\">\n        <p>Hello <b>Diki Subagja</b>,</p>\n        <p>Your account status has been updated.</p>\n        <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"6\" style=\"border-collapse:collapse;border:1px solid #e2e8f0;margin:8px 0\">\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Previous status</b></td>\n            <td style=\"border:1px solid #e2e8f0\">waiting</td>\n          </tr>\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Current status</b></td>\n            <td style=\"border:1px solid #e2e8f0\">active</td>\n          </tr>\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Updated by</b></td>\n            <td style=\"border:1px solid #e2e8f0\">Bayu Nugroho</td>\n          </tr>\n        </table>\n        <p>You can now continue to your dashboard.</p>\n      </div>\n      <p><a href=\"http://localhost:3000/dashboard\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open dashboard</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 1770797342, 1770797342, 1770797342, NULL, 1, 1),
(26, 1150, 29, 'diki@vp-digital.com', 'user_status_changed', '[Workload] Account status updated: active', 'user_status_changed', '{\"title\":\"Your account has been activated\",\"body\":\"Hello Diki Subagja, your account is now active. You can continue to the dashboard.\",\"link\":\"http://localhost:3000/dashboard\",\"user_id\":29,\"user_name\":\"Diki Subagja\",\"user_email\":\"diki@vp-digital.com\",\"status_from\":\"waiting\",\"status_to\":\"active\",\"activated_by\":\"Bayu Nugroho\",\"activated_at\":1770797341}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Account Activated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\">\n        <p>Hello <b>Diki Subagja</b>,</p>\n        <p>Your account status has been updated.</p>\n        <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"6\" style=\"border-collapse:collapse;border:1px solid #e2e8f0;margin:8px 0\">\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Previous status</b></td>\n            <td style=\"border:1px solid #e2e8f0\">waiting</td>\n          </tr>\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Current status</b></td>\n            <td style=\"border:1px solid #e2e8f0\">active</td>\n          </tr>\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Updated by</b></td>\n            <td style=\"border:1px solid #e2e8f0\">Bayu Nugroho</td>\n          </tr>\n        </table>\n        <p>You can now continue to your dashboard.</p>\n      </div>\n      <p><a href=\"http://localhost:3000/dashboard\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open dashboard</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, NULL, 1770797342, 1770797342, NULL, NULL, 1, 1),
(27, 1152, 30, 'bayu@vp-digital.com', 'user_status_changed', '[Workload] Account status updated: active', 'user_status_changed', '{\"title\":\"Your account has been activated\",\"body\":\"Hello Bayu Nugroho (VP Digital), your account is now active. You can continue to the dashboard.\",\"link\":\"http://localhost:3000/dashboard\",\"user_id\":30,\"user_name\":\"Bayu Nugroho (VP Digital)\",\"user_email\":\"bayu@vp-digital.com\",\"status_from\":\"waiting\",\"status_to\":\"active\",\"activated_by\":\"Diki Subagja\",\"activated_at\":1770797809}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Account Activated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\">\n        <p>Hello <b>Bayu Nugroho (VP Digital)</b>,</p>\n        <p>Your account status has been updated.</p>\n        <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"6\" style=\"border-collapse:collapse;border:1px solid #e2e8f0;margin:8px 0\">\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Previous status</b></td>\n            <td style=\"border:1px solid #e2e8f0\">waiting</td>\n          </tr>\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Current status</b></td>\n            <td style=\"border:1px solid #e2e8f0\">active</td>\n          </tr>\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Updated by</b></td>\n            <td style=\"border:1px solid #e2e8f0\">Diki Subagja</td>\n          </tr>\n        </table>\n        <p>You can now continue to your dashboard.</p>\n      </div>\n      <p><a href=\"http://localhost:3000/dashboard\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open dashboard</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 1770797809, 1770797809, 1770797809, NULL, 1, 1),
(28, 1152, 30, 'bayu@vp-digital.com', 'user_status_changed', '[Workload] Account status updated: active', 'user_status_changed', '{\"title\":\"Your account has been activated\",\"body\":\"Hello Bayu Nugroho (VP Digital), your account is now active. You can continue to the dashboard.\",\"link\":\"http://localhost:3000/dashboard\",\"user_id\":30,\"user_name\":\"Bayu Nugroho (VP Digital)\",\"user_email\":\"bayu@vp-digital.com\",\"status_from\":\"waiting\",\"status_to\":\"active\",\"activated_by\":\"Diki Subagja\",\"activated_at\":1770797809}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">Account Activated</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\">\n        <p>Hello <b>Bayu Nugroho (VP Digital)</b>,</p>\n        <p>Your account status has been updated.</p>\n        <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"6\" style=\"border-collapse:collapse;border:1px solid #e2e8f0;margin:8px 0\">\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Previous status</b></td>\n            <td style=\"border:1px solid #e2e8f0\">waiting</td>\n          </tr>\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Current status</b></td>\n            <td style=\"border:1px solid #e2e8f0\">active</td>\n          </tr>\n          <tr>\n            <td style=\"border:1px solid #e2e8f0\"><b>Updated by</b></td>\n            <td style=\"border:1px solid #e2e8f0\">Diki Subagja</td>\n          </tr>\n        </table>\n        <p>You can now continue to your dashboard.</p>\n      </div>\n      <p><a href=\"http://localhost:3000/dashboard\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open dashboard</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, NULL, 1770797809, 1770797809, NULL, NULL, 1, 1),
(29, 1161, 30, 'bayu@vp-digital.com', 'generic', '[Workload] Notification', 'generic', '{\"title\":\"You were mentioned in a task comment\",\"body\":\"You were mentioned in a task comment\",\"link\":\"http://localhost:3000/dashboard?openmodal=true&modul=task&task=110\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">You were mentioned in a task comment</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>You were mentioned in a task comment</p><p>You were mentioned in a task comment</p></div>\n      <p><a href=\"http://localhost:3000/dashboard?openmodal=true&modul=task&task=110\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'attempt', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 1770800873, 1770800873, 1770800873, NULL, 1, 1),
(30, 1161, 30, 'bayu@vp-digital.com', 'generic', '[Workload] Notification', 'generic', '{\"title\":\"You were mentioned in a task comment\",\"body\":\"You were mentioned in a task comment\",\"link\":\"http://localhost:3000/dashboard?openmodal=true&modul=task&task=110\"}', '<!doctype html><html><head><meta charset=\"utf-8\"></head>\n<body style=\"margin:0;padding:24px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;\">\n  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px\">\n    <tr><td style=\"padding:24px\">\n      <h2 style=\"margin:0 0 12px 0;font-size:18px\">You were mentioned in a task comment</h2>\n      <div style=\"font-size:14px;line-height:1.6;color:#334155\"><p>You were mentioned in a task comment</p><p>You were mentioned in a task comment</p></div>\n      <p><a href=\"http://localhost:3000/dashboard?openmodal=true&modul=task&task=110\" style=\"display:inline-block;padding:10px 16px;text-decoration:none;border-radius:8px;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;\">Open</a></p>\n      <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:16px 0\">\n      <p style=\"font-size:12px;color:#94a3b8;margin:0\">This is an automated message from Workload.</p>\n    </td></tr>\n  </table>\n</body></html>', 'failed', NULL, NULL, NULL, NULL, NULL, 'attachments is not defined', 1, NULL, 1770800873, 1770800873, NULL, NULL, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `holiday`
--

DROP TABLE IF EXISTS `holiday`;
CREATE TABLE `holiday` (
  `holiday_id` int NOT NULL,
  `date` date NOT NULL,
  `description` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_day_off` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'true',
  `country_code` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ID',
  `region_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('holiday','leave') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `holiday`
--

INSERT INTO `holiday` (`holiday_id`, `date`, `description`, `is_day_off`, `country_code`, `region_code`, `type`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(1, '2025-01-01', 'Tahun Baru 2025', 'true', 'ID', NULL, 'holiday', 1757158428, NULL, NULL, NULL, NULL, NULL),
(2, '2025-05-01', 'Hari Buruh Internasional', 'true', 'ID', NULL, 'holiday', 1757158428, NULL, NULL, NULL, NULL, NULL),
(3, '2025-06-01', 'Hari Lahir Pancasila', 'true', 'ID', NULL, 'holiday', 1757158428, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `leadsource`
--

DROP TABLE IF EXISTS `leadsource`;
CREATE TABLE `leadsource` (
  `leadsource_id` int UNSIGNED NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ordered` int UNSIGNED NOT NULL DEFAULT '1',
  `is_active` enum('true','false') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'true',
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leadsource`
--

INSERT INTO `leadsource` (`leadsource_id`, `title`, `ordered`, `is_active`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(1, 'Facebook', 1, 'true', 1771397691, 1, 1771397745, 1, NULL, NULL),
(2, 'WhatsApp', 2, 'true', 1771397691, 1, 1771397745, 1, NULL, NULL),
(3, 'LinkedIn', 3, 'true', 1771397691, 1, 1771397745, 1, NULL, NULL),
(4, 'Instagram', 4, 'true', 1771397691, 1, 1771397745, 1, NULL, NULL),
(5, 'Own Research', 5, 'true', 1771397691, 1, 1771397745, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `leadstatus`
--

DROP TABLE IF EXISTS `leadstatus`;
CREATE TABLE `leadstatus` (
  `leadstatus_id` int UNSIGNED NOT NULL,
  `slug` varchar(50) NOT NULL,
  `title` varchar(100) NOT NULL,
  `ordered` int UNSIGNED NOT NULL DEFAULT '1',
  `is_active` enum('true','false') NOT NULL DEFAULT 'true',
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave`
--

DROP TABLE IF EXISTS `leave`;
CREATE TABLE `leave` (
  `leave_id` int NOT NULL,
  `user_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days` int NOT NULL,
  `permit` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Leave',
  `reason` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detail` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `assign_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `assign_to` int DEFAULT NULL,
  `approval_assign_to_status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approval_assign_to_at` int DEFAULT NULL,
  `hod` int DEFAULT NULL,
  `hrd` int DEFAULT NULL,
  `approval_hrd_status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approval_hrd_at` int DEFAULT NULL,
  `approval_hod_status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approval_hod_at` int DEFAULT NULL,
  `operational_director` int DEFAULT NULL,
  `approval_operational_director_status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approval_operational_director_at` int DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created` int NOT NULL,
  `created_by` int NOT NULL,
  `updated` int NOT NULL,
  `updated_by` int NOT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave`
--

INSERT INTO `leave` (`leave_id`, `user_id`, `start_date`, `end_date`, `days`, `permit`, `reason`, `detail`, `assign_note`, `assign_to`, `approval_assign_to_status`, `approval_assign_to_at`, `hod`, `hrd`, `approval_hrd_status`, `approval_hrd_at`, `approval_hod_status`, `approval_hod_at`, `operational_director`, `approval_operational_director_status`, `approval_operational_director_at`, `status`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(2, 19, '2026-01-29', '2026-01-30', 2, 'Leave', 'Cuti Tahunan', 'liburan', 'Test cuti', 21, 'approved', 1769501476, 20, NULL, 'pending', NULL, 'approved', 1769501478, NULL, 'pending', NULL, 'approved', 1769501432, 19, 1769501478, 19, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `leave_config`
--

DROP TABLE IF EXISTS `leave_config`;
CREATE TABLE `leave_config` (
  `lconfig_id` int NOT NULL,
  `mlreason_id` int NOT NULL,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` int DEFAULT NULL,
  `max_sequence` int DEFAULT NULL,
  `created` int NOT NULL,
  `created_by` int NOT NULL,
  `updated` int NOT NULL,
  `updated_by` int NOT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_config`
--

INSERT INTO `leave_config` (`lconfig_id`, `mlreason_id`, `title`, `total`, `max_sequence`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(1, 1, 'Unpaid Leave', NULL, NULL, 1759696447, 1, 1759696447, 1, NULL, NULL),
(2, 2, 'Umrah', NULL, NULL, 1759696447, 1, 1759696447, 1, NULL, NULL),
(3, 3, 'Sakit', NULL, NULL, 1759696447, 1, 1759696447, 1, NULL, NULL),
(5, 5, 'Menstruasi', 24, 2, 1759696447, 1, 1759696447, 1, NULL, NULL),
(6, 6, 'Menikahkan', 2, 2, 1759696447, 1, 1759696447, 1, NULL, NULL),
(7, 7, 'Menikah', 3, 3, 1759696447, 1, 1759696447, 1, NULL, NULL),
(8, 8, 'Mengkhitankan', 2, 2, 1759696447, 1, 1759696447, 1, NULL, NULL),
(9, 9, 'Melahirkan (Suami)', 2, 2, 1759696447, 1, 1759696447, 1, NULL, NULL),
(10, 10, 'Melahirkan', 90, 90, 1759696447, 1, 1759696447, 1, NULL, NULL),
(11, 11, 'Cuti Tahunan', 12, 5, 1759696447, 1, 1759696447, 1, NULL, NULL),
(13, 13, 'Berduka Cita (Keluarga Utama)', 2, 2, 1759696447, 1, 1759696447, 1, NULL, NULL),
(14, 14, 'Baptis', 2, 2, 1759696447, 1, 1759696447, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `master_annual_assesment_question`
--

DROP TABLE IF EXISTS `master_annual_assesment_question`;
CREATE TABLE `master_annual_assesment_question` (
  `question_id` bigint UNSIGNED NOT NULL,
  `section_key` varchar(30) NOT NULL,
  `question_key` varchar(80) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `input_type` enum('rating','text','textarea') NOT NULL DEFAULT 'rating',
  `options_json` json DEFAULT NULL,
  `scale_min` tinyint UNSIGNED DEFAULT NULL,
  `scale_max` tinyint UNSIGNED DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created` int DEFAULT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `deleted` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `master_annual_assesment_question`
--

INSERT INTO `master_annual_assesment_question` (`question_id`, `section_key`, `question_key`, `title`, `description`, `input_type`, `options_json`, `scale_min`, `scale_max`, `sort_order`, `is_active`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(1, 'professional', 'prof_pemahaman_tanggung_jawab', 'PEMAHAMAN TANGGUNG JAWAB', 'Telah memahami tanggung jawab tugasnya dengan baik dan benar.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 1, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(2, 'professional', 'prof_kualitas_dalam_pekerjaan', 'KUALITAS DALAM PEKERJAAN', 'Telah menunjukkan kemampuan dan kemauan untuk selalu berusaha untuk mengutamakan hasil pekerjaan yang berkualitas serta meningkatkan mutu dalam bekerja.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 2, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(3, 'professional', 'prof_kemampuan_strategis', 'KEMAMPUAN STRATEGIS', 'Telah menunjukan kemampuan berpikir atau menganalisa dengan baik dan efektif terhadap suatu masalah. Termasuk dalam mengidentifikasi masalah untuk dapat diselesaikan dengan baik dan benar.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 3, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(4, 'professional', 'prof_pola_pikir', 'POLA PIKIR', 'Telah menunjukan kemampuan dan kemauan untuk selalu berpikir maju dan kreatif dalam bekerja serta bersikap jujur dalam melakukan segala hal.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 4, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(5, 'professional', 'prof_kepemimpinan', 'KEPEMIMPINAN', 'Telah menunjukan kemampuan untuk memimpin dan memotivasi bawahan, dapat menjadi contoh bagi rekan kerja dan juga melakukan pengarahan yang baik.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 5, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(6, 'professional', 'prof_pengaturan_waktu', 'PENGATURAN WAKTU', 'Telah mampu mengatur dan membagi waktu untuk mengerjakan pekerjaan sehingga semua pekerjaan dapat selesai dengan tepat, baik dan benar.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 6, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(7, 'professional', 'prof_kemampuan_berkomunikasi', 'KEMAMPUAN BERKOMUNIKASI', 'Telah menunjukkan kemampuan untuk mengkomunikasikan suatu masalah dan berbicara secara efektif baik kepada atasan, rekan kerja dan atau pihak lainnya.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 7, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(8, 'professional', 'prof_kreatifitas', 'KREATIFITAS', 'Telah menunjukkan kemampuan untuk mengeluarkan hasil pemikiran yang kreatif kepada pemimpin dan juga dapat menerapkannya dengan baik.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 8, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(9, 'professional', 'prof_inisiatif', 'INISIATIF', 'Telah menunjukkan kemampuan dalam memberikan alternatif solusi atas sebuah masalah dan dapat melihat suatu masalah dari berbagai sudut pertimbangan.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 9, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(10, 'professional', 'prof_efektif_efisien', 'EFEKTIF & EFISIEN', 'Telah menunjukkan usaha untuk bekerja secara efektif dan efisien. Termasuk dalam hal meminimalisasi biaya / kerugian (misal: penggunaan atau pemilihan barang dan pengeluaran biaya).', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 10, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(11, 'professional', 'prof_kedisiplinan', 'KEDISPLINAN', 'Telah menunjukkan kemampuan berdisiplin selalu tepat waktu, taat dan menghormati struktur peraturan dan tata tertib Perusahaan, termasuk ketepatan waktu hadir/ kehadiran di tempat, dan penggunaan waktu kerja secara maksimal.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 11, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(12, 'professional', 'prof_orientasi_pada_hasil', 'ORIENTASI PADA HASIL', 'Telah menunjukan kemampuan dan pengertian untuk memahami tujuan / hasil akhir dengan baik.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 12, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(13, 'professional', 'prof_pengorganisasian', 'PENGORGANISASIAN', 'Telah menunjukan kemampuan untuk mengelola pekerjaan dengan memanfaatkan sumber-sumber yang tersedia (orang, waktu, biaya, dan material) sehingga tercapainya tujuan Perusahaan yang telah disepakati dan Membantu dalam menjalin kerjasama dengan pihak lain demi kepentingan Perusahaan, membuka diri terhadap kritik dan saran.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 13, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(14, 'personal', 'pers_integritas', 'INTEGRITAS', 'Telah menunjukkan kemampuan dan kemauan untuk selalu menunjukkan kejujuran dan ketulusan ketika berhubungan dengan pekerjaan dan orang lain.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 14, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(15, 'personal', 'pers_komitmen', 'KOMITMEN', 'Telah menunjukkan kemampuan dan kemauan untuk bertanggung jawab terhadap pekerjaan atau pengambilan keputusan.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 15, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(16, 'personal', 'pers_daya_tahan', 'DAYA TAHAN', 'Telah menunjukan kemampuan dan kemauan untuk menunjukkan daya tahan dalam menghadapi pekerjaan yang berat dan sulit. Tidak mudah menyerah dalam menghadapi segala tantangan pekerjaan.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 16, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(17, 'personal', 'pers_flexibilitas', 'FLEXIBILITAS', 'Telah menunjukkan kemampuan dan kemauan untuk bersikap fleksibel terhadap perubahan yang timbul. Mudah beradaptasi dan peningkatan dalam berbagai situasi.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 17, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(18, 'personal', 'pers_rendah_hati', 'RENDAH HATI', 'Telah menunjukkan kemampuan dan juga kemauan untuk bersikap rendah hati, tidak sombong atau tidak mudah puas dengan hasil yang di capai saat ini.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 18, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(19, 'personal', 'pers_semangat', 'SEMANGAT', 'Telah menunjukkan semangat yang tinggi untuk terus berkembang dan tidak mudah puas dengan hasil kerja yang dicapai saat ini.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 19, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(20, 'personal', 'pers_ramah_sopan', 'RAMAH DAN SOPAN', 'Telah menunjukkan sikap yang ramah dan sopan terhadap pimpinan, rekan kerja dan juga pihak lainnya.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 20, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(21, 'personal', 'pers_reliability', 'RELIABILITY / KEPERCAYAAN / KEANDALAN / DAPAT DIANDALKAN', 'Telah menunjukan dapat dipercaya, konsisten, keandalan, kestabilan dan menunjukan hasil yang dapat dipercaya dan tidak bertentangan.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 21, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(22, 'personal', 'pers_kompetensi', 'KOMPETENSI', 'Telah menunjukan kinerja yang dapat diamati, terukur dan sangat penting terhadap aspek Pengetahuan, Pemahaman, Kemampuan dan Sikap untuk keberhasilan kinerja individu terhadap perusahaan.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 22, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(23, 'personal', 'pers_trustworthy', 'TRUSWORTHY / DAPAT DIPERCAYA / TERPERCAYA', 'Telah bekerja dengan baik untuk menjaga kepercayaan yang diberikan oleh perusahaan dan atasan langsung serta klien. Serta bersikap jujur dalam melakukan setiap tindakan.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 23, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(24, 'personal', 'pers_perhatian_penerimaan_diri', 'PERHATIAN DAN PENERIMAAN DIRI', 'Telah melakukan komunikasi dan menghargai pendapat mereka tentang suatu hal yang sedang dibicarakan. Mengetahui tentang diri sendiri dan posisinya, menghormati dan mengerti orang lain (Sub ordinate / Rekan kerja / Atasan / Bawahan).', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 24, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(25, 'personal', 'pers_dukungan', 'DUKUNGAN', 'Hubungan dengan orang lain yang diketahui kemampuannya dan percaya bahwa mereka memiliki kapabilitas yang dibutuhkan.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 25, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(26, 'personal', 'pers_motivasi', 'MOTIVASI', 'Motivasi ialah suatu proses yang menjelaskan intensitas, arah dan ketekunan individu agar dapat mencapai tujuannya.', 'rating', '[{\"label\": \"Mengecewakan\", \"value\": 1}, {\"label\": \"Perlu Di tingkatkan\", \"value\": 2}, {\"label\": \"Baik / Cukup Baik\", \"value\": 3}, {\"label\": \"Sangat baik\", \"value\": 4}, {\"label\": \"Diatas rata-rata\", \"value\": 5}]', 1, 5, 26, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(27, 'development', 'dev_harapan_jangka_pendek', 'HARAPAN PRIBADI (JANGKA PENDEK – KURANG DARI 3 TAHUN)', NULL, 'textarea', NULL, NULL, NULL, 27, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(28, 'development', 'dev_harapan_jangka_panjang', 'HARAPAN PRIBADI (JANGKA PANJANG – LEBIH DARI 3 TAHUN)', NULL, 'textarea', NULL, NULL, NULL, 28, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(29, 'development', 'dev_pencapaian_hard_skill', 'PENCAPAIAN PENGEMBANGAN DIRI SAMPAI SAAT INI (HARD SKILL)', NULL, 'textarea', NULL, NULL, NULL, 29, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(30, 'development', 'dev_pencapaian_soft_skill', 'PENCAPAIAN PENGEMBANGAN DIRI SAMPAI SAAT INI (SOFT SKILL)', NULL, 'textarea', NULL, NULL, NULL, 30, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(31, 'development', 'dev_target_tujuan', 'TARGET PENGEMBANGAN DIRI KEDEPAN (TARGET / TUJUAN YANG DITETAPKAN)', NULL, 'textarea', NULL, NULL, NULL, 31, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(32, 'development', 'dev_rencana_pencapaian_target', 'RENCANA PENCAPAIAN TARGET', NULL, 'textarea', NULL, NULL, NULL, 32, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(33, 'development', 'dev_pelatihan_nama', 'PELATIHAN YANG DIPERLUKAN (NAMA PELATIHAN)', NULL, 'textarea', NULL, NULL, NULL, 33, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(34, 'development', 'dev_pelatihan_jenis', 'PELATIHAN YANG DIPERLUKAN (JENIS PELATIHAN)', NULL, 'textarea', NULL, NULL, NULL, 34, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(35, 'development', 'dev_pelatihan_periode', 'PELATIHAN YANG DIPERLUKAN (PERIODE YANG DI JADWALKAN)', NULL, 'textarea', NULL, NULL, NULL, 35, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(36, 'development', 'dev_catatan_tambahan_karyawan', 'CATATAN TAMBAHAN DARI KARYAWAN', NULL, 'textarea', NULL, NULL, NULL, 36, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(37, 'development', 'dev_saran_kritik_divisi', 'SARAN DAN KRITIK UNTUK DIVISI', NULL, 'textarea', NULL, NULL, NULL, 37, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL),
(38, 'development', 'dev_catatan_tambahan_penilai', 'CATATAN TAMBAHAN DARI PENILAI', NULL, 'textarea', NULL, NULL, NULL, 38, 1, 1765942496, NULL, 1765942496, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `master_annual_assestment_period`
--

DROP TABLE IF EXISTS `master_annual_assestment_period`;
CREATE TABLE `master_annual_assestment_period` (
  `period_id` bigint UNSIGNED NOT NULL,
  `year` smallint UNSIGNED NOT NULL,
  `open_at` int UNSIGNED NOT NULL,
  `close_at` int UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created` int UNSIGNED DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated` int UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `deleted` int UNSIGNED DEFAULT NULL,
  `deleted_by` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `master_annual_assestment_period`
--

INSERT INTO `master_annual_assestment_period` (`period_id`, `year`, `open_at`, `close_at`, `is_active`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(1, 2025, 1766014176, 1766186976, 1, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `master_appraisal_question`
--

DROP TABLE IF EXISTS `master_appraisal_question`;
CREATE TABLE `master_appraisal_question` (
  `question_id` int UNSIGNED NOT NULL,
  `title` varchar(180) NOT NULL,
  `sort_order` int NOT NULL,
  `question_title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `is_active` enum('true','false') NOT NULL DEFAULT 'true',
  `created` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `master_appraisal_question`
--

INSERT INTO `master_appraisal_question` (`question_id`, `title`, `sort_order`, `question_title`, `description`, `is_active`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(1, 'Performance Appraisal (Probation Period)', 1, 'TARGET ACHIEVEMENT', 'Kemampuan untuk mencapai target kerja yang telah ditetapkan', 'true', 1766395346, 1, 1766395346, 1, NULL, NULL),
(2, 'Performance Appraisal (Probation Period)', 2, 'STRATEGIC CAPABILITIES', 'Telah menunjukkan kemampuan berfikir analitis dan strategis, memiliki dan menangani masalah/ isu dengan cara yang paling efektif.', 'true', 1766395346, 1, 1766395346, 1, NULL, NULL),
(3, 'Performance Appraisal (Probation Period)', 3, 'QUALITY DRIVEN ATTITUDE', 'Telah menunjukkan sikap, kehadiran dan perilaku yang berkualitas pada setiap proses kerja.', 'true', 1766395346, 1, 1766395346, 1, NULL, NULL),
(4, 'Performance Appraisal (Probation Period)', 4, 'JOB EXELLENCE', 'Telah menunjukkan kemampuan dan kemauan untuk melaksanakan tugas sesuai standart keterampilan yang ditetapkan, memperhatikan setiap detail dan memastikan kualitas yang dihasilkan sesuai dengan standart.', 'true', 1766395346, 1, 1766395346, 1, NULL, NULL),
(5, 'Performance Appraisal (Probation Period)', 5, 'TEAMWORK AND COOPERATION', 'Telah menunjukkan kemampuan dan kemauan menjadi Team Kerja. Dapat bekerja dalam Team dan mau bekerja sama dengan yang lain.', 'true', 1766395346, 1, 1766395346, 1, NULL, NULL),
(6, 'Performance Appraisal (Probation Period)', 6, 'PROBLEM SOLVING AND DECISION MAKING', 'Telah menunjukkan kemampuan untuk memecahkan masalah dan melihat berbagai pertimbangan dalam mengambil keputusan.', 'true', 1766395346, 1, 1766395346, 1, NULL, NULL),
(7, 'Performance Appraisal (Probation Period)', 7, 'PASSIONATE', 'Menunjukkan kemajuan perolehan pengetahuan dalam waktu tertentu (Knowledge), kemampuan dan kemauan dalam menerapkan cara untuk mendukung diri dalam proses kerja agar lebih efektif dan efisien (Innovatif), kemampuan dan kemauan untuk mencapai hasil terbaik dalam setiap usaha (Achievement).', 'true', 1766395346, 1, 1766395346, 1, NULL, NULL),
(8, 'Performance Appraisal (Probation Period)', 8, 'COMMITMENT', 'Telah menunjukkan kemampuan dan kemauan untuk bertanggungjawab terhadap pekerjaan/ pengambilan keputusan.', 'true', 1766395346, 1, 1766395346, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `menu_id` int UNSIGNED NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `path` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ordered` int UNSIGNED DEFAULT NULL,
  `is_show` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'true',
  `type` enum('dashboard','page','button') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'page',
  `is_active` enum('false','true') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'true',
  `parent_id` int UNSIGNED DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`menu_id`, `title`, `path`, `icon`, `ordered`, `is_show`, `type`, `is_active`, `parent_id`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(100, 'General', NULL, NULL, 1, 'true', 'page', 'true', NULL, 1755492679, 1, 1755812211, 1, NULL, NULL),
(101, 'Task', NULL, NULL, 2, 'true', 'page', 'true', NULL, 1758857362, 1, 1769398553, 21, NULL, NULL),
(164, 'Dashboard', '/dashboard', 'MdOutlineHome', 1, 'true', 'page', 'true', 100, 1755492679, 1, 1769398024, 21, NULL, NULL),
(165, 'Projects', '/project', 'MdOutlineWorkspaces', 2, 'true', 'page', 'true', 100, 1755492679, 1, 1769398056, 21, NULL, NULL),
(166, 'Timesheet', '/timesheet', 'MdOutlineTimer', 3, 'true', 'page', 'true', 100, 1755492679, 1, 1769398125, 21, NULL, NULL),
(167, 'Clients', '/client', 'MdBusiness', 4, 'true', 'page', 'true', 100, 1755492679, 1, 1769398175, 21, NULL, NULL),
(168, 'Team', '/team', 'MdOutlineGroups2', 5, 'true', 'page', 'false', 100, 1755492679, 1, 1769398221, 21, NULL, NULL),
(169, 'Calendar', '/calendar', 'MdOutlineCalendarMonth', 6, 'true', 'page', 'true', 100, 1755492679, 1, 1769398248, 21, NULL, NULL),
(173, 'Setting', NULL, NULL, 4, 'true', 'page', 'true', NULL, 1755812307, 1, 1769398880, 21, NULL, NULL),
(174, 'Menu', '/menu', 'MdOutlineSettingsSuggest', 1, 'true', 'page', 'true', 173, 1755812408, 1, 1769398900, 21, NULL, NULL),
(175, 'Role', '/role', 'MdOutlineManageAccounts', 2, 'true', 'page', 'true', 173, 1755812445, 1, 1769398922, 21, NULL, NULL),
(176, 'All Tasks', '/task', 'MdOutlineChecklistRtl', 1, 'true', 'page', 'true', 101, 1755812546, 1, 1769398571, 21, NULL, NULL),
(177, 'Overview', '/overview', 'MdDashboard', 1, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1755490131, 1, NULL, NULL),
(178, 'Team Performance', '/team-performance', 'MdOutlineGroups2', 2, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1769398204, 21, NULL, NULL),
(179, 'Task List', '/task-list', 'FaTasks', 3, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1755490131, 1, NULL, NULL),
(180, 'Client Review', '/client-review', 'MdBusiness', 4, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1769398170, 21, NULL, NULL),
(181, 'Ongoing Project', '/ongoing-project', 'MdOutlineWorkspaces', 5, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1769398065, 21, NULL, NULL),
(182, 'Weekly Attendance', '/weekly-attendance', 'MdOutlineCalendarMonth', 6, 'true', 'dashboard', 'true', 164, 1755812546, 1, 1769398252, 21, NULL, NULL),
(183, 'Add Pitching', 'add_pitching', NULL, 1, 'false', 'button', 'true', 100, 1755812546, 1, 1755812546, 1, NULL, NULL),
(184, 'Add Project', 'add_project', NULL, 1, 'false', 'button', 'true', 100, 1755812546, 1, 1755812546, 1, NULL, NULL),
(185, 'Add Task', 'add_task', NULL, 1, 'false', 'button', 'true', 100, 1755812546, 1, 1755812546, 1, NULL, NULL),
(186, 'HOD', '/task-hod', 'MdOutlineAdminPanelSettings', 2, 'true', 'page', 'true', 101, 1755812546, 1, 1769398590, 21, NULL, NULL),
(187, 'Review', '/task-review', 'MdOutlineFactCheck', 3, 'true', 'page', 'true', 101, 1755812546, 1, 1769398616, 21, NULL, NULL),
(188, 'User', '/user', 'MdOutlinePeopleAlt', 3, 'true', 'page', 'true', 100, 1755812546, 1, 1769398098, 21, NULL, NULL),
(189, 'Website', NULL, NULL, 3, 'true', 'page', 'true', NULL, 1759904084, 1, 1769398779, 21, NULL, NULL),
(190, 'Blog', '/website/blog', 'FaBlog', 1, 'true', 'page', 'true', 189, 1759904127, 1, 1759904127, 1, NULL, NULL),
(191, 'Clients', '/website/clients', 'MdBusiness', 2, 'true', 'page', 'true', 189, 1759904159, 1, 1769398167, 21, NULL, NULL),
(192, 'page', '/website/page', 'MdOutlineFolderCopy', 3, 'true', 'page', 'true', 189, 1759904184, 1, 1769398815, 21, NULL, NULL),
(193, 'Project', '/website/project', 'MdOutlineWorkspaces', 4, 'true', 'page', 'true', 189, 1759904206, 1, 1769398060, 21, NULL, NULL),
(194, 'Services', '/website/services', 'MdOutlineDvr', 15, 'true', 'page', 'true', 189, 1759904225, 1, 1769398861, 21, NULL, NULL),
(195, 'Client', NULL, 'MdOutlineGroups2', 5, 'true', 'page', 'true', NULL, 1770953827, 30, 1770953827, 30, NULL, NULL),
(196, 'Leads', '/leads', 'MdOutlinePersonSearch', 2, 'true', 'page', 'true', 195, 1770953880, 30, 1770953880, 30, NULL, NULL),
(197, 'Customer', '/customer', 'MdOutlinePersonSearch', 2, 'true', 'page', 'true', 195, 1770953972, 30, 1770953972, 30, NULL, NULL),
(198, 'CRM Report', '/crm/report', 'MdOutlineAssessment', 3, 'true', 'page', 'true', 195, 1771396746, 30, 1771396746, 30, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `notification_id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `sender` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cover` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'default.png',
  `email_send` enum('false','true') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false',
  `email_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_read` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false',
  `delivery_email_status` enum('queued','attempt','sent','skipped','failed','throttled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `delivery_email_meta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `dedup_key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_open` enum('false','true') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false',
  `schedule` datetime DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `created` int NOT NULL,
  `updated` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`notification_id`, `user_id`, `sender`, `description`, `url`, `cover`, `email_send`, `email_type`, `is_read`, `delivery_email_status`, `delivery_email_meta`, `dedup_key`, `is_open`, `schedule`, `payload`, `created`, `updated`) VALUES
(1071, 21, 'Bayu Nugroho', 'Status akun kamu berubah dari \"active\" menjadi \"waiting\".', 'https://vp-digital.my.id/profile/21', 'default.png', 'false', 'generic', 'true', NULL, NULL, 'user_status_21_waiting', 'false', NULL, NULL, 1760686436, 1761722145),
(1072, 21, 'Bayu Nugroho', 'Your account is now active and ready to use.', 'https://vp-digital.my.id/profile/21', 'default.png', 'false', 'generic', 'true', NULL, NULL, 'user_status_21_active', 'false', NULL, NULL, 1760692868, 1761722145),
(1073, 19, 'Bayu Nugroho', 'Your account is now pending review or approval.', 'https://vp-digital.my.id/profile/19', 'default.png', 'false', 'generic', 'true', NULL, NULL, 'user_status_19_waiting', 'false', NULL, NULL, 1760942541, 1764856686),
(1074, 19, 'Bayu Nugroho', 'Your account is now active and ready to use.', 'https://vp-digital.my.id/profile/19', 'default.png', 'false', 'generic', 'true', NULL, NULL, 'user_status_19_active', 'false', NULL, NULL, 1760942892, 1764856686),
(1075, 19, 'Bayu Nugroho', 'Your account is now pending review or approval.', 'https://vp-digital.my.id/profile/19', 'default.png', 'false', 'generic', 'true', NULL, NULL, 'user_status_19_waiting', 'false', NULL, NULL, 1760943032, 1764856686),
(1076, 21, 'Bayu Nugroho', 'Your account is now pending review or approval.', 'https://vp-digital.my.id/profile/21', 'default.png', 'true', 'generic', 'true', 'sent', '250 Ok: queued as gOHPAEG0Td2YQA8Xv2juxQ', 'user_status_21_waiting', 'false', NULL, NULL, 1760946625, 1761722144),
(1077, 21, 'Bayu Nugroho', 'Your account is now active and ready to use.', 'https://vp-digital.my.id/profile/21', 'default.png', 'true', 'generic', 'true', 'sent', '250 Ok: queued as H7CCyF1zR2mNKygrf3QawQ', 'user_status_21_active', 'false', NULL, NULL, 1760947169, 1761722138),
(1078, 19, 'Bayu Nugroho', 'Your account is now active and ready to use.', 'https://vp-digital.my.id/profile/19', 'default.png', 'true', 'generic', 'true', 'sent', '250 Ok: queued as xiZxY47jQPaQNrKl4bcP9w', 'user_status_19_active', 'false', NULL, NULL, 1760947252, 1760947271),
(1079, 25, 'system', 'Kamu di-assign ke subtask: Script IG FEED 1', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"assign\\\",\\\"taskId\\\":\\\"102\\\"}\"', 1761550940, 1761550940),
(1080, 25, 'system', 'Kamu di-assign ke subtask: Content IG FEED 1', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"assign\\\",\\\"taskId\\\":\\\"101\\\"}\"', 1761551318, 1761551318),
(1081, 25, 'task', 'You were mentioned in a task comment', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=97', 'default.png', 'true', 'generic', 'false', 'sent', '250 Ok: queued as c08XAn98T1WSInJjwFjxdQ', NULL, 'false', NULL, '\"{\\\"taskId\\\":97,\\\"commentId\\\":69,\\\"preview\\\":\\\"@Kevin-Konggidinata udah kelar belom?\\\"}\"', 1761551346, 1761551347),
(1082, 25, 'system', 'Kamu di-assign ke subtask: Script IG FEED 2', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"assign\\\",\\\"taskId\\\":\\\"107\\\"}\"', 1761552079, 1761552079),
(1083, 25, 'system', 'Due date subtask diperbarui: 09 Nov 2025.', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"reschedule\\\",\\\"taskId\\\":\\\"107\\\",\\\"newDue\\\":1762621200}\"', 1761552123, 1761552123),
(1084, 25, 'system', 'Kamu di-assign ke subtask: Content IG FEED 2', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"assign\\\",\\\"taskId\\\":\\\"106\\\"}\"', 1761552146, 1761552146),
(1085, 25, 'system', 'Due date subtask diperbarui: 17 Nov 2025.', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"reschedule\\\",\\\"taskId\\\":\\\"101\\\",\\\"newDue\\\":1763312400}\"', 1761553205, 1761553205),
(1086, 25, 'system', 'Due date subtask diperbarui: 24 Oct 2025.', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"reschedule\\\",\\\"taskId\\\":\\\"102\\\",\\\"newDue\\\":1761242461}\"', 1761553253, 1761553253),
(1087, 25, 'system', 'Due date subtask diperbarui: 27 Oct 2025.', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"reschedule\\\",\\\"taskId\\\":\\\"106\\\",\\\"newDue\\\":1761498000}\"', 1761553266, 1761553266),
(1088, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1761708518, 1761708518),
(1089, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1761708518, 1761708518),
(1090, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1761708519, 1761708519),
(1091, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1761708519, 1761708519),
(1092, 21, 'General', 'testtt notif', NULL, 'default.png', 'false', NULL, 'true', 'skipped', 'flag_off', NULL, 'false', NULL, '\"\"', 1761723788, 1769396333),
(1093, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764835783, 1764835783),
(1094, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764835783, 1764835783),
(1095, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764835783, 1764835783),
(1096, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764835783, 1764835783),
(1097, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764835800, 1764835800),
(1098, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764835800, 1764835800),
(1099, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764835800, 1764835800),
(1100, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764835800, 1764835800),
(1101, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764839844, 1764839844),
(1102, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764839844, 1764839844),
(1103, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764839844, 1764839844),
(1104, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764839844, 1764839844),
(1105, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764839844, 1764839844),
(1106, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764839844, 1764839845),
(1107, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764839845, 1764839845),
(1108, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764839845, 1764839845),
(1109, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764841339, 1764841339),
(1110, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764841339, 1764841339),
(1111, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764841339, 1764841339),
(1112, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764841339, 1764841339),
(1113, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764841340, 1764841340),
(1114, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764841340, 1764841340),
(1115, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764841340, 1764841340),
(1116, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764841340, 1764841340),
(1117, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764845988, 1764845988),
(1118, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764845988, 1764845988),
(1119, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764845988, 1764845988),
(1120, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764845988, 1764845988),
(1121, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764845989, 1764845989),
(1122, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764845989, 1764845989),
(1123, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764845989, 1764845989),
(1124, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764845989, 1764845989),
(1125, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764864525, 1764864525),
(1126, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764864525, 1764864525),
(1127, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764864525, 1764864525),
(1128, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764864525, 1764864525),
(1129, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764864526, 1764864526),
(1130, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764864526, 1764864526),
(1131, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764864526, 1764864526),
(1132, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764864526, 1764864526),
(1133, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764886709, 1764886710),
(1134, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764886710, 1764886710),
(1135, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764886710, 1764886710),
(1136, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764886710, 1764886710),
(1137, 25, 'system', 'Task overdue: Script IG FEED 1', 'https://vp-digital.my.id/tasks/102', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":102}\"', 1764886710, 1764886710),
(1138, 25, 'system', 'Task overdue: Content IG FEED 2', 'https://vp-digital.my.id/tasks/106', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":106}\"', 1764886710, 1764886710),
(1139, 25, 'system', 'Task overdue: Script IG FEED 2', 'https://vp-digital.my.id/tasks/107', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":107}\"', 1764886710, 1764886710),
(1140, 25, 'system', 'Task overdue: Content IG FEED 1', 'https://vp-digital.my.id/tasks/101', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"taskOverdue\\\",\\\"taskId\\\":101}\"', 1764886710, 1764886710),
(1141, 21, 'system', 'Leave request #2', 'https://vp-digital.my.id/leave', 'default.png', 'false', 'leave', 'true', 'failed', 'attachments is not defined', 'leave:2:assign', 'false', NULL, NULL, 1769501432, 1769560692),
(1142, 20, 'system', 'Leave request #2', 'https://vp-digital.my.id/leave', 'default.png', 'false', 'leave', 'true', 'failed', 'attachments is not defined', 'leave:2:hod', 'false', NULL, NULL, 1769501432, 1769511318),
(1143, 19, 'system', 'Your leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 was approved by Bayu Nugroho.', 'https://vp-digital.my.id/leave', 'default.png', 'false', 'leave_approval_progress', 'true', 'failed', 'attachments is not defined', 'leave_progress:2:19:assign_to:1769501476', 'false', NULL, NULL, 1769501476, 1769659235),
(1144, 20, 'system', 'Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is ready for your approval.', 'https://vp-digital.my.id/leave', 'default.png', 'false', 'leave_need_approval_hod', 'true', 'failed', 'attachments is not defined', 'leave_need_approval_hod:2:20', 'false', NULL, NULL, 1769501476, 1769511326),
(1145, 19, 'system', 'Your leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.', 'https://vp-digital.my.id/leave', 'default.png', 'false', 'leave_approved', 'true', 'failed', 'attachments is not defined', 'leave_approved:2:19', 'false', NULL, NULL, 1769501478, 1769659235),
(1146, 21, 'system', 'Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.', 'https://vp-digital.my.id/leave', 'default.png', 'false', 'leave_approved_fyi', 'false', 'failed', 'attachments is not defined', 'leave_approved_fyi:2:21', 'false', NULL, NULL, 1769501478, 1769501478),
(1147, 20, 'system', 'Leave (Cuti Tahunan) for 2026-01-29 → 2026-01-30 is fully approved.', 'https://vp-digital.my.id/leave', 'default.png', 'false', 'leave_approved_fyi', 'true', 'failed', 'attachments is not defined', 'leave_approved_fyi:2:20', 'false', NULL, NULL, 1769501478, 1769511333),
(1148, 28, 'Workload', 'Hello Diki Subagja, your account is now ACTIVE.', NULL, 'default.png', 'false', 'user_status_changed', 'false', 'failed', 'attachments is not defined', NULL, 'false', NULL, NULL, 1770795473, 1770795473),
(1149, 29, 'Workload', 'Your profile has been submitted and is awaiting HRD verification.', NULL, 'default.png', 'false', 'profile_submitted', 'true', 'skipped', 'flag_off', NULL, 'false', NULL, NULL, 1770796628, 1770796771),
(1150, 29, 'Bayu Nugroho', 'Hello Diki Subagja, your account is now active. You can continue to the dashboard.', 'https://vp-digital.my.id/dashboard', 'default.png', 'false', 'user_status_changed', 'false', 'failed', 'attachments is not defined', NULL, 'false', NULL, NULL, 1770797341, 1770797342),
(1151, 30, 'Workload', 'Your profile has been submitted and is awaiting HRD verification.', NULL, 'default.png', 'false', 'profile_submitted', 'true', 'skipped', 'flag_off', NULL, 'false', NULL, NULL, 1770797696, 1770802076),
(1152, 30, 'Diki Subagja', 'Hello Bayu Nugroho (VP Digital), your account is now active. You can continue to the dashboard.', 'https://vp-digital.my.id/dashboard', 'default.png', 'false', 'user_status_changed', 'false', 'failed', 'attachments is not defined', NULL, 'false', NULL, NULL, 1770797809, 1770797809),
(1153, 32, 'Workload', 'Your profile has been submitted and is awaiting HRD verification.', NULL, 'default.png', 'false', 'profile_submitted', 'false', 'skipped', 'flag_off', NULL, 'false', NULL, NULL, 1770799091, 1770799091),
(1154, 33, 'Workload', 'Your profile has been submitted and is awaiting HRD verification.', NULL, 'default.png', 'false', 'profile_submitted', 'false', 'skipped', 'flag_off', NULL, 'false', NULL, NULL, 1770799266, 1770799266),
(1155, 35, 'Workload', 'Your profile has been submitted and is awaiting HRD verification.', NULL, 'default.png', 'false', 'profile_submitted', 'false', 'skipped', 'flag_off', NULL, 'false', NULL, NULL, 1770799872, 1770799872),
(1156, 30, 'system', 'Kamu di-assign ke subtask: Backend Web Shopify', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=111', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"assign\\\",\\\"taskId\\\":\\\"111\\\"}\"', 1770800458, 1770800458),
(1157, 30, 'system', 'Due date subtask diperbarui: 12 Feb 2026.', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=111', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"reschedule\\\",\\\"taskId\\\":\\\"111\\\",\\\"newDue\\\":1770829200}\"', 1770800467, 1770800467),
(1158, 29, 'system', 'Kamu di-assign ke subtask: Frontend Web Shopify', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=112', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"assign\\\",\\\"taskId\\\":\\\"112\\\"}\"', 1770800586, 1770800586),
(1159, 30, 'system', 'Kamu di-assign ke subtask: Backend Web Shopify', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=111', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"assign\\\",\\\"taskId\\\":\\\"111\\\"}\"', 1770800591, 1770800591),
(1160, 36, 'Workload', 'Your profile has been submitted and is awaiting HRD verification.', NULL, 'default.png', 'false', 'profile_submitted', 'false', 'skipped', 'flag_off', NULL, 'false', NULL, NULL, 1770800656, 1770800656),
(1161, 30, 'task', 'You were mentioned in a task comment', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=110', 'default.png', 'false', 'generic', 'true', 'failed', 'attachments is not defined', NULL, 'false', NULL, '\"{\\\"taskId\\\":110,\\\"commentId\\\":70,\\\"preview\\\":\\\"test @Bayu Nugroho (VP Digital)\\\"}\"', 1770800873, 1770805451),
(1162, 30, 'system', 'Kamu di-assign ke subtask: Backend Web Shopify', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=111', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"assign\\\",\\\"taskId\\\":\\\"111\\\"}\"', 1770801671, 1770801671),
(1163, 29, 'system', 'Due date subtask diperbarui: 11 Feb 2026.', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=112', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"reschedule\\\",\\\"taskId\\\":\\\"112\\\",\\\"newDue\\\":1770742800}\"', 1770801737, 1770801737),
(1164, 29, 'system', 'Due date subtask diperbarui: 28 Feb 2026.', 'https://vp-digital.my.id/dashboard?openmodal=true&modul=task&task=112', 'default.png', 'false', NULL, 'false', 'skipped', 'flag_off', NULL, 'false', NULL, '\"{\\\"type\\\":\\\"reschedule\\\",\\\"taskId\\\":\\\"112\\\",\\\"newDue\\\":1772211600}\"', 1770801745, 1770801745);

-- --------------------------------------------------------

--
-- Table structure for table `notification_push`
--

DROP TABLE IF EXISTS `notification_push`;
CREATE TABLE `notification_push` (
  `notification_push_id` bigint UNSIGNED NOT NULL,
  `token` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `app` enum('web','ios','android','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `ua` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `browser` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','revoked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `last_seen` int UNSIGNED DEFAULT NULL,
  `created` int UNSIGNED NOT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `updated` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_push`
--

INSERT INTO `notification_push` (`notification_push_id`, `token`, `app`, `ua`, `platform`, `browser`, `device`, `status`, `last_seen`, `created`, `created_by`, `updated`) VALUES
(1, 'crwYO7mFJMdEn6D0MNCMHr:APA91bG4ATk5cOI4W78hYWssE9KM7487oMrgCvWJWUC4nFwoWYXMqGH19rcNfIMw_zRSmnZjqZgZbZq1UJrcaTVkNlmSgMmmBjBkWmmJ3WZ3iD9sQr9-ynk', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', NULL, NULL, NULL, 'active', 1759739813, 1759739382, 19, 1759739813),
(2, 'eFUmvp15_W9l0PbvYon9sz:APA91bF3PasVnJYwnkdR8rUOLR8ARfWMqzSq9gSpaSOvAXxoQrwBBuTdfz3bJm0yMf499JsarNMCiDSNGYK2BkUDtGyvQdAV6WjqwwB-n4vtlCaqcZST3rY', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', NULL, NULL, NULL, 'active', 1759821375, 1759820708, 19, 1759821375),
(3, 'e0Z-jeNAS5tQw-tg8YRwg-:APA91bF0qJxDHvlhdVt1unR_nnjQAW8d52oliy897Hpsd23LLWcFppG_bm8VAdMO1jek_ft9gpu-Medpc054dJjHjrGlOd_auOYXKM1IGKkZ0UU72ZeF1PY', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', NULL, NULL, NULL, 'active', 1759839089, 1759839086, 20, 1759839089),
(4, 'cUgrZBw4fctGekjIbFWd9L:APA91bHAS7hewHeJLxd4b5XRRJ59A2Nk38gUFxs8Y76L9uPROtl1Rl3g74r-mB0s4kTc7L9fZC7G8ifr_p_s-TXIt2MGL12mcLhVbE_epsltv02Bq-YtZ8w', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', NULL, NULL, NULL, 'active', 1759841924, 1759841924, 19, 1759841924),
(5, 'drvGqjgFNt6paAkTLDtplz:APA91bFYamnikr7pHtAymyEoslmPaHaykPGN2tK6sBH7T9wcBagFG1rAz8Q6YYnZkBgSR6nrFFNFhaQietQ2ZERkX4rBEirpz8qy0NIOxtBtirLcS66d4qs', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', NULL, NULL, NULL, 'active', 1765693795, 1759975128, 19, 1765693795),
(6, 'e0Z-jeNAS5tQw-tg8YRwg-:APA91bEfHb2xTAlt0FmpT4H1a2D2gsZtUSPjDL5TvCfiy-8ghNIT1NU_HvEpaYDfc4pFWTMosKz62TxprErEENE6qayY9pOgPaO4FaRnrdNTpjgMDyGwvLE', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', NULL, NULL, NULL, 'active', 1760317872, 1760317872, 20, 1760317872),
(7, 'e0Z-jeNAS5tQw-tg8YRwg-:APA91bHbsNnDR4PzAeavd5etm5bmltrDgWZ22JmQLxKZp2WlLTXAYLO5rUcgawJVMOA0Bcifk_fgUTLWPXmHvJO2XXpRUsRBcIjcICzgc23FPknvGGzc8lw', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', NULL, NULL, NULL, 'active', 1760317873, 1760317873, 20, 1760317873),
(8, 'e0Z-jeNAS5tQw-tg8YRwg-:APA91bE5HlUiBcBLNp4yl-DyoBYm9Zr0apc1v0lEnAxfzrpowWUgeRN4xil8uGYg5VJGEinLOxSev-5gCb4OZczMO0iqK43EQ0kdoHWLZAY3KpTAU_FJaOQ', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', NULL, NULL, NULL, 'active', 1760317873, 1760317873, 20, 1760317873),
(9, 'e0Z-jeNAS5tQw-tg8YRwg-:APA91bE-FlUAD0rHsejjgZeIjOablsSEdQm_7ctBwXy-NsHJFBdEUVn1Tk1C-i4nHgXt_ZC5dfSedyHIypiu3GOq8ROkry8g3b5uSQQb8wb6uloxcEi71Z0', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', NULL, NULL, NULL, 'active', 1760317874, 1760317874, 20, 1760317874),
(10, 'e0Z-jeNAS5tQw-tg8YRwg-:APA91bFqHUWfuJul0bXBvI2t3VJgHGWVnLGVcPzvZUBNvB-iPKMe98kpmpt1l7W--P85y9xu4ynSRBwvC6zI3w2_W_UgZKbEOKCPa3xfO815Efle6voX2zY', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0', NULL, NULL, NULL, 'active', 1760317874, 1760317874, 20, 1760317874),
(11, 'e0Z-jeNAS5tQw-tg8YRwg-:APA91bErqWJfruq_QLPWn3griq4rtBy1I0gvjkxuaj5DArgC8xKG4BoqllFuRbwReiDeZoZS1yqPniABaFKGr8Ss9MUOIRdIz_qV3uhBlB4lCinsC1zf908', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0', NULL, NULL, NULL, 'active', 1765923931, 1760317875, 20, 1765923931),
(12, 'cpY9qc-Z1qIwk7_2DsY0Yi:APA91bFQsYrj9svzuOsF9SM1CY_rNAOFpmQR4UN2rIq4WmEwzXQ10aQtzxUo5W9AfoK03sUqeZqAZSplfgUPFVMe5TVJYKLIV7keNvQLrF__WBgLbB8cxuA', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1760404170, 1760404170, 20, 1760404170),
(13, 'cpY9qc-Z1qIwk7_2DsY0Yi:APA91bEXW30gVaJtceOgFXAA57lzPv5rFXw4ZeUV9Y7LTbuuAU8p3K5RrgXV4N20k_PRekgyMRWncMkecp5caQrNncpfp6u158OWI3gciwWQd0bCseWOqSA', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1760404171, 1760404171, 20, 1760404171),
(14, 'cpY9qc-Z1qIwk7_2DsY0Yi:APA91bHvMv3s2gfblXJlTV19obPSZTQc2cTIWxlWr-hNZpW3FRD7fXEiH_5Y-kGjyBBJ3ByUYZJ_WzAyqUrrR8GpM068A5T1wrWc-UQhs0FTfr6xkn_OVME', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1760404534, 1760404171, 20, 1760404534),
(15, 'ewoKgCjGa39A74arooaiNQ:APA91bEDvH7qbb2ynF0y5fJtWkRClsHSMThoaoIL8fdjpONRjFmAL9UqwVm_iJ6RRgtgPYE3ejtWvmNzY03v6mLcZDQhEbyIRL8C4sxhas4wJTsTxEn2KqE', 'web', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1', NULL, NULL, NULL, 'active', 1760756213, 1760756213, 20, 1760756213),
(16, 'ewoKgCjGa39A74arooaiNQ:APA91bFp-0CEZ-YkvH1oo1soBROMUpypvuz5KUz-Ph32mTfVgrkWSLxjKPzhGzfcucrzwm-xydFsb_iQxpM7_PPCrgBQcDYn5hHE4z1to3B898mWcv1UsiQ', 'web', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', NULL, NULL, NULL, 'active', 1765247419, 1760756213, 20, 1765247419),
(17, 'caJHL-dM-M5IOUAMe5cr3a:APA91bHdEx29rbXcKGzRAoDdcBtGNxorigqbhi3Sc-d_Aoxgp22tK9_JFRtev4GUTYiABKEKpa8AgCAvSpN0LNfZGs5GsOoMypZHe4w1CsK3etfsuJPASoA', 'web', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', NULL, NULL, NULL, 'active', 1766377622, 1765253652, 20, 1766377622),
(18, 'caJHL-dM-M5IOUAMe5cr3a:APA91bF4pagm2OCPJXSxmaxm1ajS2SrurK3Hpmo2GuhlWyDHUkdYmCbQpiKdjaG-e2BTGHn3jUDQbiQ-0CyiJu7n3pZptckTTUPFZRQJvxrsOsTH9EFq41s', 'web', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1', NULL, NULL, NULL, 'active', 1765253652, 1765253652, 20, 1765253652),
(19, 'fUT877fYeV15zSmTT2-H8t:APA91bGJ6fwOHm7u8qLmYT675BE2R6rQw-VZu-zbEr210sLU-RGFQimgTgHIiVy8NVxCM4jX5UXmPOXl48m-rF71-ya9lNOOGVYUCSQta3t3LA6zmIurV7c', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', NULL, NULL, NULL, 'active', 1770792243, 1769398920, 21, 1770796031),
(20, 'cOtGnQ7tzYJa7vXPvvETub:APA91bGyUZPsvD31lTonNitbAeNeVwEQjMXuUZBUws6XA4t2ts93bo96SmN7LdrZR-KgOztdRpzPBaTJhAgZ67WJN0TmN-0LCRyN2cn3Z4NKoCYt8benxtc', 'web', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', NULL, NULL, NULL, 'active', 1769430588, 1769430588, 20, 1769430588),
(21, 'cOtGnQ7tzYJa7vXPvvETub:APA91bFoUFpAAYJU-7MpnYL802A8fjoxZY-_1GF0wcvZvtb6ToCzfFt7QuoGdlhRp7UTkH5sn6sThBF8dKN_HyFVCOQxg7dI1FSqnaaghlk5APm0AAfsZnQ', 'web', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', NULL, NULL, NULL, 'active', 1770102963, 1769430588, 20, 1770798602),
(22, 'eEFa4FNY_bBw-Q2zxlMja-:APA91bE8JkJekCWJ7gh0WWjJ_zPcTxSdRo4qBCVZ-FiJKRuMN5x6y_URcNZSZ1UDtMhgMpiWFcANIgHTOUGyulP25nFEE0F49vNCqc7ocSApofBjRQFb3iQ', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770780728, 1770780728, 27, 1770780728),
(23, 'eEFa4FNY_bBw-Q2zxlMja-:APA91bEa_SOjybFcf4v8L6Z_5TjpsdD6fWO7ZnmSBCA5QR12mCpxRzy4sLUqaobhcQ2KuGqk_Z7WomYt41UeVE4Iy1F0sVS2cmv8zSoZXdPtaAZIqPdmTgg', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770780728, 1770780728, 27, 1770780728),
(24, 'eEFa4FNY_bBw-Q2zxlMja-:APA91bEXHyvHcQbItJUZcbpP9Cfzwoo07AXPVPrOAYnFa5qTvjVhUwbBJW9Krue3lvl4qGJmBlSBdl5ialHfDEjmSUUkHB8vGfXkwz-ZXVtD2byU9ANL_6k', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770780728, 1770780728, 27, 1770780728),
(25, 'eEFa4FNY_bBw-Q2zxlMja-:APA91bF1f4fc5vYAGJqV7tjMWdNlMX2rXFqxnf0H8JhTfmGSEje3IbpvqHXdU6KSlTYAFjEZNXL5cn8cb0hSF09YhGPwJz1Qyr2Hf_MeqT6jEkDQkxQ93ZM', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770791904, 1770780728, 27, 1770800137),
(26, 'cedi8HqxiJSvv0cZGXW9F8:APA91bEjHBjCMBcgI9sSfFevVEFbZ__aNt4hTVCwW8axxI3pBhffsfHVFjj73fIMTiwni4lNwRlV342NFK6SQZZoJ6OalD6Js93pXCu3Q1wTrK_fV3oAu2Y', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770795086, 1770795086, 19, 1770795086),
(27, 'cedi8HqxiJSvv0cZGXW9F8:APA91bHzGlYOeeV2lq3J8Gf2a1Y4bKbggSw6krrCx4NIC61UtNRdFcoQbof8xjzldquTPgJTpA8R88yi84DhWaJjkMWAnbqtZhXgsbzh7W_FLmoxMs3j7-0', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770795087, 1770795087, 19, 1770795087),
(28, 'cedi8HqxiJSvv0cZGXW9F8:APA91bGePjEyeCPc94l0JxtOp41UjfSQJsrRxWnfHnTFGwXyW1oaS3jKmyoAWS1Y0PKc11OvBQRUTNSdBS6GRY8_vs8hCbsDJvU16gRreZfQA-TsRZZrm8U', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770795087, 1770795087, 19, 1770795087),
(29, 'cedi8HqxiJSvv0cZGXW9F8:APA91bHNdF91zpTYulu284yEpQbtN1sRPkdpNzyM_x_L_s7M-L5VsH_vQwxgdPFmTyllMZI-eH6R7zMbnTsuA2eA1RIE8s5Uz6I4DjUsvMg1lbvxKF74Xss', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770795087, 1770795087, 19, 1770795087),
(30, 'fMKvFar0ErT4LymbHMmXlz:APA91bFQ1LkV8whFsT85SycY5q54M1K5XsNvryGzEitipLjn7U_Qg2-tUz3geLIMCX_xH5zgbuxeqxUN3XalWmh4XliwVd01XL1YMcmRYUGj4Vrczw1XBIo', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770795716, 1770795716, 26, 1770801753),
(31, 'fUT877fYeV15zSmTT2-H8t:APA91bGJ6fwOHm7u8qLmYT675BE2R6rQw-VZu-zbEr210sLU-RGFQimgTgHIiVy8NVxCM4jX5UXmPOXl48m-rF71-ya9lNOOGVYUCSQta3t3LA6zmIurV7c', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', NULL, NULL, NULL, 'active', 1770796045, 1770796045, 28, 1770796462),
(32, 'fUT877fYeV15zSmTT2-H8t:APA91bGJ6fwOHm7u8qLmYT675BE2R6rQw-VZu-zbEr210sLU-RGFQimgTgHIiVy8NVxCM4jX5UXmPOXl48m-rF71-ya9lNOOGVYUCSQta3t3LA6zmIurV7c', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', NULL, NULL, NULL, 'active', 1770796554, 1770796554, 29, 1770802694),
(33, 'eFTorKCPaLcUWf64RM2XDj:APA91bG15baN-kEf6N6bw-o0cHvuEnrxLdKfvuD5kfs3nHLi5FLfG9iboR2LrTLUqHictwjLOxDo8cNJ7l-U9coNgK9BqS8eBvMk8ActnjsLC-ZSUi5qTuA', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770799792, 1770799792, 35, 1770799792),
(34, 'eFTorKCPaLcUWf64RM2XDj:APA91bFiFB6by-UPUTLslkFvELTWMxwcQpf73POdmGQwPNSO1ASU-VZvsMCom8rcVZFaM3lONKcU_f2CTFLJKzVrcu3INXKRgjows4uWp-RnAmfevwU91vk', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770799792, 1770799792, 35, 1770799792),
(35, 'eFTorKCPaLcUWf64RM2XDj:APA91bHHfTAPGWMAOmmCYFZt4tRkK9lvY8lMNkjTJ-BOxkXeqnr8gUBWC8Y3i-BPSI8wMJQojeNEg_g6iv73NyBKG9B8532Boo5PRY00H7j0B5iAIVSQgOg', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770799792, 1770799792, 35, 1770799792),
(36, 'eFTorKCPaLcUWf64RM2XDj:APA91bH6fO95lAnSwDtG0JY3PC3sRG4LghsmQY37szbY-nKG0LJP2p5yE9yYdfakadAZ41U-0MuJDGTlPR4gfwydAD2CAq_KX8GSFydVSnxiN2U1UIB-Rtk', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770799792, 1770799792, 35, 1770799792),
(37, 'edtiLEiIm_flgi6bnQGkHV:APA91bGoscur9-b7Cn4IWNZxWbJu-nwT5T7YmqmukBY9QFPUl9PHeqIDib_Zr0LFZr9B_HK-Orm2ln_La6nA5SXTUg2R89vRDSU_uZ-sC-CH-tuyxW_K5eQ', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770800603, 1770800603, 36, 1770800603),
(38, 'edtiLEiIm_flgi6bnQGkHV:APA91bF2zQTDtRpu7KeEtDexJYX5PqeT63OW7RXXaFXoOvkbOLQYJiPiX1aheYHROHnZSmMQuS8xtDlQpTup1_xNljo_Ty2GAVVO9m0BhPTO0nw5zP63_Tc', 'web', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, 'active', 1770800603, 1770800603, 36, 1770800603),
(39, 'fScDqhq7kJvniwb7a-qDcW:APA91bHCeLLH-XRf9VMJjbINR4Q9J9WC6Qakx5NWj7AhTHB1wq3d4QCaS6vV8CHTjjeb1OFw5ht4X7NHa1EFPM0NBWBVjE02Ls6fJnUWx9H0yQ1HyuJskbo', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', NULL, NULL, NULL, 'active', 1770805433, 1770805433, 30, 1771817551),
(41, 'fpFSJ-lBO6zrEKDp1fi_vL:APA91bE-wGDp1UkRohX80Vm8jkum4PohXeZnVHeZEfbFjQ1Q4S38qUJCvWUQlIaTne3HJnrDIGtWILz69JrmA08jr-5CmeL0g6K9cwuZ8nHxbDKB4bSeDLE', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', NULL, NULL, NULL, 'active', 1771383353, 1771383353, 30, 1771386566);

-- --------------------------------------------------------

--
-- Table structure for table `performance_config`
--

DROP TABLE IF EXISTS `performance_config`;
CREATE TABLE `performance_config` (
  `perf_config_id` int UNSIGNED NOT NULL,
  `title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `tags` json DEFAULT NULL,
  `score_default` smallint NOT NULL,
  `is_active` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'true',
  `created` int UNSIGNED NOT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated` int UNSIGNED NOT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL,
  `tag_type` varchar(32) GENERATED ALWAYS AS (json_unquote(json_extract(`tags`,_utf8mb4'$.type'))) STORED,
  `tag_bucket` varchar(16) GENERATED ALWAYS AS (json_unquote(json_extract(`tags`,_utf8mb4'$.bucket'))) STORED,
  `tag_days` int GENERATED ALWAYS AS (cast(json_unquote(json_extract(`tags`,_utf8mb4'$.days')) as signed)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `performance_config`
--

INSERT INTO `performance_config` (`perf_config_id`, `title`, `description`, `tags`, `score_default`, `is_active`, `created`, `created_by`, `updated`, `updated_by`) VALUES
(1, 'Late to Work', 'Clock-in melewati jam mulai shift', '{\"type\": \"attendance_late\"}', -1, 'true', 1760263772, NULL, 1760263772, NULL),
(2, 'Miss Deadline (H+0)', 'Baru lewat deadline (hari H)', '{\"days\": 0, \"type\": \"deadline_miss\", \"bucket\": \"late\"}', -3, 'true', 1760263772, NULL, 1760263772, NULL),
(3, 'Miss Deadline H+3 (step)', 'Tambahan penalti saat lewat 3 hari', '{\"days\": 3, \"type\": \"deadline_miss\", \"bucket\": \"late\"}', -2, 'true', 1760263772, NULL, 1760263772, NULL),
(4, 'Miss Deadline H+7 (step)', 'Tambahan penalti saat lewat 7 hari', '{\"days\": 7, \"type\": \"deadline_miss\", \"bucket\": \"late\"}', -5, 'true', 1760263772, NULL, 1760263772, NULL),
(5, 'Complete Task (on deadline)', 'Selesai tepat di hari deadline', '{\"type\": \"task_complete\", \"bucket\": \"on_deadline\"}', 0, 'true', 1760263772, NULL, 1760263772, NULL),
(6, 'Complete Task H-1', 'Selesai 1 hari lebih cepat', '{\"days\": 1, \"type\": \"task_complete\", \"bucket\": \"early\"}', 1, 'true', 1760263772, NULL, 1760263772, NULL),
(7, 'Complete Task H-3', 'Selesai 3 hari lebih cepat', '{\"days\": 3, \"type\": \"task_complete\", \"bucket\": \"early\"}', 2, 'true', 1760263772, NULL, 1760263772, NULL),
(8, 'Complete Task H-7', 'Selesai 7 hari lebih cepat', '{\"days\": 7, \"type\": \"task_complete\", \"bucket\": \"early\"}', 3, 'true', 1760263772, NULL, 1760263772, NULL),
(9, 'Complete Overdue Task', 'Task selesai walau overdue', '{\"type\": \"task_complete\", \"bucket\": \"overdue\"}', 2, 'true', 1760263772, NULL, 1760263772, NULL),
(10, 'Not Filling Timesheet', 'Tidak mengisi timesheet di hari berjalan', '{\"type\": \"timesheet_missing\"}', -5, 'true', 1760263772, NULL, 1760263772, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `performance_event_log`
--

DROP TABLE IF EXISTS `performance_event_log`;
CREATE TABLE `performance_event_log` (
  `perf_event_id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `event_date` date NOT NULL,
  `period_year` smallint UNSIGNED NOT NULL,
  `period_month` tinyint UNSIGNED NOT NULL,
  `period_start_date` date NOT NULL,
  `perf_config_id` int UNSIGNED NOT NULL,
  `score_value` smallint NOT NULL,
  `source` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ref_id` bigint UNSIGNED DEFAULT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `created` int UNSIGNED NOT NULL,
  `created_by` int UNSIGNED DEFAULT NULL,
  `updated` int UNSIGNED NOT NULL,
  `updated_by` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `performance_monthly_score`
--

DROP TABLE IF EXISTS `performance_monthly_score`;
CREATE TABLE `performance_monthly_score` (
  `perf_month_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `period_year` smallint NOT NULL,
  `period_month` tinyint NOT NULL,
  `period_start_date` date NOT NULL,
  `base_score` tinyint NOT NULL DEFAULT '100',
  `delta_sum` smallint NOT NULL DEFAULT '0',
  `final_score` tinyint NOT NULL DEFAULT '100',
  `last_event` int DEFAULT NULL,
  `below70_notified` int DEFAULT NULL,
  `is_full_100` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false',
  `consec_100_count` tinyint NOT NULL DEFAULT '0',
  `incentive_awarded_at` int DEFAULT NULL,
  `created` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int NOT NULL,
  `updated_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pitching`
--

DROP TABLE IF EXISTS `pitching`;
CREATE TABLE `pitching` (
  `pitching_id` int NOT NULL,
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `uuid` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `team_involve` json DEFAULT NULL,
  `json_data` json DEFAULT NULL,
  `progress` int DEFAULT NULL,
  `team` json DEFAULT NULL,
  `created` datetime NOT NULL,
  `created_by` int NOT NULL,
  `updated` datetime NOT NULL,
  `updated_by` int NOT NULL,
  `deleted` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `published` enum('drafted','published','unpublished') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `type` enum('pitching','invoice') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
CREATE TABLE `project` (
  `project_id` int NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `max_hours` int DEFAULT NULL,
  `project_type` json DEFAULT NULL,
  `maintenance` enum('true','false') DEFAULT 'false',
  `currency` enum('idr','usd','sgd') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'idr',
  `currency_value` int DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `terms_of_payment` int DEFAULT NULL,
  `published` enum('drafted','published','unpublished') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `status` enum('remaining','overdue','pending','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'remaining',
  `task` json DEFAULT NULL,
  `teams` json DEFAULT NULL,
  `completed` int DEFAULT NULL,
  `remaining` int DEFAULT NULL,
  `overdue` int DEFAULT NULL,
  `progress` int DEFAULT NULL,
  `type` enum('pitching','project') DEFAULT NULL,
  `is_overdue` enum('true','false') DEFAULT NULL,
  `created` int NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated` int NOT NULL DEFAULT '0',
  `updated_by` int NOT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`project_id`, `title`, `client_id`, `due_date`, `start_date`, `max_hours`, `project_type`, `maintenance`, `currency`, `currency_value`, `duration`, `terms_of_payment`, `published`, `status`, `task`, `teams`, `completed`, `remaining`, `overdue`, `progress`, `type`, `is_overdue`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(197, 'Project 2', 46, '2025-09-30', '2025-09-24', 30, '[8, 9, 11]', 'false', 'idr', 1700000, 6, 4, 'published', 'remaining', NULL, '[15, 19]', NULL, NULL, NULL, NULL, 'project', NULL, 1758660038, 19, 1759315835, 19, NULL, NULL),
(212, 'new pitching', NULL, '2025-10-09', NULL, NULL, '[11, 10]', 'false', NULL, NULL, NULL, NULL, 'drafted', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, 'pitching', NULL, 1759203996, 19, 1759203996, 19, NULL, NULL),
(213, 'New Pitching 3', NULL, '2025-10-10', NULL, NULL, '[10, 8]', 'false', NULL, NULL, NULL, NULL, 'drafted', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, 'pitching', NULL, 1759213587, 19, 1759213587, 19, NULL, NULL),
(214, 'Project ke 3', 47, '2025-10-10', '2025-09-30', 20, '[10]', 'false', 'idr', 110000, 3, 3, 'published', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1759214331, 19, 1759214471, 19, NULL, NULL),
(215, 'Pitching 434', 48, '2025-10-11', NULL, NULL, '[11]', 'false', NULL, NULL, NULL, NULL, 'drafted', 'pending', NULL, '[15, 19]', NULL, NULL, NULL, NULL, 'pitching', NULL, 1759217540, 19, 1759217540, 19, NULL, NULL),
(218, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1760013872, 24, 1760013872, 24, NULL, NULL),
(219, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1760338665, 25, 1760338665, 25, NULL, NULL),
(220, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1760413106, 24, 1760413106, 24, NULL, NULL),
(221, 'Mobile App Oven ROTI', 50, '2026-10-31', '2025-11-01', 100, '[14]', 'true', 'idr', 100000000, 12, 6, 'published', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1761546324, 25, 1761549924, 25, NULL, NULL),
(222, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1761719244, 19, 1761719244, 19, NULL, NULL),
(223, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1765541215, 19, 1765541215, 19, NULL, NULL),
(224, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1765541223, 19, 1765541223, 19, NULL, NULL),
(225, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1765541238, 19, 1765541238, 19, NULL, NULL),
(226, NULL, 47, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1765541247, 19, 1765541247, 19, NULL, NULL),
(227, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770781002, 25, 1770781002, 25, NULL, NULL),
(228, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770781019, 25, 1770781019, 25, NULL, NULL),
(229, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770796245, 28, 1770796245, 28, NULL, NULL),
(230, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770796250, 28, 1770796250, 28, NULL, NULL),
(231, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770796255, 28, 1770796255, 28, NULL, NULL),
(232, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770796305, 28, 1770796305, 28, NULL, NULL),
(233, 'new pitching', 53, '2026-02-11', NULL, NULL, '[12, 13]', 'false', 'idr', NULL, NULL, NULL, 'published', 'remaining', NULL, '[25, 23, 22]', NULL, NULL, NULL, NULL, 'pitching', NULL, 1770798234, 29, 1770798234, 29, NULL, NULL),
(234, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770799192, 29, 1770799192, 29, NULL, NULL),
(235, 'Sony Music Store', 55, '2026-02-20', '2026-02-11', 11, '[12, 14]', 'true', 'idr', 50000000, 3, 30, 'published', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770799263, 29, 1770799360, 29, NULL, NULL),
(236, 'Social Media Maintenance 2026', 56, '2026-12-31', '2026-01-01', 480, '[14]', 'true', 'idr', 0, 12, 1, 'published', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770799350, 27, 1770799943, 27, NULL, NULL),
(237, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770799416, 29, 1770799416, 29, NULL, NULL),
(238, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770800127, 27, 1770800127, 27, NULL, NULL),
(239, NULL, NULL, NULL, NULL, NULL, NULL, 'false', 'idr', NULL, NULL, NULL, 'drafted', 'remaining', NULL, NULL, NULL, NULL, NULL, NULL, 'project', NULL, 1770801780, 29, 1770801780, 29, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_purchase_order`
--

DROP TABLE IF EXISTS `project_purchase_order`;
CREATE TABLE `project_purchase_order` (
  `po_id` int NOT NULL,
  `pq_id` int NOT NULL COMMENT 'Foreign key ke project_quotation',
  `po_number` varchar(255) NOT NULL,
  `po_doc` varchar(255) DEFAULT NULL,
  `created` int NOT NULL,
  `created_by` int NOT NULL,
  `updated` int NOT NULL,
  `updated_by` int NOT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_purchase_order`
--

INSERT INTO `project_purchase_order` (`po_id`, `pq_id`, `po_number`, `po_doc`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(5, 108, 'PO1246327354', '/uploads/po/1758661509967-647735943.png', 1758661509, 19, 1758668521, 19, 1758668521, 19),
(6, 108, '74943849', '/uploads/po/1758668535459-232530174.png', 1758668535, 19, 1758668535, 19, NULL, NULL),
(7, 109, 'PO123456', '/uploads/po/1761549817061-910710014.xlsx', 1761549817, 25, 1761549817, 25, NULL, NULL),
(8, 110, '2025789455', '/uploads/po/1761550110570-784634935.xlsx', 1761550110, 25, 1761550110, 25, NULL, NULL),
(9, 111, '675675464556', '1770799607132-721285232.png', 1770799607, 29, 1770799607, 29, NULL, NULL),
(10, 113, '8979878997889', '1770799920064-959546288.png', 1770799920, 29, 1770799920, 29, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_quotation`
--

DROP TABLE IF EXISTS `project_quotation`;
CREATE TABLE `project_quotation` (
  `pq_id` int NOT NULL,
  `project_id` int NOT NULL,
  `quotation_number` varchar(255) DEFAULT NULL,
  `quotation_doc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created` int NOT NULL DEFAULT (0),
  `created_by` int NOT NULL,
  `updated` int NOT NULL DEFAULT (0),
  `updated_by` int NOT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_quotation`
--

INSERT INTO `project_quotation` (`pq_id`, `project_id`, `quotation_number`, `quotation_doc`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(102, 184, '6549349', '/uploads/quotations/1754365668837-981675454.jpg', 1754365668, 13, 1754365668, 13, NULL, NULL),
(103, 185, '758495458', '/uploads/quotations/1754365856672-217558438.png', 1754365856, 13, 1754365856, 13, NULL, NULL),
(104, 186, '754857458', '/uploads/quotations/1754367197962-994099932.png', 1754367197, 13, 1754367197, 13, NULL, NULL),
(105, 185, '758495459', '/uploads/quotations/1754365856672-217558438.png', 1754365856, 13, 1754365856, 13, NULL, NULL),
(106, 186, '754857460', '/uploads/quotations/1754367197962-994099932.png', 1754367197, 13, 1754367197, 13, NULL, NULL),
(107, 193, 'Quotation123', '/uploads/quotations/1755760743427-24315311.xlsx', 1755760743, 13, 1755760743, 13, NULL, NULL),
(108, 197, 'Quotation', '/uploads/quotations/1758661481636-26221921.png', 1758661481, 19, 1758661481, 19, NULL, NULL),
(109, 221, '20251012', '/uploads/quotations/1761549723416-542281094.xlsx', 1761549723, 25, 1761549723, 25, NULL, NULL),
(110, 221, '20251178', '/uploads/quotations/1761550083057-757993893.xlsx', 1761550083, 25, 1761550083, 25, NULL, NULL),
(111, 233, '312123123123', '1770799587193-65760849.png', 1770799587, 29, 1770799587, 29, NULL, NULL),
(112, 236, 'AGM/YKI/01/01/2026', '1770799883949-523774473.xlsx', 1770799883, 27, 1770799883, 27, NULL, NULL),
(113, 235, '7868767687678', '1770799911619-853014332.png', 1770799911, 29, 1770799911, 29, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_team`
--

DROP TABLE IF EXISTS `project_team`;
CREATE TABLE `project_team` (
  `pt_id` int UNSIGNED NOT NULL,
  `project_id` int UNSIGNED NOT NULL,
  `task_id` int UNSIGNED DEFAULT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `source` enum('pitching','task','manual') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'task',
  `created` int NOT NULL,
  `created_by` int NOT NULL,
  `updated` int NOT NULL,
  `updated_by` int NOT NULL,
  `deleted` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_team`
--

INSERT INTO `project_team` (`pt_id`, `project_id`, `task_id`, `user_id`, `source`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(1, 216, NULL, 19, 'pitching', 1759370580, 19, 1759370580, 19, NULL, NULL),
(2, 216, NULL, 15, 'pitching', 1759370580, 19, 1759370580, 19, NULL, NULL),
(3, 197, 91, 15, 'task', 1759373335, 19, 1759373335, 19, NULL, NULL),
(4, 197, 92, 19, 'task', 1759739797, 19, 1759739797, 19, NULL, NULL),
(5, 221, 102, 25, 'task', 1761550940, 25, 1761550940, 25, NULL, NULL),
(6, 221, 101, 25, 'task', 1761551318, 25, 1761551318, 25, NULL, NULL),
(7, 221, 107, 25, 'task', 1761552079, 25, 1761552079, 25, NULL, NULL),
(8, 221, 106, 25, 'task', 1761552146, 25, 1761552146, 25, NULL, NULL),
(9, 233, NULL, 25, 'pitching', 1770798234, 29, 1770798234, 29, NULL, NULL),
(10, 233, NULL, 23, 'pitching', 1770798234, 29, 1770798234, 29, NULL, NULL),
(11, 233, NULL, 22, 'pitching', 1770798234, 29, 1770798234, 29, NULL, NULL),
(12, 235, 111, 30, 'task', 1770800458, 29, 1770800458, 29, NULL, NULL),
(13, 235, 112, 29, 'task', 1770800586, 29, 1770800586, 29, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_type`
--

DROP TABLE IF EXISTS `project_type`;
CREATE TABLE `project_type` (
  `pt_id` int NOT NULL,
  `title` varchar(50) NOT NULL DEFAULT '',
  `created` int NOT NULL DEFAULT (0),
  `created_by` int NOT NULL,
  `updated` int NOT NULL DEFAULT (0),
  `updated_by` int NOT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_type`
--

INSERT INTO `project_type` (`pt_id`, `title`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(8, 'type 1', 1754301643, 13, 1754301643, 13, NULL, NULL),
(9, 'Type 3', 1754301649, 13, 1754301649, 13, NULL, NULL),
(10, 'type 2', 1755760705, 13, 1755760705, 13, NULL, NULL),
(11, 'type 4', 1758660157, 19, 1758660157, 19, NULL, NULL),
(12, 'web development', 1761546636, 25, 1761546636, 25, NULL, NULL),
(13, 'web development', 1761546660, 25, 1761546660, 25, NULL, NULL),
(14, 'social media maintenance', 1761546695, 25, 1761546695, 25, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `role_id` int NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `menu_access` json DEFAULT NULL,
  `created` int NOT NULL DEFAULT (0),
  `created_by` int NOT NULL DEFAULT (0),
  `updated` int NOT NULL DEFAULT (0),
  `updated_by` int NOT NULL DEFAULT (0),
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `is_superadmin` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false',
  `is_hod` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false',
  `is_operational_director` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false',
  `is_hrd` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false',
  `is_ae` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `title`, `slug`, `description`, `menu_access`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`, `is_superadmin`, `is_hod`, `is_operational_director`, `is_hrd`, `is_ae`) VALUES
(1, 'Admin', 'admin', '', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 0, 0, 1755497627, 13, NULL, NULL, 'false', 'false', 'false', 'false', 'false'),
(2, 'Account', 'account', '', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 0, 0, 1755812681, 13, NULL, NULL, 'false', 'false', 'false', 'false', 'true'),
(3, 'Finance', 'finance', '', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 0, 0, 0, 0, NULL, NULL, 'false', 'false', 'false', 'false', 'false'),
(4, 'Probation', 'probation', '', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 0, 0, 0, 0, NULL, NULL, 'false', 'false', 'false', 'false', 'false'),
(5, 'IT', 'it', '', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 0, 0, 0, 0, NULL, NULL, 'false', 'false', 'false', 'false', 'false'),
(6, 'Superadmin', 'superadmin', '', '[101, 173, 174, 175, 176, 186, 187, 189, 190, 191, 192, 193, 194, 100, 169, 168, 167, 188, 166, 165, 164, 182, 181, 180, 179, 178, 177, 185, 184, 183, 195, 197, 196, 198]', 0, 0, 1771817226, 30, NULL, NULL, 'true', 'false', 'false', 'false', 'false'),
(7, 'Staff', 'staff', '', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 0, 0, 1755812704, 13, NULL, NULL, 'false', 'false', 'false', 'false', 'false');

-- --------------------------------------------------------

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20250220025729-create-user.js'),
('20250311041814-create-clients.js'),
('20250311042524-create-project.js'),
('20250311044511-create-project-quotation.js'),
('20250311045231-create-project-type.js'),
('20250320030300-create-brand.js');

-- --------------------------------------------------------

--
-- Table structure for table `setting`
--

DROP TABLE IF EXISTS `setting`;
CREATE TABLE `setting` (
  `node_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `var_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `form_type` enum('text','upload','texteditor','html') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('home','website') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'website',
  `ordered` int UNSIGNED DEFAULT NULL,
  `published` enum('publish','unpublish','review') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'unpublish',
  `created_by` int UNSIGNED NOT NULL,
  `created` int UNSIGNED NOT NULL DEFAULT (0),
  `updated_by` int UNSIGNED NOT NULL,
  `updated` int UNSIGNED NOT NULL,
  `deleted` int UNSIGNED DEFAULT NULL,
  `deleted_by` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `setting`
--

INSERT INTO `setting` (`node_id`, `title`, `var_name`, `description`, `form_type`, `type`, `ordered`, `published`, `created_by`, `created`, `updated_by`, `updated`, `deleted`, `deleted_by`) VALUES
(78, 'Start Attendance', 'start_attendance', '05:30', 'text', 'website', NULL, 'publish', 13, 1757221833, 13, 1757221833, NULL, NULL),
(79, 'Late Attendance', 'late_cutoff', '09:30', 'text', 'website', NULL, 'publish', 13, 1757221833, 13, 1757221833, NULL, NULL),
(80, 'Notification taskAssignment (In-App)', 'notification_taskAssignment_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757390262, NULL, NULL),
(81, 'Notification taskOverdue (In-App)', 'notification_taskOverdue_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757390968, NULL, NULL),
(82, 'Notification lateToWork (In-App)', 'notification_lateToWork_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(83, 'Notification approval (In-App)', 'notification_approval_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757391837, NULL, NULL),
(84, 'Notification reschedule (In-App)', 'notification_reschedule_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(85, 'Notification reimbursement (In-App)', 'notification_reimbursement_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(86, 'Notification reminderToFollowUp (In-App)', 'notification_reminderToFollowUp_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(87, 'Notification clientHaveOverdueInvoice (In-App)', 'notification_clientHaveOverdueInvoice_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(88, 'Notification collection (In-App)', 'notification_collection_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(89, 'Notification overbudget (In-App)', 'notification_overbudget_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(90, 'Notification overtimeLimit (In-App)', 'notification_overtimeLimit_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(91, 'Notification newInvoice (In-App)', 'notification_newInvoice_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(92, 'Notification Sales (In-App)', 'notification_Sales_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(93, 'Notification TaskCompletion (In-App)', 'notification_TaskCompletion_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(94, 'Notification memberOverdue (In-App)', 'notification_memberOverdue_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL),
(95, 'Notification revenue (In-App)', 'notification_revenue_in_app', 'true', 'text', 'website', NULL, 'unpublish', 1, 1757387860, 1, 1757387860, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
CREATE TABLE `task` (
  `task_id` int UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ts_id` int UNSIGNED DEFAULT NULL COMMENT 'table task_subtasks',
  `parent_id` int UNSIGNED DEFAULT NULL,
  `project_id` int UNSIGNED DEFAULT NULL,
  `pq_id` int UNSIGNED DEFAULT NULL,
  `po_id` int UNSIGNED DEFAULT NULL,
  `description` text,
  `priority` enum('low','medium','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'medium',
  `todo` enum('new','in_progress','need_review','revision','done','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'new',
  `client_review` enum('review','revise','done') DEFAULT NULL,
  `is_overdue` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `is_revise` enum('true','false') DEFAULT 'false',
  `revise_count` int UNSIGNED DEFAULT '0',
  `start_date` int DEFAULT NULL,
  `end_date` int DEFAULT NULL,
  `last_version` text,
  `allotted_time` varchar(50) DEFAULT NULL,
  `department` json DEFAULT NULL,
  `progress` int DEFAULT NULL,
  `count_task_child` int DEFAULT NULL,
  `count_task_child_completed` int DEFAULT NULL,
  `count_revision` int DEFAULT NULL,
  `start_revision` int DEFAULT NULL,
  `end_revision` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `updated` int NOT NULL,
  `deleted_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `task`
--

INSERT INTO `task` (`task_id`, `title`, `ts_id`, `parent_id`, `project_id`, `pq_id`, `po_id`, `description`, `priority`, `todo`, `client_review`, `is_overdue`, `tags`, `is_revise`, `revise_count`, `start_date`, `end_date`, `last_version`, `allotted_time`, `department`, `progress`, `count_task_child`, `count_task_child_completed`, `count_revision`, `start_revision`, `end_revision`, `created_by`, `created`, `updated_by`, `updated`, `deleted_by`, `deleted`) VALUES
(109, 'Sony Music Web ', NULL, NULL, 235, 113, 10, 'dawdawdaw', 'medium', 'new', NULL, NULL, NULL, 'false', 0, 1769878800, 1772211600, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 29, 1770800165, 29, 1770800165, NULL, NULL),
(110, 'Sony APPS', NULL, NULL, 235, 113, 10, 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', 'urgent', 'new', NULL, NULL, NULL, 'false', 0, 1770742800, 1835370000, NULL, NULL, '[{\"title\": \"IT\", \"department_id\": 6}, {\"title\": \"Content\", \"department_id\": 5}]', 0, 3, 0, NULL, NULL, NULL, 29, 1770800302, 30, 1770806459, NULL, NULL),
(111, 'Backend Web Shopify', 53, 110, 235, 113, 10, NULL, 'medium', 'new', NULL, 'false', NULL, 'false', 0, 1770800467, 1770829200, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 29, 1770800404, 29, 1770801671, NULL, NULL),
(112, 'Frontend Web Shopify', 53, 110, 235, 113, 10, NULL, 'medium', 'in_progress', NULL, 'false', NULL, 'false', 0, 1770801745, 1772211600, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 29, 1770800567, 29, 1770801745, NULL, NULL),
(113, 'Backendd', 53, 110, 235, 113, 10, NULL, 'medium', 'new', NULL, 'false', NULL, 'false', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 30, 1770806459, 30, 1770806459, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `task_assignment`
--

DROP TABLE IF EXISTS `task_assignment`;
CREATE TABLE `task_assignment` (
  `assignment_id` int NOT NULL,
  `task_id` int UNSIGNED NOT NULL,
  `user_id` int NOT NULL,
  `created` int NOT NULL,
  `created_by` int NOT NULL DEFAULT (0),
  `updated` int NOT NULL,
  `updated_by` int NOT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `task_assignment`
--

INSERT INTO `task_assignment` (`assignment_id`, `task_id`, `user_id`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(37, 112, 29, 1770800586, 29, 1770800586, 29, NULL, NULL),
(39, 111, 30, 1770801671, 29, 1770801671, 29, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `task_attachment`
--

DROP TABLE IF EXISTS `task_attachment`;
CREATE TABLE `task_attachment` (
  `attachment_id` int NOT NULL,
  `revision_id` int DEFAULT NULL,
  `is_star` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'false',
  `task_id` int NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `real_filename` varchar(255) DEFAULT NULL,
  `filepath` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `filetype` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `filesize` int DEFAULT NULL,
  `user_payload` json DEFAULT NULL,
  `task_payload` json DEFAULT NULL,
  `created_by` int NOT NULL DEFAULT (0),
  `created` int NOT NULL DEFAULT (0),
  `updated_by` int NOT NULL DEFAULT (0),
  `updated` int NOT NULL DEFAULT (0),
  `deleted_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `task_attachment`
--

INSERT INTO `task_attachment` (`attachment_id`, `revision_id`, `is_star`, `task_id`, `filename`, `real_filename`, `filepath`, `filetype`, `filesize`, `user_payload`, `task_payload`, `created_by`, `created`, `updated_by`, `updated`, `deleted_by`, `deleted`) VALUES
(109, 111, 'false', 111, '1770800473822-8fa9c9b974bd-cuplikan-layar-2026-02-11-154933.png', 'Cuplikan layar 2026-02-11 154933.png', NULL, NULL, NULL, '{\"exp\": 1773392455, \"iat\": 1770800455, \"jti\": \"0d719a2f-0e82-434c-bc0b-12f6158de584\", \"sub\": \"107715132101667241061\", \"name\": \"Diki Subagja\", \"uuid\": \"4057a3d9-c01e-44f1-8bec-68b85fea57f6\", \"email\": \"diki@vp-digital.com\", \"is_ae\": \"false\", \"phone\": \"085860881609\", \"is_hod\": \"false\", \"is_hrd\": \"false\", \"status\": \"active\", \"address\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"created\": 1770796553, \"deleted\": null, \"picture\": \"https://lh3.googleusercontent.com/a/ACg8ocKkmzuAYVki7StNer1JAWIh2j357fxY11JgxVL-0fEI38WxqFb1=s96-c\", \"updated\": 1770796553, \"user_id\": 29, \"currency\": \"idr\", \"fullname\": \"Diki Subagja\", \"password\": null, \"bank_code\": null, \"birthdate\": \"1995-07-05\", \"join_date\": 1770796553, \"user_role\": \"superadmin\", \"user_type\": \"staff\", \"created_by\": 1, \"deleted_by\": null, \"updated_by\": 1, \"absent_type\": \"timeable\", \"menu_access\": [100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195], \"nationality\": \"Indonesia\", \"npwp_number\": null, \"profile_pic\": \"1770796713702-e556a0399584-cuplikan-layar-2026-02-11-145826.webp\", \"is_timesheet\": \"false\", \"job_position\": \"Frontend Developer\", \"department_id\": null, \"identity_type\": null, \"is_clocked_in\": \"false\", \"is_superadmin\": \"true\", \"bpjs_tk_number\": null, \"marital_status\": \"married\", \"pension_number\": null, \"tax_start_date\": null, \"attendance_type\": \"anywhere\", \"bpjs_kes_number\": null, \"identity_number\": null, \"beneficiary_name\": null, \"bpjs_tk_reg_date\": null, \"performance_year\": 0, \"bpjs_kes_reg_date\": null, \"bpjs_tk_term_date\": null, \"emergency_address\": null, \"emergency_contact\": null, \"performance_score\": 0, \"bpjs_kes_term_date\": null, \"emergency_fullname\": null, \"address_on_identity\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"bank_account_number\": null, \"internship_end_date\": null, \"internship_start_date\": null, \"emergency_relationship\": null, \"is_operational_director\": \"false\"}', '{\"todo\": \"new\", \"po_id\": 10, \"pq_id\": 113, \"title\": \"Backend Web Shopify\", \"ts_id\": 53, \"created\": 1770800404, \"deleted\": null, \"task_id\": 111, \"updated\": 1770800467, \"end_date\": 1770829200, \"priority\": \"medium\", \"progress\": null, \"parent_id\": 110, \"created_by\": 29, \"deleted_by\": null, \"department\": null, \"is_overdue\": \"false\", \"project_id\": 235, \"start_date\": 1770800467, \"updated_by\": 29, \"Attachments\": [], \"description\": null, \"end_revision\": null, \"last_version\": null, \"count_revision\": 0, \"start_revision\": null, \"count_task_child\": null, \"count_task_child_completed\": null}', 29, 1770800474, 29, 1770800474, NULL, NULL),
(110, 111, 'false', 111, '1770800540103-d0a64371ebb1-cuplikan-layar-2026-02-11-160029.png', 'Cuplikan layar 2026-02-11 160029.png', NULL, NULL, NULL, '{\"exp\": 1773392499, \"iat\": 1770800499, \"jti\": \"53b1bda5-f4b1-4bb5-9668-ad865a3d0411\", \"sub\": \"107715132101667241061\", \"name\": \"Diki Subagja\", \"uuid\": \"4057a3d9-c01e-44f1-8bec-68b85fea57f6\", \"email\": \"diki@vp-digital.com\", \"is_ae\": \"false\", \"phone\": \"085860881609\", \"is_hod\": \"false\", \"is_hrd\": \"false\", \"status\": \"active\", \"address\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"created\": 1770796553, \"deleted\": null, \"picture\": \"https://lh3.googleusercontent.com/a/ACg8ocKkmzuAYVki7StNer1JAWIh2j357fxY11JgxVL-0fEI38WxqFb1=s96-c\", \"updated\": 1770796553, \"user_id\": 29, \"currency\": \"idr\", \"fullname\": \"Diki Subagja\", \"password\": null, \"bank_code\": null, \"birthdate\": \"1995-07-05\", \"join_date\": 1770796553, \"user_role\": \"superadmin\", \"user_type\": \"staff\", \"created_by\": 1, \"deleted_by\": null, \"updated_by\": 1, \"absent_type\": \"timeable\", \"menu_access\": [100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195], \"nationality\": \"Indonesia\", \"npwp_number\": null, \"profile_pic\": \"1770796713702-e556a0399584-cuplikan-layar-2026-02-11-145826.webp\", \"is_timesheet\": \"false\", \"job_position\": \"Frontend Developer\", \"department_id\": null, \"identity_type\": null, \"is_clocked_in\": \"false\", \"is_superadmin\": \"true\", \"bpjs_tk_number\": null, \"marital_status\": \"married\", \"pension_number\": null, \"tax_start_date\": null, \"attendance_type\": \"anywhere\", \"bpjs_kes_number\": null, \"identity_number\": null, \"beneficiary_name\": null, \"bpjs_tk_reg_date\": null, \"performance_year\": 0, \"bpjs_kes_reg_date\": null, \"bpjs_tk_term_date\": null, \"emergency_address\": null, \"emergency_contact\": null, \"performance_score\": 0, \"bpjs_kes_term_date\": null, \"emergency_fullname\": null, \"address_on_identity\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"bank_account_number\": null, \"internship_end_date\": null, \"internship_start_date\": null, \"emergency_relationship\": null, \"is_operational_director\": \"false\"}', '{\"todo\": \"new\", \"po_id\": 10, \"pq_id\": 113, \"title\": \"Backend Web Shopify\", \"ts_id\": 53, \"created\": 1770800404, \"deleted\": null, \"task_id\": 111, \"updated\": 1770800467, \"end_date\": 1770829200, \"priority\": \"medium\", \"progress\": null, \"parent_id\": 110, \"created_by\": 29, \"deleted_by\": null, \"department\": null, \"is_overdue\": \"false\", \"project_id\": 235, \"start_date\": 1770800467, \"updated_by\": 29, \"Attachments\": [{\"created\": 1770800474, \"deleted\": null, \"is_star\": \"true\", \"task_id\": 111, \"updated\": 1770800474, \"filename\": \"1770800473822-8fa9c9b974bd-cuplikan-layar-2026-02-11-154933.png\", \"created_by\": 29, \"deleted_by\": null, \"updated_by\": 29, \"revision_id\": null, \"task_payload\": {\"todo\": \"new\", \"po_id\": 10, \"pq_id\": 113, \"title\": \"Backend Web Shopify\", \"ts_id\": 53, \"created\": 1770800404, \"deleted\": null, \"task_id\": 111, \"updated\": 1770800467, \"end_date\": 1770829200, \"priority\": \"medium\", \"progress\": null, \"parent_id\": 110, \"created_by\": 29, \"deleted_by\": null, \"department\": null, \"is_overdue\": \"false\", \"project_id\": 235, \"start_date\": 1770800467, \"updated_by\": 29, \"Attachments\": [], \"description\": null, \"end_revision\": null, \"last_version\": null, \"count_revision\": 0, \"start_revision\": null, \"count_task_child\": null, \"count_task_child_completed\": null}, \"user_payload\": {\"exp\": 1773392455, \"iat\": 1770800455, \"jti\": \"0d719a2f-0e82-434c-bc0b-12f6158de584\", \"sub\": \"107715132101667241061\", \"name\": \"Diki Subagja\", \"uuid\": \"4057a3d9-c01e-44f1-8bec-68b85fea57f6\", \"email\": \"diki@vp-digital.com\", \"is_ae\": \"false\", \"phone\": \"085860881609\", \"is_hod\": \"false\", \"is_hrd\": \"false\", \"status\": \"active\", \"address\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"created\": 1770796553, \"deleted\": null, \"picture\": \"https://lh3.googleusercontent.com/a/ACg8ocKkmzuAYVki7StNer1JAWIh2j357fxY11JgxVL-0fEI38WxqFb1=s96-c\", \"updated\": 1770796553, \"user_id\": 29, \"currency\": \"idr\", \"fullname\": \"Diki Subagja\", \"password\": null, \"bank_code\": null, \"birthdate\": \"1995-07-05\", \"join_date\": 1770796553, \"user_role\": \"superadmin\", \"user_type\": \"staff\", \"created_by\": 1, \"deleted_by\": null, \"updated_by\": 1, \"absent_type\": \"timeable\", \"menu_access\": [100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195], \"nationality\": \"Indonesia\", \"npwp_number\": null, \"profile_pic\": \"1770796713702-e556a0399584-cuplikan-layar-2026-02-11-145826.webp\", \"is_timesheet\": \"false\", \"job_position\": \"Frontend Developer\", \"department_id\": null, \"identity_type\": null, \"is_clocked_in\": \"false\", \"is_superadmin\": \"true\", \"bpjs_tk_number\": null, \"marital_status\": \"married\", \"pension_number\": null, \"tax_start_date\": null, \"attendance_type\": \"anywhere\", \"bpjs_kes_number\": null, \"identity_number\": null, \"beneficiary_name\": null, \"bpjs_tk_reg_date\": null, \"performance_year\": 0, \"bpjs_kes_reg_date\": null, \"bpjs_tk_term_date\": null, \"emergency_address\": null, \"emergency_contact\": null, \"performance_score\": 0, \"bpjs_kes_term_date\": null, \"emergency_fullname\": null, \"address_on_identity\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"bank_account_number\": null, \"internship_end_date\": null, \"internship_start_date\": null, \"emergency_relationship\": null, \"is_operational_director\": \"false\"}, \"attachment_id\": 109, \"real_filename\": \"Cuplikan layar 2026-02-11 154933.png\", \"revisionFiles\": []}], \"description\": null, \"end_revision\": null, \"last_version\": null, \"count_revision\": 0, \"start_revision\": null, \"count_task_child\": null, \"count_task_child_completed\": null}', 29, 1770800540, 29, 1770800540, NULL, NULL),
(111, NULL, 'true', 111, '1770801654170-eeb93bcae30a-cuplikan-layar-2026-02-11-103127.png', 'Cuplikan layar 2026-02-11 103127.png', NULL, NULL, NULL, '{\"exp\": 1773393628, \"iat\": 1770801628, \"jti\": \"63c08764-bf06-43c4-80dd-e986210e17a1\", \"sub\": \"107715132101667241061\", \"name\": \"Diki Subagja\", \"uuid\": \"4057a3d9-c01e-44f1-8bec-68b85fea57f6\", \"email\": \"diki@vp-digital.com\", \"is_ae\": \"false\", \"phone\": \"085860881609\", \"is_hod\": \"false\", \"is_hrd\": \"false\", \"status\": \"active\", \"address\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"created\": 1770796553, \"deleted\": null, \"picture\": \"https://lh3.googleusercontent.com/a/ACg8ocKkmzuAYVki7StNer1JAWIh2j357fxY11JgxVL-0fEI38WxqFb1=s96-c\", \"updated\": 1770796553, \"user_id\": 29, \"currency\": \"idr\", \"fullname\": \"Diki Subagja\", \"password\": null, \"bank_code\": null, \"birthdate\": \"1995-07-05\", \"join_date\": 1770796553, \"user_role\": \"superadmin\", \"user_type\": \"staff\", \"created_by\": 1, \"deleted_by\": null, \"updated_by\": 1, \"absent_type\": \"timeable\", \"menu_access\": [100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195], \"nationality\": \"Indonesia\", \"npwp_number\": null, \"profile_pic\": \"1770796713702-e556a0399584-cuplikan-layar-2026-02-11-145826.webp\", \"is_timesheet\": \"false\", \"job_position\": \"Frontend Developer\", \"department_id\": null, \"identity_type\": null, \"is_clocked_in\": \"false\", \"is_superadmin\": \"true\", \"bpjs_tk_number\": null, \"marital_status\": \"married\", \"pension_number\": null, \"tax_start_date\": null, \"attendance_type\": \"anywhere\", \"bpjs_kes_number\": null, \"identity_number\": null, \"beneficiary_name\": null, \"bpjs_tk_reg_date\": null, \"performance_year\": 0, \"bpjs_kes_reg_date\": null, \"bpjs_tk_term_date\": null, \"emergency_address\": null, \"emergency_contact\": null, \"performance_score\": 0, \"bpjs_kes_term_date\": null, \"emergency_fullname\": null, \"address_on_identity\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"bank_account_number\": null, \"internship_end_date\": null, \"internship_start_date\": null, \"emergency_relationship\": null, \"is_operational_director\": \"false\"}', '{\"todo\": \"new\", \"po_id\": 10, \"pq_id\": 113, \"title\": \"Backend Web Shopify\", \"ts_id\": 53, \"created\": 1770800404, \"deleted\": null, \"task_id\": 111, \"updated\": 1770800591, \"end_date\": 1770829200, \"priority\": \"medium\", \"progress\": null, \"parent_id\": 110, \"created_by\": 29, \"deleted_by\": null, \"department\": null, \"is_overdue\": \"false\", \"project_id\": 235, \"start_date\": 1770800467, \"updated_by\": 29, \"Attachments\": [{\"created\": 1770800540, \"deleted\": null, \"is_star\": \"true\", \"task_id\": 111, \"updated\": 1770800540, \"filename\": \"1770800540103-d0a64371ebb1-cuplikan-layar-2026-02-11-160029.png\", \"created_by\": 29, \"deleted_by\": null, \"updated_by\": 29, \"revision_id\": null, \"task_payload\": {\"todo\": \"new\", \"po_id\": 10, \"pq_id\": 113, \"title\": \"Backend Web Shopify\", \"ts_id\": 53, \"created\": 1770800404, \"deleted\": null, \"task_id\": 111, \"updated\": 1770800467, \"end_date\": 1770829200, \"priority\": \"medium\", \"progress\": null, \"parent_id\": 110, \"created_by\": 29, \"deleted_by\": null, \"department\": null, \"is_overdue\": \"false\", \"project_id\": 235, \"start_date\": 1770800467, \"updated_by\": 29, \"Attachments\": [{\"created\": 1770800474, \"deleted\": null, \"is_star\": \"true\", \"task_id\": 111, \"updated\": 1770800474, \"filename\": \"1770800473822-8fa9c9b974bd-cuplikan-layar-2026-02-11-154933.png\", \"created_by\": 29, \"deleted_by\": null, \"updated_by\": 29, \"revision_id\": null, \"task_payload\": {\"todo\": \"new\", \"po_id\": 10, \"pq_id\": 113, \"title\": \"Backend Web Shopify\", \"ts_id\": 53, \"created\": 1770800404, \"deleted\": null, \"task_id\": 111, \"updated\": 1770800467, \"end_date\": 1770829200, \"priority\": \"medium\", \"progress\": null, \"parent_id\": 110, \"created_by\": 29, \"deleted_by\": null, \"department\": null, \"is_overdue\": \"false\", \"project_id\": 235, \"start_date\": 1770800467, \"updated_by\": 29, \"Attachments\": [], \"description\": null, \"end_revision\": null, \"last_version\": null, \"count_revision\": 0, \"start_revision\": null, \"count_task_child\": null, \"count_task_child_completed\": null}, \"user_payload\": {\"exp\": 1773392455, \"iat\": 1770800455, \"jti\": \"0d719a2f-0e82-434c-bc0b-12f6158de584\", \"sub\": \"107715132101667241061\", \"name\": \"Diki Subagja\", \"uuid\": \"4057a3d9-c01e-44f1-8bec-68b85fea57f6\", \"email\": \"diki@vp-digital.com\", \"is_ae\": \"false\", \"phone\": \"085860881609\", \"is_hod\": \"false\", \"is_hrd\": \"false\", \"status\": \"active\", \"address\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"created\": 1770796553, \"deleted\": null, \"picture\": \"https://lh3.googleusercontent.com/a/ACg8ocKkmzuAYVki7StNer1JAWIh2j357fxY11JgxVL-0fEI38WxqFb1=s96-c\", \"updated\": 1770796553, \"user_id\": 29, \"currency\": \"idr\", \"fullname\": \"Diki Subagja\", \"password\": null, \"bank_code\": null, \"birthdate\": \"1995-07-05\", \"join_date\": 1770796553, \"user_role\": \"superadmin\", \"user_type\": \"staff\", \"created_by\": 1, \"deleted_by\": null, \"updated_by\": 1, \"absent_type\": \"timeable\", \"menu_access\": [100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195], \"nationality\": \"Indonesia\", \"npwp_number\": null, \"profile_pic\": \"1770796713702-e556a0399584-cuplikan-layar-2026-02-11-145826.webp\", \"is_timesheet\": \"false\", \"job_position\": \"Frontend Developer\", \"department_id\": null, \"identity_type\": null, \"is_clocked_in\": \"false\", \"is_superadmin\": \"true\", \"bpjs_tk_number\": null, \"marital_status\": \"married\", \"pension_number\": null, \"tax_start_date\": null, \"attendance_type\": \"anywhere\", \"bpjs_kes_number\": null, \"identity_number\": null, \"beneficiary_name\": null, \"bpjs_tk_reg_date\": null, \"performance_year\": 0, \"bpjs_kes_reg_date\": null, \"bpjs_tk_term_date\": null, \"emergency_address\": null, \"emergency_contact\": null, \"performance_score\": 0, \"bpjs_kes_term_date\": null, \"emergency_fullname\": null, \"address_on_identity\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"bank_account_number\": null, \"internship_end_date\": null, \"internship_start_date\": null, \"emergency_relationship\": null, \"is_operational_director\": \"false\"}, \"attachment_id\": 109, \"real_filename\": \"Cuplikan layar 2026-02-11 154933.png\", \"revisionFiles\": []}], \"description\": null, \"end_revision\": null, \"last_version\": null, \"count_revision\": 0, \"start_revision\": null, \"count_task_child\": null, \"count_task_child_completed\": null}, \"user_payload\": {\"exp\": 1773392499, \"iat\": 1770800499, \"jti\": \"53b1bda5-f4b1-4bb5-9668-ad865a3d0411\", \"sub\": \"107715132101667241061\", \"name\": \"Diki Subagja\", \"uuid\": \"4057a3d9-c01e-44f1-8bec-68b85fea57f6\", \"email\": \"diki@vp-digital.com\", \"is_ae\": \"false\", \"phone\": \"085860881609\", \"is_hod\": \"false\", \"is_hrd\": \"false\", \"status\": \"active\", \"address\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"created\": 1770796553, \"deleted\": null, \"picture\": \"https://lh3.googleusercontent.com/a/ACg8ocKkmzuAYVki7StNer1JAWIh2j357fxY11JgxVL-0fEI38WxqFb1=s96-c\", \"updated\": 1770796553, \"user_id\": 29, \"currency\": \"idr\", \"fullname\": \"Diki Subagja\", \"password\": null, \"bank_code\": null, \"birthdate\": \"1995-07-05\", \"join_date\": 1770796553, \"user_role\": \"superadmin\", \"user_type\": \"staff\", \"created_by\": 1, \"deleted_by\": null, \"updated_by\": 1, \"absent_type\": \"timeable\", \"menu_access\": [100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195], \"nationality\": \"Indonesia\", \"npwp_number\": null, \"profile_pic\": \"1770796713702-e556a0399584-cuplikan-layar-2026-02-11-145826.webp\", \"is_timesheet\": \"false\", \"job_position\": \"Frontend Developer\", \"department_id\": null, \"identity_type\": null, \"is_clocked_in\": \"false\", \"is_superadmin\": \"true\", \"bpjs_tk_number\": null, \"marital_status\": \"married\", \"pension_number\": null, \"tax_start_date\": null, \"attendance_type\": \"anywhere\", \"bpjs_kes_number\": null, \"identity_number\": null, \"beneficiary_name\": null, \"bpjs_tk_reg_date\": null, \"performance_year\": 0, \"bpjs_kes_reg_date\": null, \"bpjs_tk_term_date\": null, \"emergency_address\": null, \"emergency_contact\": null, \"performance_score\": 0, \"bpjs_kes_term_date\": null, \"emergency_fullname\": null, \"address_on_identity\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"bank_account_number\": null, \"internship_end_date\": null, \"internship_start_date\": null, \"emergency_relationship\": null, \"is_operational_director\": \"false\"}, \"attachment_id\": 110, \"real_filename\": \"Cuplikan layar 2026-02-11 160029.png\", \"revisionFiles\": [{\"created\": 1770800474, \"deleted\": null, \"is_star\": \"false\", \"task_id\": 111, \"updated\": 1770800474, \"filename\": \"1770800473822-8fa9c9b974bd-cuplikan-layar-2026-02-11-154933.png\", \"created_by\": 29, \"deleted_by\": null, \"updated_by\": 29, \"revision_id\": 110, \"task_payload\": {\"todo\": \"new\", \"po_id\": 10, \"pq_id\": 113, \"title\": \"Backend Web Shopify\", \"ts_id\": 53, \"created\": 1770800404, \"deleted\": null, \"task_id\": 111, \"updated\": 1770800467, \"end_date\": 1770829200, \"priority\": \"medium\", \"progress\": null, \"parent_id\": 110, \"created_by\": 29, \"deleted_by\": null, \"department\": null, \"is_overdue\": \"false\", \"project_id\": 235, \"start_date\": 1770800467, \"updated_by\": 29, \"Attachments\": [], \"description\": null, \"end_revision\": null, \"last_version\": null, \"count_revision\": 0, \"start_revision\": null, \"count_task_child\": null, \"count_task_child_completed\": null}, \"user_payload\": {\"exp\": 1773392455, \"iat\": 1770800455, \"jti\": \"0d719a2f-0e82-434c-bc0b-12f6158de584\", \"sub\": \"107715132101667241061\", \"name\": \"Diki Subagja\", \"uuid\": \"4057a3d9-c01e-44f1-8bec-68b85fea57f6\", \"email\": \"diki@vp-digital.com\", \"is_ae\": \"false\", \"phone\": \"085860881609\", \"is_hod\": \"false\", \"is_hrd\": \"false\", \"status\": \"active\", \"address\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"created\": 1770796553, \"deleted\": null, \"picture\": \"https://lh3.googleusercontent.com/a/ACg8ocKkmzuAYVki7StNer1JAWIh2j357fxY11JgxVL-0fEI38WxqFb1=s96-c\", \"updated\": 1770796553, \"user_id\": 29, \"currency\": \"idr\", \"fullname\": \"Diki Subagja\", \"password\": null, \"bank_code\": null, \"birthdate\": \"1995-07-05\", \"join_date\": 1770796553, \"user_role\": \"superadmin\", \"user_type\": \"staff\", \"created_by\": 1, \"deleted_by\": null, \"updated_by\": 1, \"absent_type\": \"timeable\", \"menu_access\": [100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195], \"nationality\": \"Indonesia\", \"npwp_number\": null, \"profile_pic\": \"1770796713702-e556a0399584-cuplikan-layar-2026-02-11-145826.webp\", \"is_timesheet\": \"false\", \"job_position\": \"Frontend Developer\", \"department_id\": null, \"identity_type\": null, \"is_clocked_in\": \"false\", \"is_superadmin\": \"true\", \"bpjs_tk_number\": null, \"marital_status\": \"married\", \"pension_number\": null, \"tax_start_date\": null, \"attendance_type\": \"anywhere\", \"bpjs_kes_number\": null, \"identity_number\": null, \"beneficiary_name\": null, \"bpjs_tk_reg_date\": null, \"performance_year\": 0, \"bpjs_kes_reg_date\": null, \"bpjs_tk_term_date\": null, \"emergency_address\": null, \"emergency_contact\": null, \"performance_score\": 0, \"bpjs_kes_term_date\": null, \"emergency_fullname\": null, \"address_on_identity\": \"Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi\", \"bank_account_number\": null, \"internship_end_date\": null, \"internship_start_date\": null, \"emergency_relationship\": null, \"is_operational_director\": \"false\"}, \"attachment_id\": 109, \"real_filename\": \"Cuplikan layar 2026-02-11 154933.png\"}]}], \"description\": null, \"end_revision\": null, \"last_version\": null, \"count_revision\": 0, \"start_revision\": null, \"count_task_child\": null, \"count_task_child_completed\": null}', 29, 1770801654, 29, 1770801654, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `task_comment`
--

DROP TABLE IF EXISTS `task_comment`;
CREATE TABLE `task_comment` (
  `comment_id` int NOT NULL,
  `task_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `comment` text,
  `mentioned_user_ids` json DEFAULT NULL,
  `comment_for` json DEFAULT NULL,
  `mentioned_attachment_ids` json DEFAULT NULL,
  `filename` json DEFAULT NULL,
  `type` enum('activity','comment','reply') DEFAULT NULL,
  `created_by` int NOT NULL DEFAULT (0),
  `created` int NOT NULL,
  `updated_by` int NOT NULL DEFAULT (0),
  `updated` int NOT NULL,
  `deleted_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `task_comment`
--

INSERT INTO `task_comment` (`comment_id`, `task_id`, `user_id`, `comment`, `mentioned_user_ids`, `comment_for`, `mentioned_attachment_ids`, `filename`, `type`, `created_by`, `created`, `updated_by`, `updated`, `deleted_by`, `deleted`) VALUES
(70, 110, 29, 'test @Bayu Nugroho (VP Digital)', '[30]', NULL, '[0]', NULL, 'comment', 29, 1770800873, 29, 1770800873, NULL, NULL),
(71, 110, 29, '@{Diki Subagja} haloo', NULL, NULL, '[0]', NULL, 'comment', 29, 1770800881, 29, 1770800881, NULL, NULL),
(72, 110, 29, 'test comment subtask', NULL, '{\"id\": 112, \"type\": \"task_item\"}', '[0]', NULL, 'comment', 29, 1770801293, 29, 1770801293, NULL, NULL),
(73, 110, 29, 'test comment subtask', NULL, '{\"id\": 112, \"type\": \"task_item\"}', '[0]', NULL, 'comment', 29, 1770801584, 29, 1770801584, NULL, NULL),
(74, 110, 30, 'komentest', NULL, '{\"id\": 112, \"type\": \"task_item\"}', '[0]', NULL, 'comment', 30, 1770806422, 30, 1770806422, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `task_logs`
--

DROP TABLE IF EXISTS `task_logs`;
CREATE TABLE `task_logs` (
  `id` bigint NOT NULL DEFAULT '0',
  `task_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `created_by` int UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` int DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_revision`
--

DROP TABLE IF EXISTS `task_revision`;
CREATE TABLE `task_revision` (
  `revision_id` int UNSIGNED NOT NULL,
  `version` int UNSIGNED NOT NULL DEFAULT '0',
  `task_id` int NOT NULL,
  `request_by` enum('internal','client') NOT NULL DEFAULT 'internal',
  `reason` text NOT NULL,
  `start_revision` int NOT NULL DEFAULT '0',
  `end_revision` int NOT NULL DEFAULT '0',
  `created` int NOT NULL,
  `created_by` int NOT NULL,
  `updated` int NOT NULL,
  `updated_by` int NOT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_subtask`
--

DROP TABLE IF EXISTS `task_subtask`;
CREATE TABLE `task_subtask` (
  `ts_id` int NOT NULL,
  `task_id` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `progress` int DEFAULT '0',
  `created_by` json NOT NULL,
  `created` int NOT NULL,
  `updated_by` json NOT NULL,
  `updated` int NOT NULL,
  `deleted_by` json DEFAULT NULL,
  `deleted` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `task_subtask`
--

INSERT INTO `task_subtask` (`ts_id`, `task_id`, `title`, `progress`, `created_by`, `created`, `updated_by`, `updated`, `deleted_by`, `deleted`) VALUES
(40, 72, 'Subtask 3', 0, '19', 1758676487, '19', 1758676487, NULL, NULL),
(41, 79, 'SUbmit 2', 0, '19', 1758684646, '19', 1758684646, NULL, NULL),
(42, 80, 'subTask', 0, '19', 1758685022, '19', 1758685022, '19', 1),
(44, 80, 'Subtask 1', 0, '19', 1758767083, '19', 1758767083, NULL, NULL),
(45, 80, 'Subtask 2', 0, '19', 1758770412, '19', 1758770412, NULL, NULL),
(46, 80, 'Subtask 3', 0, '19', 1758770431, '19', 1758770431, NULL, NULL),
(47, 80, 'Subtask 5', 0, '19', 1758771697, '19', 1758771697, NULL, NULL),
(48, 80, 'Subtask 6', 0, '19', 1758771706, '19', 1758771706, NULL, NULL),
(49, 80, 'Subtask 6', 0, '19', 1759315252, '19', 1759315252, NULL, NULL),
(50, 97, 'IG FEED 2', 0, '25', 1761550610, '25', 1761552016, NULL, NULL),
(51, 97, 'IG FEED 1', 0, '25', 1761550617, '25', 1761551958, NULL, NULL),
(52, 97, 'IG FEED 3', 0, '25', 1761550732, '25', 1761550732, NULL, NULL),
(53, 110, 'WEB Development', 0, '29', 1770800322, '29', 1770800322, NULL, NULL),
(54, 110, 'WEB Content', 0, '29', 1770800332, '29', 1770800332, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `task_todo`
--

DROP TABLE IF EXISTS `task_todo`;
CREATE TABLE `task_todo` (
  `todo_id` int NOT NULL,
  `task_id` int NOT NULL DEFAULT '0',
  `todo` enum('new','in_progress','need_review','revision','done','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created` int NOT NULL,
  `created_by` int NOT NULL,
  `updated` int NOT NULL,
  `updated_by` int NOT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `task_todo`
--

INSERT INTO `task_todo` (`todo_id`, `task_id`, `todo`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(16, 80, 'new', 1758686482, 19, 1758686482, 19, NULL, NULL),
(17, 80, 'new', 1758752328, 19, 1758752328, 19, NULL, NULL),
(18, 80, 'new', 1758770339, 19, 1758770339, 19, NULL, NULL),
(19, 80, 'new', 1758770462, 19, 1758770462, 19, NULL, NULL),
(20, 80, 'new', 1758814736, 19, 1758814736, 19, NULL, NULL),
(21, 80, 'new', 1758815552, 19, 1758815552, 19, NULL, NULL),
(22, 80, 'new', 1758816320, 19, 1758816320, 19, NULL, NULL),
(23, 80, 'new', 1759315302, 19, 1759315302, 19, NULL, NULL),
(24, 80, 'new', 1759315823, 19, 1759315823, 19, NULL, NULL),
(25, 80, 'new', 1759373327, 19, 1759373327, 19, NULL, NULL),
(26, 80, 'new', 1759739682, 19, 1759739682, 19, NULL, NULL),
(27, 97, 'new', 1761550672, 25, 1761550672, 25, NULL, NULL),
(28, 97, 'new', 1761550771, 25, 1761550771, 25, NULL, NULL),
(29, 97, 'new', 1761551945, 25, 1761551945, 25, NULL, NULL),
(30, 97, 'new', 1761552018, 25, 1761552018, 25, NULL, NULL),
(31, 97, 'new', 1761552043, 25, 1761552043, 25, NULL, NULL),
(32, 97, 'new', 1761723074, 25, 1761723074, 25, NULL, NULL),
(33, 110, 'new', 1770800404, 29, 1770800404, 29, NULL, NULL),
(34, 110, 'new', 1770800567, 29, 1770800567, 29, NULL, NULL),
(35, 110, 'new', 1770806459, 30, 1770806459, 30, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `timesheet`
--

DROP TABLE IF EXISTS `timesheet`;
CREATE TABLE `timesheet` (
  `timesheet_id` int NOT NULL,
  `user_id` int NOT NULL,
  `project_id` int DEFAULT NULL,
  `task_id` int DEFAULT NULL,
  `date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `duration_minutes` int NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `status` enum('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
  `created` int NOT NULL,
  `created_by` int NOT NULL DEFAULT (0),
  `updated` int NOT NULL,
  `updated_by` int NOT NULL DEFAULT (0),
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `timesheet`
--

INSERT INTO `timesheet` (`timesheet_id`, `user_id`, `project_id`, `task_id`, `date`, `start_time`, `end_time`, `duration_minutes`, `description`, `status`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`) VALUES
(20, 19, 221, 101, '2025-12-03', '01:30:00', '02:45:00', 75, NULL, 'approved', 1764836207, 19, 1764836207, 19, NULL, NULL),
(21, 19, 221, 107, '2025-12-04', '04:45:00', '06:45:00', 120, NULL, 'approved', 1764896037, 19, 1764896037, 19, NULL, NULL),
(22, 19, 197, 86, '2025-12-05', NULL, NULL, 165, NULL, 'approved', 1765169258, 19, 1765169258, 19, NULL, NULL),
(23, 19, 221, 101, '2025-12-11', '16:52:00', '18:22:00', 90, NULL, 'approved', 1765533131, 19, 1765533131, 19, NULL, NULL),
(24, 19, 197, 84, '2025-12-12', '09:34:00', '13:19:00', 225, NULL, 'approved', 1765766061, 19, 1765766061, 19, NULL, NULL),
(32, 19, 197, 85, '2026-01-16', '21:58:00', '00:28:00', 150, NULL, 'approved', 1768834736, 19, 1768834736, 19, NULL, NULL),
(33, 21, 197, 82, '2026-01-26', '12:16:00', '17:16:00', 300, NULL, 'approved', 1769404593, 21, 1769404593, 21, NULL, NULL),
(34, 19, 197, 84, '2026-01-26', '07:03:00', '09:33:00', 150, NULL, 'approved', 1769472184, 19, 1769472184, 19, NULL, NULL),
(35, 21, 197, 82, '2026-01-27', '15:00:00', '19:00:00', 240, NULL, 'submitted', 1769500843, 21, 1769500843, 21, NULL, NULL),
(36, 19, 197, 85, '2026-01-28', '11:01:00', '13:46:00', 165, NULL, 'approved', 1769659279, 19, 1769659279, 19, NULL, NULL),
(37, 25, 197, 84, '2026-02-10', '10:36:00', '12:36:00', 120, NULL, 'approved', 1770780977, 25, 1770780977, 25, NULL, NULL),
(38, 19, 197, 84, '2026-02-10', '12:36:00', '15:06:00', 150, NULL, 'approved', 1770788185, 19, 1770788185, 19, NULL, NULL),
(39, 29, 235, 112, '2026-02-10', '16:03:00', '21:03:00', 300, NULL, 'approved', 1770800609, 29, 1770800609, 29, NULL, NULL),
(40, 29, 235, 112, '2026-02-11', '16:26:00', '21:26:00', 300, NULL, 'submitted', 1770801987, 29, 1770802003, 29, 1770802003, 29),
(41, 29, 235, 112, '2026-02-11', '09:00:00', '18:00:00', 540, NULL, 'submitted', 1770802036, 29, 1770802036, 29, NULL, NULL),
(42, 30, 235, 112, '2026-02-10', '17:24:00', '19:09:00', 105, NULL, 'approved', 1770805466, 30, 1770805466, 30, NULL, NULL),
(43, 30, 235, 112, '2026-02-11', '11:51:00', '13:06:00', 75, NULL, 'approved', 1770871903, 30, 1770871903, 30, NULL, NULL),
(44, 30, 235, 113, '2026-02-12', '10:20:00', '13:05:00', 165, NULL, 'approved', 1770952841, 30, 1770952841, 30, NULL, NULL),
(45, 30, 235, 112, '2026-02-17', '09:55:00', '12:40:00', 165, NULL, 'approved', 1771383321, 30, 1771383321, 30, NULL, NULL),
(46, 30, 235, 112, '2026-02-20', '08:39:00', '10:09:00', 90, NULL, 'approved', 1771810773, 30, 1771810773, 30, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` int NOT NULL,
  `uuid` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `fullname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `lastname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `job_position` varchar(100) DEFAULT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `join_date` int DEFAULT NULL,
  `resign_date` int DEFAULT NULL,
  `gender` enum('female','male') DEFAULT NULL,
  `user_role` varchar(50) DEFAULT NULL,
  `user_type` enum('staff','probation','internship','contract') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'staff',
  `birthdate` date DEFAULT NULL,
  `marital_status` enum('single','married','widowed','divorced') DEFAULT NULL,
  `nationality` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `address` text,
  `address_on_identity` text,
  `identity_number` varchar(50) DEFAULT NULL,
  `identity_type` enum('ktp','passport','sim') DEFAULT NULL,
  `npwp_number` char(16) DEFAULT NULL,
  `tax_start_date` date DEFAULT NULL,
  `bank_code` varchar(10) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `beneficiary_name` varchar(100) DEFAULT NULL,
  `currency` enum('idr','usd') DEFAULT 'idr',
  `bpjs_tk_reg_date` date DEFAULT NULL,
  `bpjs_tk_term_date` date DEFAULT NULL,
  `bpjs_tk_number` varchar(50) DEFAULT NULL,
  `pension_number` varchar(50) DEFAULT NULL,
  `bpjs_kes_reg_date` date DEFAULT NULL,
  `bpjs_kes_term_date` date DEFAULT NULL,
  `bpjs_kes_number` varchar(50) DEFAULT NULL,
  `emergency_fullname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `emergency_lastname` varchar(100) DEFAULT NULL,
  `emergency_relationship` varchar(100) DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_address` text,
  `internship_start_date` int DEFAULT NULL,
  `internship_end_date` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `status` enum('new','waiting','active','banned') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'new',
  `menu_access` json DEFAULT NULL,
  `absent_type` enum('timeless','timeable') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'timeable',
  `attendance_type` enum('anywhere','office') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_timesheet` enum('true','false') NOT NULL DEFAULT 'false',
  `is_clocked_in` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `is_hod` enum('true','false') DEFAULT NULL,
  `is_hrd` enum('true','false') DEFAULT NULL,
  `is_operational_director` enum('true','false') DEFAULT NULL,
  `is_superadmin` enum('true','false') DEFAULT NULL,
  `is_ae` enum('true','false') DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `performance_score` int NOT NULL DEFAULT '0',
  `performance_year` smallint NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `uuid`, `password`, `fullname`, `lastname`, `job_position`, `profile_pic`, `email`, `phone`, `join_date`, `resign_date`, `gender`, `user_role`, `user_type`, `birthdate`, `marital_status`, `nationality`, `address`, `address_on_identity`, `identity_number`, `identity_type`, `npwp_number`, `tax_start_date`, `bank_code`, `bank_account_number`, `beneficiary_name`, `currency`, `bpjs_tk_reg_date`, `bpjs_tk_term_date`, `bpjs_tk_number`, `pension_number`, `bpjs_kes_reg_date`, `bpjs_kes_term_date`, `bpjs_kes_number`, `emergency_fullname`, `emergency_lastname`, `emergency_relationship`, `emergency_contact`, `emergency_address`, `internship_start_date`, `internship_end_date`, `department_id`, `status`, `menu_access`, `absent_type`, `attendance_type`, `is_timesheet`, `is_clocked_in`, `is_hod`, `is_hrd`, `is_operational_director`, `is_superadmin`, `is_ae`, `created`, `created_by`, `updated`, `updated_by`, `deleted`, `deleted_by`, `performance_score`, `performance_year`) VALUES
(20, '70cdb540-01bf-40bb-be94-f89765aa5bd1', '$2a$10$6KJYXQrBpmM.0mGqJ7P4ieyc0wqHmxTDXstT1a/i3OKUuiAOc8MqG', 'Seto Enggar (VP Digital)', 'Enggar (VP Digital)', 'Direktur Operasional', '1761629634554-e6247997ca58-img-4223.webp', 'seto@vp-digital.com', '081220399599', 1759809660, NULL, NULL, 'superadmin', 'staff', '1989-12-19', 'married', 'Indonesia', 'DI Yogyakarta', 'DI Yogyakarta', '123', NULL, '', NULL, '', '123', 'SETO', 'idr', NULL, NULL, '', '', NULL, NULL, '', 'VP', NULL, 'Parent', '123', 'JAKARTA', NULL, NULL, NULL, 'active', '[101, 173, 174, 175, 176, 186, 187, 189, 190, 191, 192, 193, 194, 100, 169, 168, 167, 188, 166, 165, 164, 182, 181, 180, 179, 178, 177, 185, 184, 183, 195, 197, 196, 198]', 'timeless', 'anywhere', 'false', 'true', 'true', '', '', 'true', NULL, 1759809660, 1, 1771817226, 30, NULL, NULL, 0, 2025),
(22, 'ba6b7987-6eeb-4c8a-bb49-1c2e9550cd5e', '$2a$10$6KJYXQrBpmM.0mGqJ7P4ieyc0wqHmxTDXstT1a/i3OKUuiAOc8MqG', 'Leonard Wijaya', 'Wijaya', NULL, '78886357d14b9b68.jpg', 'leonard@vp-digital.com', NULL, 1759908764, NULL, NULL, 'staff', 'staff', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', 'false', '', '', NULL, NULL, 1759908764, 1, 1759908764, 1, NULL, NULL, 0, 0),
(23, 'db546353-f595-47d1-a50e-73b63f82749d', '$2a$10$6KJYXQrBpmM.0mGqJ7P4ieyc0wqHmxTDXstT1a/i3OKUuiAOc8MqG', 'Developer VP-Digital', 'VP-Digital', NULL, 'c6db468a8256d3f6.jpg', 'developer@vp-digital.com', NULL, 1759913377, NULL, NULL, 'staff', 'staff', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', 'false', '', '', NULL, NULL, 1759913377, 1, 1759913377, 1, NULL, NULL, 0, 0),
(24, 'c5f3dcc9-8880-4005-b19e-69f002c24330', '$2a$10$6KJYXQrBpmM.0mGqJ7P4ieyc0wqHmxTDXstT1a/i3OKUuiAOc8MqG', 'Dorio Venter', 'VP Digital', 'Director', 'bd961758814eb067.jpg', 'dorio@vp-digital.com', '081998491081', 1760013763, NULL, NULL, 'staff', 'staff', NULL, 'single', 'Indonesia', '-', '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Larry', NULL, 'Friend', '08159220038', '-', NULL, NULL, NULL, 'active', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', 'false', '', '', NULL, NULL, 1760013763, 1, 1760013763, 1, NULL, NULL, 0, 2025),
(25, 'e90786da-f2bb-47ec-b3be-e8884d728590', '$2a$10$6KJYXQrBpmM.0mGqJ7P4ieyc0wqHmxTDXstT1a/i3OKUuiAOc8MqG', 'Kevin Konggidinata', NULL, 'Ads Implementer', '1760336440421-e49014cbf151-acg8ocim-qeue78yjoy6xrfadtguvwqur-57pygynvdfpr7eglbvqhnp-s96-c.jpg', 'kevin@vp-digital.com', '08128116228', 1760336440, NULL, NULL, 'staff', 'staff', '2020-11-23', 'single', 'Indonesia', 'GLC', 'Taman Ratu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'true', 'false', '', '', NULL, NULL, 1760336440, 1, 1761546194, 25, NULL, NULL, 0, 2025),
(26, '265589a0-328c-405b-ba7f-399feb0f91e4', '$2a$10$6KJYXQrBpmM.0mGqJ7P4ieyc0wqHmxTDXstT1a/i3OKUuiAOc8MqG', 'Faisal Rahmad (VP Digital)', NULL, 'Art Director ', '1770795438542-6a3808a07edb-unnamed.webp', 'faisal@vp-digital.com', '081315362746', 1769411196, NULL, NULL, 'staff', 'staff', '1991-03-23', 'married', 'Indonesia', 'Taman Wisma Asri Jl Apel Merah Raya Blok AA5 no 40 RT 03 RW 021', 'Taman Wisma Asri Jl Apel Merah Raya Blok AA5 no 40 RT 03 RW 021', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', 'false', 'false', 'false', 'false', 'false', 1769411196, 1, 1769411196, 1, NULL, NULL, 0, 0),
(27, '2c48f68f-c9a7-415c-aa22-7006c4cc5ce3', '$2a$10$6KJYXQrBpmM.0mGqJ7P4ieyc0wqHmxTDXstT1a/i3OKUuiAOc8MqG', 'Raden Adrian Mabrur Djatikoesoemo', NULL, 'Account Director', NULL, 'dion@vp-digital.com', '081919190791', 1770780717, NULL, NULL, 'account', 'staff', '1991-07-19', 'single', 'Indonesia', 'Gandaria Heights Apartment', 'Bumi Bintaro Permai', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', 'false', 'false', 'false', 'false', 'false', 1770780717, 1, 1770780717, 1, NULL, NULL, 0, 0),
(29, '4057a3d9-c01e-44f1-8bec-68b85fea57f6', NULL, 'Diki Subagja', NULL, 'Frontend Developer', '1770796713702-e556a0399584-cuplikan-layar-2026-02-11-145826.webp', 'diki@vp-digital.com', '085860881609', 1770796553, NULL, NULL, 'superadmin', 'staff', '1995-07-05', 'married', 'Indonesia', 'Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi', 'Jl. Lembursitu kp.tipar RT.002/RW.008, Kota Sukabumi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '[101, 173, 174, 175, 176, 186, 187, 189, 190, 191, 192, 193, 194, 100, 169, 168, 167, 188, 166, 165, 164, 182, 181, 180, 179, 178, 177, 185, 184, 183, 195, 197, 196, 198]', 'timeable', 'anywhere', 'false', 'false', NULL, NULL, NULL, NULL, NULL, 1770796553, 1, 1771817226, 30, NULL, NULL, 0, 0),
(30, '4b7a0cde-086f-4d15-8af6-2e054bc517ee', NULL, 'Bayu Nugroho (VP Digital)', NULL, 'Backend Programmer', '1771813771498-3bf57a6d35b0-whatsapp-image-2026-02-20-at-15-19-08.webp', 'bayu@vp-digital.com', '082246811771', 1770797647, NULL, NULL, 'superadmin', 'staff', '2020-10-12', 'single', 'Indonesia', 'Pasar Minggu', 'Pasar Minggu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', '[101, 173, 174, 175, 176, 186, 187, 189, 190, 191, 192, 193, 194, 100, 169, 168, 167, 188, 166, 165, 164, 182, 181, 180, 179, 178, 177, 185, 184, 183, 195, 197, 196, 198]', 'timeable', 'anywhere', 'false', 'false', NULL, NULL, NULL, NULL, NULL, 1770797647, 1, 1771817226, 30, NULL, NULL, 0, 0),
(31, '0786338f-8cc1-4461-8e62-ab41389d2e68', NULL, 'Ahmad Muhsin Habsyi (VP Digital)', NULL, NULL, NULL, 'muhsin@vp-digital.com', NULL, 1770798870, NULL, NULL, 'staff', 'staff', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'new', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', NULL, NULL, NULL, NULL, NULL, 1770798870, 1, 1770798870, 1, NULL, NULL, 0, 0),
(32, '509f2ed5-2488-4d19-b0c1-304d29836959', NULL, 'Anjas Randy Bagastama (VP Digital)', NULL, NULL, NULL, 'anjas@vp-digital.com', NULL, 1770799052, NULL, NULL, 'staff', 'staff', '1995-10-03', 'married', 'Indonesia', 'Bekasi', 'Bekasi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'waiting', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', NULL, NULL, NULL, NULL, NULL, 1770799052, 1, 1770799052, 1, NULL, NULL, 0, 0),
(33, '1a41d7f1-66aa-4115-8279-a9b43534b7ed', NULL, 'Valencia Arwina (Wina)', NULL, NULL, NULL, 'valencia@vp-digital.com', NULL, 1770799110, NULL, NULL, 'account', 'staff', '2000-01-18', 'single', 'Indonesia', 'Jl. Kalibata Utara II No.7 RT.3/RW.2, Kel. Kalibata, Kec. Pancoran, Kota Jakarta Selatan, DKI Jakarta 12740', 'Jl. Kalibata Utara II No.7 RT.3/RW.2, Kel. Kalibata, Kec. Pancoran, Kota Jakarta Selatan, DKI Jakarta 12740', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'waiting', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', NULL, NULL, NULL, NULL, NULL, 1770799110, 1, 1770799110, 1, NULL, NULL, 0, 0),
(34, 'b4d23464-36e8-43be-b786-a2139466faa1', NULL, 'Tia Salwa (VP Digital)', NULL, NULL, NULL, 'salwa@vp-digital.com', NULL, 1770799552, NULL, NULL, 'staff', 'staff', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'new', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', NULL, NULL, NULL, NULL, NULL, 1770799552, 1, 1770799552, 1, NULL, NULL, 0, 0),
(35, 'd8c23ba6-9705-4c10-b6cb-bc42b3d67f2b', NULL, 'Fany Justica Setiani (VP Digital)', NULL, NULL, NULL, 'fany@vp-digital.com', NULL, 1770799784, NULL, NULL, 'staff', 'staff', '1999-06-15', 'single', 'Indonesia', 'Perum. Inkopad Blok G 13 NO 5, desa sasakpanjang, kec. tajurhalang, kab. Bogor, Jawa barat', 'Perum. Inkopad, desa sasakpanjang, kec. tajurhalang, kab. Bogor, Jawa barat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'waiting', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', NULL, NULL, NULL, NULL, NULL, 1770799784, 1, 1770799784, 1, NULL, NULL, 0, 0),
(36, '131393df-f1fc-4998-bf61-9aa4d5a797e9', NULL, 'Tria Haniefa (VP Digital)', NULL, NULL, NULL, 'triahaniefa@vp-digital.com', NULL, 1770800532, NULL, NULL, 'account', 'staff', NULL, 'single', 'Indonesia', 'Moh Kahfi 1 no.36 Jagakarsa', 'Gang Sumbawa No.1 Kebumen', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'waiting', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', NULL, NULL, NULL, NULL, NULL, 1770800532, 1, 1770800532, 1, NULL, NULL, 0, 0),
(37, '5586d273-5453-4b43-82df-383b90a89091', NULL, 'Radit P Priawan', NULL, NULL, NULL, 'raditpriawan@vp-digital.com', NULL, 1770800804, NULL, NULL, 'staff', 'staff', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'idr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'new', '[100, 101, 164, 165, 166, 167, 168, 169, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195]', 'timeable', 'anywhere', 'false', 'false', NULL, NULL, NULL, NULL, NULL, 1770800804, 1, 1770800804, 1, NULL, NULL, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_employment`
--

DROP TABLE IF EXISTS `user_employment`;
CREATE TABLE `user_employment` (
  `employment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` int NOT NULL,
  `end_date` int DEFAULT NULL,
  `duration_months` int DEFAULT NULL,
  `salary_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `evaluation_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `recommended_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int NOT NULL,
  `deleted` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_employment`
--

INSERT INTO `user_employment` (`employment_id`, `user_id`, `type`, `contract_number`, `start_date`, `end_date`, `duration_months`, `salary_json`, `evaluation_notes`, `recommended_status`, `notes`, `created`, `created_by`, `updated`, `deleted`) VALUES
(1, 25, 'staff', NULL, 1761545888, NULL, NULL, NULL, NULL, NULL, NULL, 1761545888, 1, 1761545888, NULL),
(4, 20, 'staff', NULL, 1763690577, NULL, NULL, NULL, NULL, NULL, NULL, 1763690577, 1, 1763690577, NULL),
(5, 26, 'staff', NULL, 1769411196, NULL, NULL, NULL, NULL, NULL, NULL, 1769411196, 1, 1769411196, NULL),
(6, 27, 'staff', NULL, 1770780717, NULL, NULL, NULL, NULL, NULL, NULL, 1770780717, 1, 1770780717, NULL),
(8, 29, 'staff', NULL, 1770796553, NULL, NULL, NULL, NULL, NULL, NULL, 1770796553, 1, 1770796553, NULL),
(9, 30, 'staff', NULL, 1770797647, NULL, NULL, NULL, NULL, NULL, NULL, 1770797647, 1, 1770797647, NULL),
(10, 31, 'staff', NULL, 1770798870, NULL, NULL, NULL, NULL, NULL, NULL, 1770798870, 1, 1770798870, NULL),
(11, 32, 'staff', NULL, 1770799052, NULL, NULL, NULL, NULL, NULL, NULL, 1770799052, 1, 1770799052, NULL),
(12, 33, 'staff', NULL, 1770799110, NULL, NULL, NULL, NULL, NULL, NULL, 1770799110, 1, 1770799110, NULL),
(13, 34, 'staff', NULL, 1770799552, NULL, NULL, NULL, NULL, NULL, NULL, 1770799552, 1, 1770799552, NULL),
(14, 35, 'staff', NULL, 1770799784, NULL, NULL, NULL, NULL, NULL, NULL, 1770799784, 1, 1770799784, NULL),
(15, 36, 'staff', NULL, 1770800532, NULL, NULL, NULL, NULL, NULL, NULL, 1770800532, 1, 1770800532, NULL),
(16, 37, 'staff', NULL, 1770800804, NULL, NULL, NULL, NULL, NULL, NULL, 1770800804, 1, 1770800804, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_location`
--

DROP TABLE IF EXISTS `user_location`;
CREATE TABLE `user_location` (
  `location_id` int NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` text,
  `created` int NOT NULL,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_location`
--

INSERT INTO `user_location` (`location_id`, `user_id`, `latitude`, `longitude`, `ip_address`, `device_info`, `created`, `created_by`) VALUES
(173, 19, -6.2868429, 106.8423141, '114.10.117.87', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1768832779, 19),
(174, 21, -6.8568640, 106.9565277, '182.253.151.157', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', 1769396259, 21),
(175, 26, -6.2766647, 106.7958183, '118.99.107.167', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1769411197, 26),
(176, 20, -7.7530983, 110.4331785, '118.99.73.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', 1769430585, 20),
(177, 21, -6.9626121, 106.8918269, '182.253.151.157', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', 1769475611, 21),
(178, 20, -7.7531640, 110.4331549, '118.99.73.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', 1769485845, 20),
(179, 20, -7.7530983, 110.4331785, '118.99.73.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', 1769511453, 20),
(180, 27, -6.2765505, 106.7957828, '182.253.127.167', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', 1770780719, 27),
(181, 25, -6.1477000, 106.7122000, '180.242.131.128', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', 1770780894, 25),
(182, 19, -6.2869003, 106.8421861, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770785335, 19),
(183, 19, -6.2868509, 106.8422909, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770786980, 19),
(184, 27, -6.2764679, 106.7958341, '182.253.127.167', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', 1770791809, 27),
(185, 19, -6.2868933, 106.8422864, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770794992, 19),
(186, 19, -6.2868898, 106.8422468, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1770795079, 19),
(187, 21, -6.9625462, 106.8919082, '114.5.213.104', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', 1770795159, 21),
(188, 21, -6.9625949, 106.8917421, '114.5.213.104', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', 1770795213, 21),
(189, 28, -6.9625949, 106.8917421, '114.5.213.104', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', 1770795391, 28),
(190, 19, -6.2868249, 106.8423342, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770795585, 19),
(191, 28, -6.9625766, 106.8917411, '114.5.213.104', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', 1770795657, 28),
(192, 26, -6.2766230, 106.7958314, '182.253.127.167', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1770795743, 26),
(193, 28, -6.8568640, 106.9565277, '182.253.151.152', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', 1770796045, 28),
(194, 28, -6.8568640, 106.9565277, '182.253.151.152', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', 1770796198, 28),
(195, 29, -6.8568640, 106.9565277, '182.253.151.152', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', 1770796554, 29),
(196, 19, -6.2868266, 106.8422956, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770796604, 19),
(197, 19, -6.2868422, 106.8422837, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770796754, 19),
(198, 19, -6.2868944, 106.8422590, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770797245, 19),
(199, 19, -6.2868943, 106.8422230, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770797330, 19),
(200, 29, -6.8568640, 106.9565277, '182.253.151.152', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', 1770797401, 29),
(201, 30, -6.2868482, 106.8422584, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770797648, 30),
(202, 29, -6.8568640, 106.9565277, '182.253.151.152', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', 1770797652, 29),
(203, 29, -6.8568640, 106.9565277, '182.253.151.152', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', 1770797736, 29),
(204, 29, -6.8568640, 106.9565277, '182.253.151.152', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', 1770798597, 29),
(205, 31, -6.2264178, 106.7389119, '182.253.48.71', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', 1770798872, 31),
(206, 30, -6.2868731, 106.8422604, '180.252.86.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770798976, 30),
(207, 29, -6.8568640, 106.9565277, '182.253.151.152', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0', 1770799053, 29),
(208, 32, -6.2766097, 106.7958052, '182.253.127.167', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1770799053, 32),
(209, 33, -6.2766115, 106.7958494, '182.253.127.167', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1770799111, 33),
(210, 33, -6.2766379, 106.7958171, '112.215.65.107', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1', 1770799332, 33),
(211, 34, -6.2765592, 106.7958780, '182.253.127.167', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1770799554, 34),
(212, 35, -6.2765142, 106.7958424, '182.253.127.167', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1770799785, 35),
(213, 36, -6.2659000, 106.8250000, '182.253.127.167', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1770800533, 36),
(214, 37, -8.6989322, 115.1926828, '114.122.167.59', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1770800805, 37),
(215, 30, -6.2868220, 106.8422928, '::ffff:127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770805433, 30),
(216, 30, -6.2765599, 106.7958367, '::ffff:127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770954197, 30),
(217, 30, -6.2766035, 106.7958435, '::ffff:127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770956069, 30),
(218, 30, -6.2765774, 106.7958305, '::ffff:127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1770957824, 30),
(219, 30, -6.2765169, 106.7957725, '::ffff:127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0', 1771816413, 30);

-- --------------------------------------------------------

--
-- Table structure for table `website_blog`
--

DROP TABLE IF EXISTS `website_blog`;
CREATE TABLE `website_blog` (
  `blog_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` json DEFAULT NULL,
  `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `meta_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `meta_keyword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `website_client`
--

DROP TABLE IF EXISTS `website_client`;
CREATE TABLE `website_client` (
  `client_id` int NOT NULL,
  `cover_url` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `client_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `meta_keyword` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `website_page`
--

DROP TABLE IF EXISTS `website_page`;
CREATE TABLE `website_page` (
  `page_id` int NOT NULL,
  `page_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `meta_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `meta_keyword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `website_project`
--

DROP TABLE IF EXISTS `website_project`;
CREATE TABLE `website_project` (
  `project_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` json DEFAULT NULL,
  `year` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `meta_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `meta_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `meta_keyword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `website_service`
--

DROP TABLE IF EXISTS `website_service`;
CREATE TABLE `website_service` (
  `service_id` int NOT NULL,
  `created` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `deleted` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `updated` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `text_list` json DEFAULT NULL,
  `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_service`
--

INSERT INTO `website_service` (`service_id`, `created`, `created_by`, `deleted`, `deleted_by`, `updated`, `updated_by`, `title`, `subtitle`, `description`, `text_list`, `cover_url`) VALUES
(1, 1769501887, 21, NULL, NULL, 1769501887, 21, 'Website Development', 'Responsible in determining the layout, design and coding on the website that will be built according to the company\'s specifications.', '<p>Today, web design is one of the most effective marketing and promotion tools. The target market can be determined by how the website works, the design, and understanding of the content by the user.</p><p>A well-designed website will increase the impression and credibility of the company, so it will automatically increase the prospects of the goods or services on offer, as most people will find out in advance on the internet before they decide to make a purchase. In addition to being well designed, a website must also be easy to find in search engines (google) in order to reach the desired target audience.</p>', '[\"Responsive Web Design\", \"Custom Web Design\", \"Web Maintenance\"]', ''),
(2, 1770802411, 29, NULL, NULL, 1770802411, 29, 'Website Development', 'Responsible in determining the layout, design and coding on the website that will be built according to the company\'s specifications.', '<p>Today, web design is one of the most effective marketing and promotion tools. The target market can be determined by how the website works, the design, and understanding of the content by the user.</p><p>A well-designed website will increase the impression and credibility of the company, so it will automatically increase the prospects of the goods or services on offer, as most people will find out in advance on the internet before they decide to make a purchase. In addition to being well designed, a website must also be easy to find in search engines (google) in order to reach the desired target audience.</p>', '[\"Responsive Web Design\", \"Custom Web Design\", \"Web Maintenance\"]', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `annual_assestment`
--
ALTER TABLE `annual_assestment`
  ADD PRIMARY KEY (`annual_assestment_id`),
  ADD UNIQUE KEY `uq_staff_period` (`staff_id`,`period_from_year`,`period_to_year`),
  ADD KEY `idx_period_status` (`period_from_year`,`period_to_year`,`status`),
  ADD KEY `idx_hod_status` (`hod_id`,`status`);

--
-- Indexes for table `appraisal`
--
ALTER TABLE `appraisal`
  ADD PRIMARY KEY (`appraisal_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_submitted` (`submitted_at`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_grade` (`grade`),
  ADD KEY `idx_title` (`title`),
  ADD KEY `idx_submitted_at` (`submitted_at`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `uq_user_date` (`user_id`,`date`),
  ADD UNIQUE KEY `uq_attendance_user_date` (`user_id`,`date`),
  ADD UNIQUE KEY `attendance_user_id_date` (`user_id`,`date`),
  ADD KEY `fk_attendance_user_id` (`user_id`);

--
-- Indexes for table `attendance_config`
--
ALTER TABLE `attendance_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_attendance_config_ip_active` (`ip`,`active`),
  ADD UNIQUE KEY `attendance_config_ip_active` (`ip`,`active`),
  ADD KEY `idx_attendance_config_active` (`active`),
  ADD KEY `attendance_config_active` (`active`);

--
-- Indexes for table `brand`
--
ALTER TABLE `brand`
  ADD PRIMARY KEY (`brand_id`);

--
-- Indexes for table `calendar_event`
--
ALTER TABLE `calendar_event`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_calendar_event_start` (`start_at`),
  ADD KEY `idx_calendar_event_end` (`end_at`),
  ADD KEY `idx_calendar_event_user` (`user_id`),
  ADD KEY `idx_calendar_event_public` (`is_public`),
  ADD KEY `idx_calendar_event_deleted` (`deleted`);

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`client_id`),
  ADD KEY `idx_client_assign_to` (`assign_to`),
  ADD KEY `idx_client_leadstatus_id` (`leadstatus_id`);

--
-- Indexes for table `client_activity`
--
ALTER TABLE `client_activity`
  ADD PRIMARY KEY (`activity_id`),
  ADD KEY `idx_client_activity_client_id` (`client_id`),
  ADD KEY `idx_client_activity_created` (`created`);

--
-- Indexes for table `client_assign_history`
--
ALTER TABLE `client_assign_history`
  ADD PRIMARY KEY (`assign_history_id`),
  ADD KEY `idx_client_assign_history_client_id` (`client_id`),
  ADD KEY `idx_client_assign_history_to_assign_to` (`to_assign_to`),
  ADD KEY `idx_client_assign_history_moved_at` (`moved_at`);

--
-- Indexes for table `client_leadstatus_history`
--
ALTER TABLE `client_leadstatus_history`
  ADD PRIMARY KEY (`leadstatus_history_id`),
  ADD KEY `idx_clh_client_id` (`client_id`),
  ADD KEY `idx_clh_to_leadstatus_id` (`to_leadstatus_id`),
  ADD KEY `idx_clh_changed_at` (`changed_at`);

--
-- Indexes for table `countrycode`
--
ALTER TABLE `countrycode`
  ADD PRIMARY KEY (`countrycode_id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `title` (`title`);

--
-- Indexes for table `email_log`
--
ALTER TABLE `email_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email_log_user_created` (`user_id`,`created`),
  ADD KEY `idx_email_log_notification` (`notification_id`),
  ADD KEY `idx_email_log_status_created` (`status`,`created`),
  ADD KEY `idx_email_log_dedup_key` (`dedup_key`),
  ADD KEY `idx_email_log_to_email_creat` (`to_email`,`created`),
  ADD KEY `email_log_user_id_created` (`user_id`,`created`),
  ADD KEY `email_log_notification_id` (`notification_id`),
  ADD KEY `email_log_status_created` (`status`,`created`),
  ADD KEY `email_log_dedup_key` (`dedup_key`),
  ADD KEY `email_log_to_email_created` (`to_email`,`created`);

--
-- Indexes for table `holiday`
--
ALTER TABLE `holiday`
  ADD PRIMARY KEY (`holiday_id`),
  ADD UNIQUE KEY `uq_holiday_date_region` (`date`,`country_code`,`region_code`),
  ADD KEY `idx_holiday_date` (`date`);

--
-- Indexes for table `leadsource`
--
ALTER TABLE `leadsource`
  ADD PRIMARY KEY (`leadsource_id`),
  ADD UNIQUE KEY `uniq_lead_source_name` (`title`);

--
-- Indexes for table `leadstatus`
--
ALTER TABLE `leadstatus`
  ADD PRIMARY KEY (`leadstatus_id`),
  ADD UNIQUE KEY `uk_leadstatus_slug` (`slug`);

--
-- Indexes for table `leave`
--
ALTER TABLE `leave`
  ADD PRIMARY KEY (`leave_id`),
  ADD KEY `idx_leave_user_id` (`user_id`),
  ADD KEY `idx_leave_start_date` (`start_date`),
  ADD KEY `idx_leave_end_date` (`end_date`),
  ADD KEY `idx_leave_status` (`status`),
  ADD KEY `idx_leave_hod` (`hod`),
  ADD KEY `idx_leave_user_date` (`user_id`,`start_date`,`end_date`),
  ADD KEY `idx_leave_approval_assign_status` (`approval_assign_to_status`),
  ADD KEY `idx_leave_approval_hod_status` (`approval_hod_status`),
  ADD KEY `idx_leave_approval_dir_status` (`approval_operational_director_status`);

--
-- Indexes for table `leave_config`
--
ALTER TABLE `leave_config`
  ADD PRIMARY KEY (`lconfig_id`),
  ADD UNIQUE KEY `uniq_leave_config_reason` (`mlreason_id`),
  ADD KEY `idx_leave_config_title` (`title`);

--
-- Indexes for table `master_annual_assesment_question`
--
ALTER TABLE `master_annual_assesment_question`
  ADD PRIMARY KEY (`question_id`),
  ADD UNIQUE KEY `uq_question_key` (`question_key`),
  ADD KEY `idx_section_sort` (`section_key`,`sort_order`),
  ADD KEY `idx_section_key` (`section_key`),
  ADD KEY `idx_question_key` (`question_key`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- Indexes for table `master_annual_assestment_period`
--
ALTER TABLE `master_annual_assestment_period`
  ADD PRIMARY KEY (`period_id`),
  ADD UNIQUE KEY `uq_year` (`year`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_open_close` (`open_at`,`close_at`);

--
-- Indexes for table `master_appraisal_question`
--
ALTER TABLE `master_appraisal_question`
  ADD PRIMARY KEY (`question_id`),
  ADD UNIQUE KEY `uq_title_sort` (`title`,`sort_order`),
  ADD UNIQUE KEY `uq_title_sort_order` (`title`,`sort_order`),
  ADD KEY `idx_title` (`title`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`menu_id`) USING BTREE;

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`notification_id`) USING BTREE,
  ADD KEY `idx_notification_dedup_key` (`dedup_key`);

--
-- Indexes for table `notification_push`
--
ALTER TABLE `notification_push`
  ADD PRIMARY KEY (`notification_push_id`) USING BTREE,
  ADD UNIQUE KEY `uq_createdby_token` (`created_by`,`token`),
  ADD KEY `idx_createdby_status` (`created_by`,`status`),
  ADD KEY `idx_last_seen` (`last_seen`);

--
-- Indexes for table `performance_config`
--
ALTER TABLE `performance_config`
  ADD PRIMARY KEY (`perf_config_id`) USING BTREE,
  ADD UNIQUE KEY `uk_performance_config_title` (`title`) USING BTREE,
  ADD KEY `idx_is_active` (`is_active`) USING BTREE,
  ADD KEY `idx_perf_cfg_tag_type` (`tag_type`) USING BTREE,
  ADD KEY `idx_perf_cfg_tag_bucket` (`tag_bucket`) USING BTREE,
  ADD KEY `idx_perf_cfg_tag_days` (`tag_days`) USING BTREE;

--
-- Indexes for table `performance_event_log`
--
ALTER TABLE `performance_event_log`
  ADD PRIMARY KEY (`perf_event_id`) USING BTREE,
  ADD KEY `idx_user_period_score` (`user_id`,`period_year`,`period_month`,`score_value`) USING BTREE,
  ADD KEY `idx_period_user_score` (`period_year`,`period_month`,`user_id`,`score_value`) USING BTREE,
  ADD KEY `idx_perf_config` (`perf_config_id`) USING BTREE,
  ADD KEY `idx_ref` (`ref_id`) USING BTREE;

--
-- Indexes for table `performance_monthly_score`
--
ALTER TABLE `performance_monthly_score`
  ADD PRIMARY KEY (`perf_month_id`),
  ADD UNIQUE KEY `uk_user_period` (`user_id`,`period_year`,`period_month`),
  ADD KEY `idx_period` (`period_year`,`period_month`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `pitching`
--
ALTER TABLE `pitching`
  ADD PRIMARY KEY (`pitching_id`) USING BTREE;

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`project_id`),
  ADD KEY `idx_project_client_id` (`client_id`),
  ADD KEY `idx_project_created_by` (`created_by`),
  ADD KEY `idx_project_updated_by` (`updated_by`);

--
-- Indexes for table `project_purchase_order`
--
ALTER TABLE `project_purchase_order`
  ADD PRIMARY KEY (`po_id`),
  ADD UNIQUE KEY `idx_po_number_unique` (`po_number`),
  ADD KEY `idx_po_pq_id` (`pq_id`);

--
-- Indexes for table `project_quotation`
--
ALTER TABLE `project_quotation`
  ADD PRIMARY KEY (`pq_id`),
  ADD KEY `idx_quotation_project_id` (`project_id`),
  ADD KEY `idx_quotation_created_by` (`created_by`),
  ADD KEY `idx_quotation_updated_by` (`updated_by`);

--
-- Indexes for table `project_team`
--
ALTER TABLE `project_team`
  ADD PRIMARY KEY (`pt_id`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_task_id` (`task_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_project_user` (`project_id`,`user_id`),
  ADD KEY `idx_project_task_user` (`project_id`,`task_id`,`user_id`),
  ADD KEY `idx_deleted` (`deleted`);

--
-- Indexes for table `project_type`
--
ALTER TABLE `project_type`
  ADD PRIMARY KEY (`pt_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `setting`
--
ALTER TABLE `setting`
  ADD PRIMARY KEY (`node_id`) USING BTREE,
  ADD UNIQUE KEY `slug` (`var_name`) USING BTREE;

--
-- Indexes for table `task`
--
ALTER TABLE `task`
  ADD PRIMARY KEY (`task_id`) USING BTREE,
  ADD KEY `project_id` (`project_id`),
  ADD KEY `idx_task_project_id` (`project_id`),
  ADD KEY `idx_task_created_by` (`created_by`),
  ADD KEY `idx_task_updated_by` (`updated_by`);

--
-- Indexes for table `task_assignment`
--
ALTER TABLE `task_assignment`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `uq_task_user` (`task_id`,`user_id`),
  ADD KEY `fk_assignment_task_id` (`task_id`),
  ADD KEY `fk_assignment_user_id` (`user_id`);

--
-- Indexes for table `task_attachment`
--
ALTER TABLE `task_attachment`
  ADD PRIMARY KEY (`attachment_id`) USING BTREE;

--
-- Indexes for table `task_comment`
--
ALTER TABLE `task_comment`
  ADD PRIMARY KEY (`comment_id`) USING BTREE;

--
-- Indexes for table `task_logs`
--
ALTER TABLE `task_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_revision`
--
ALTER TABLE `task_revision`
  ADD PRIMARY KEY (`revision_id`);

--
-- Indexes for table `task_subtask`
--
ALTER TABLE `task_subtask`
  ADD PRIMARY KEY (`ts_id`);

--
-- Indexes for table `task_todo`
--
ALTER TABLE `task_todo`
  ADD PRIMARY KEY (`todo_id`);

--
-- Indexes for table `timesheet`
--
ALTER TABLE `timesheet`
  ADD PRIMARY KEY (`timesheet_id`),
  ADD KEY `fk_timesheet_user_id` (`user_id`),
  ADD KEY `fk_timesheet_project_id` (`project_id`),
  ADD KEY `fk_timesheet_task_id` (`task_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`) USING BTREE,
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_user_is_hrd` (`is_hrd`),
  ADD KEY `idx_user_is_opdir` (`is_operational_director`);

--
-- Indexes for table `user_employment`
--
ALTER TABLE `user_employment`
  ADD PRIMARY KEY (`employment_id`),
  ADD KEY `idx_user_employment_user` (`user_id`),
  ADD KEY `idx_user_employment_type` (`type`),
  ADD KEY `idx_user_employment_end` (`end_date`),
  ADD KEY `idx_user_employment_del` (`deleted`);

--
-- Indexes for table `user_location`
--
ALTER TABLE `user_location`
  ADD PRIMARY KEY (`location_id`) USING BTREE,
  ADD KEY `fk_user_id_location` (`user_id`);

--
-- Indexes for table `website_blog`
--
ALTER TABLE `website_blog`
  ADD PRIMARY KEY (`blog_id`);

--
-- Indexes for table `website_client`
--
ALTER TABLE `website_client`
  ADD PRIMARY KEY (`client_id`);

--
-- Indexes for table `website_page`
--
ALTER TABLE `website_page`
  ADD PRIMARY KEY (`page_id`);

--
-- Indexes for table `website_project`
--
ALTER TABLE `website_project`
  ADD PRIMARY KEY (`project_id`);

--
-- Indexes for table `website_service`
--
ALTER TABLE `website_service`
  ADD PRIMARY KEY (`service_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `annual_assestment`
--
ALTER TABLE `annual_assestment`
  MODIFY `annual_assestment_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `appraisal`
--
ALTER TABLE `appraisal`
  MODIFY `appraisal_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `attendance_config`
--
ALTER TABLE `attendance_config`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `brand`
--
ALTER TABLE `brand`
  MODIFY `brand_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `calendar_event`
--
ALTER TABLE `calendar_event`
  MODIFY `event_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `client_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `client_activity`
--
ALTER TABLE `client_activity`
  MODIFY `activity_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `client_assign_history`
--
ALTER TABLE `client_assign_history`
  MODIFY `assign_history_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `client_leadstatus_history`
--
ALTER TABLE `client_leadstatus_history`
  MODIFY `leadstatus_history_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `countrycode`
--
ALTER TABLE `countrycode`
  MODIFY `countrycode_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=243;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `department_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `email_log`
--
ALTER TABLE `email_log`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `holiday`
--
ALTER TABLE `holiday`
  MODIFY `holiday_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `leadsource`
--
ALTER TABLE `leadsource`
  MODIFY `leadsource_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `leadstatus`
--
ALTER TABLE `leadstatus`
  MODIFY `leadstatus_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave`
--
ALTER TABLE `leave`
  MODIFY `leave_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `leave_config`
--
ALTER TABLE `leave_config`
  MODIFY `lconfig_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `master_annual_assesment_question`
--
ALTER TABLE `master_annual_assesment_question`
  MODIFY `question_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `master_annual_assestment_period`
--
ALTER TABLE `master_annual_assestment_period`
  MODIFY `period_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `master_appraisal_question`
--
ALTER TABLE `master_appraisal_question`
  MODIFY `question_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `menu_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=199;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `notification_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1165;

--
-- AUTO_INCREMENT for table `notification_push`
--
ALTER TABLE `notification_push`
  MODIFY `notification_push_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `performance_config`
--
ALTER TABLE `performance_config`
  MODIFY `perf_config_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `performance_event_log`
--
ALTER TABLE `performance_event_log`
  MODIFY `perf_event_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performance_monthly_score`
--
ALTER TABLE `performance_monthly_score`
  MODIFY `perf_month_id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pitching`
--
ALTER TABLE `pitching`
  MODIFY `pitching_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `project_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=240;

--
-- AUTO_INCREMENT for table `project_purchase_order`
--
ALTER TABLE `project_purchase_order`
  MODIFY `po_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `project_quotation`
--
ALTER TABLE `project_quotation`
  MODIFY `pq_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `project_team`
--
ALTER TABLE `project_team`
  MODIFY `pt_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `project_type`
--
ALTER TABLE `project_type`
  MODIFY `pt_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `setting`
--
ALTER TABLE `setting`
  MODIFY `node_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT for table `task`
--
ALTER TABLE `task`
  MODIFY `task_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `task_assignment`
--
ALTER TABLE `task_assignment`
  MODIFY `assignment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `task_attachment`
--
ALTER TABLE `task_attachment`
  MODIFY `attachment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT for table `task_comment`
--
ALTER TABLE `task_comment`
  MODIFY `comment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `task_revision`
--
ALTER TABLE `task_revision`
  MODIFY `revision_id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `task_subtask`
--
ALTER TABLE `task_subtask`
  MODIFY `ts_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `task_todo`
--
ALTER TABLE `task_todo`
  MODIFY `todo_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `timesheet`
--
ALTER TABLE `timesheet`
  MODIFY `timesheet_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `user_employment`
--
ALTER TABLE `user_employment`
  MODIFY `employment_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user_location`
--
ALTER TABLE `user_location`
  MODIFY `location_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=220;

--
-- AUTO_INCREMENT for table `website_blog`
--
ALTER TABLE `website_blog`
  MODIFY `blog_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website_client`
--
ALTER TABLE `website_client`
  MODIFY `client_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website_page`
--
ALTER TABLE `website_page`
  MODIFY `page_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website_project`
--
ALTER TABLE `website_project`
  MODIFY `project_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `website_service`
--
ALTER TABLE `website_service`
  MODIFY `service_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `calendar_event`
--
ALTER TABLE `calendar_event`
  ADD CONSTRAINT `fk_calendar_event_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `client`
--
ALTER TABLE `client`
  ADD CONSTRAINT `fk_client_assign_to_user` FOREIGN KEY (`assign_to`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `client_activity`
--
ALTER TABLE `client_activity`
  ADD CONSTRAINT `fk_client_activity_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`client_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `performance_event_log`
--
ALTER TABLE `performance_event_log`
  ADD CONSTRAINT `fk_event_perf_config` FOREIGN KEY (`perf_config_id`) REFERENCES `performance_config` (`perf_config_id`);

--
-- Constraints for table `performance_monthly_score`
--
ALTER TABLE `performance_monthly_score`
  ADD CONSTRAINT `performance_monthly_score_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE;

--
-- Constraints for table `project_purchase_order`
--
ALTER TABLE `project_purchase_order`
  ADD CONSTRAINT `fk_po_quotation` FOREIGN KEY (`pq_id`) REFERENCES `project_quotation` (`pq_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `task`
--
ALTER TABLE `task`
  ADD CONSTRAINT `fk_task_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `fk_task_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `task_assignment`
--
ALTER TABLE `task_assignment`
  ADD CONSTRAINT `fk_assignment_task_id` FOREIGN KEY (`task_id`) REFERENCES `task` (`task_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assignment_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_employment`
--
ALTER TABLE `user_employment`
  ADD CONSTRAINT `fk_user_employment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
