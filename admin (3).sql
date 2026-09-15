-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 15 Sep 2026 pada 10.58
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `admin`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `approval_ticket`
--

CREATE TABLE `approval_ticket` (
  `id_approval` int(11) NOT NULL,
  `id_ticket` varchar(20) NOT NULL,
  `nik_admin` varchar(10) DEFAULT NULL COMMENT 'admin yang memvalidasi (NULL selama masih menunggu)',
  `tanggal_approval` datetime DEFAULT NULL,
  `status_approval` enum('Menunggu Approval','Approve','Reject') NOT NULL DEFAULT 'Menunggu Approval',
  `catatan_approval` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `approval_ticket`
--

INSERT INTO `approval_ticket` (`id_approval`, `id_ticket`, `nik_admin`, `tanggal_approval`, `status_approval`, `catatan_approval`) VALUES
(51, 'T1789438198505', NULL, NULL, 'Approve', NULL),
(53, 'T1789452975561', NULL, NULL, 'Reject', 'hayooo'),
(55, 'T1789458753418', NULL, NULL, 'Approve', NULL),
(56, 'T1789461573079', 'K0003', '2026-09-15 15:39:41', 'Approve', NULL),
(57, 'T1789461871897', 'K0003', '2026-09-15 15:44:40', 'Reject', 'kurang');

-- --------------------------------------------------------

--
-- Struktur dari tabel `asset_department_history`
--

CREATE TABLE `asset_department_history` (
  `id` int(11) NOT NULL,
  `kode_asset` varchar(50) NOT NULL,
  `id_departemen_lama` int(11) DEFAULT NULL,
  `nama_departemen_lama` varchar(100) DEFAULT NULL,
  `id_departemen_baru` int(11) DEFAULT NULL,
  `nama_departemen_baru` varchar(100) DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `tanggal_pindah` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `asset_department_history`
--

INSERT INTO `asset_department_history` (`id`, `kode_asset`, `id_departemen_lama`, `nama_departemen_lama`, `id_departemen_baru`, `nama_departemen_baru`, `keterangan`, `tanggal_pindah`) VALUES
(1, 'AST-NB0049', 27, '(Belum Diketahui)', 1, 'IT', NULL, '2026-09-11 10:18:16'),
(2, 'AST-03784332', 14, 'IT support', 1, 'IT', NULL, '2026-09-11 13:06:37'),
(3, 'AST-NB0049', 1, 'IT', 18, 'MR', NULL, '2026-09-11 13:07:38');

-- --------------------------------------------------------

--
-- Struktur dari tabel `asset_hardware`
--

CREATE TABLE `asset_hardware` (
  `id` int(11) NOT NULL,
  `kode_asset` varchar(50) NOT NULL,
  `komponen` varchar(100) NOT NULL,
  `spesifikasi` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `asset_hardware`
--

INSERT INTO `asset_hardware` (`id`, `kode_asset`, `komponen`, `spesifikasi`, `keterangan`, `created_at`, `updated_at`) VALUES
(695, 'AST-NB0001', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(696, 'AST-NB0001', 'Serial Number', '8CG1390GTT', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(697, 'AST-NB0001', 'HDD Model', 'SAMSUNG MZVLQ512HBLU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(698, 'AST-NB0001', 'HDD Serial Number', '0025_38D5_1112_9BF4', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(699, 'AST-NB0001', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(700, 'AST-NB0001', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(701, 'AST-NB0002', 'MAC Address LAN', 'E0:70:EA:C5:C4:20', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(702, 'AST-NB0002', 'Serial Number', '5CD14478YY', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(703, 'AST-NB0002', 'HDD Model', 'MTFDHBA512TDV-1AZ1AABHA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(704, 'AST-NB0002', 'HDD Serial Number', '0000_0000_0000_0001_00A0_7521_2E53_9699', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(705, 'AST-NB0002', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(706, 'AST-NB0002', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(707, 'AST-NB0003', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(708, 'AST-NB0003', 'MAC Address WiFi', 'C8:94:02:47:85:89', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(709, 'AST-NB0003', 'Serial Number', '8CG1387KLD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(710, 'AST-NB0003', 'HDD Model', 'SAMSUNG MZVLQ512HBLU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(711, 'AST-NB0003', 'HDD Serial Number', '0025_38D5_1112_7BAD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(712, 'AST-NB0003', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(713, 'AST-NB0003', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(714, 'AST-NB0004', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(715, 'AST-NB0004', 'MAC Address WiFi', 'C8:94:02:46:B6:F9', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(716, 'AST-NB0004', 'Serial Number', '8CG1387KTS', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(717, 'AST-NB0004', 'HDD Model', 'SAMSUNG MZVLQ512HBLU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(718, 'AST-NB0004', 'HDD Serial Number', '0025_38D5_1112_7C66.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(719, 'AST-NB0004', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(720, 'AST-NB0004', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(721, 'AST-NB0005', 'MAC Address LAN', '28:11:A8:05:08:57', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(722, 'AST-NB0005', 'Serial Number', '8CG1474Y14', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(723, 'AST-NB0005', 'HDD Model', 'NVMe SK hynix BC711 HFM512GD3JX013N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(724, 'AST-NB0005', 'HDD Serial Number', 'ACE4_2E00_1665_C3DB_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(725, 'AST-NB0005', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(726, 'AST-NB0005', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(727, 'AST-NB0006', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(728, 'AST-NB0006', 'MAC Address WiFi', '34:6F:24:A8:85:DF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(729, 'AST-NB0006', 'Serial Number', '8CG145ZMYP', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(730, 'AST-NB0006', 'HDD Model', 'SAMSUNG MZVLQ512HBLU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(731, 'AST-NB0006', 'HDD Serial Number', '0025_38DA_1104_B531', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(732, 'AST-NB0006', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(733, 'AST-NB0006', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(734, 'AST-NB0007', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(735, 'AST-NB0007', 'Serial Number', '8CG145ZN6M', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(736, 'AST-NB0007', 'HDD Model', 'SAMSUNG MZVLQ512HBLU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(737, 'AST-NB0007', 'HDD Serial Number', '0025_38DA_1104_96F2', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(738, 'AST-NB0007', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(739, 'AST-NB0007', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(740, 'AST-NB0008', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(741, 'AST-NB0008', 'Serial Number', '8CG145028F', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(742, 'AST-NB0008', 'HDD Model', 'MTFDHBA512QFD-1AX1AABHA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(743, 'AST-NB0008', 'HDD Serial Number', '0000_0000_0000_0001_00A0_7521_31A2_2BEA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(744, 'AST-NB0008', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(745, 'AST-NB0008', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(746, 'AST-NB0009', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(747, 'AST-NB0009', 'Serial Number', '8CG1390GWK', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(748, 'AST-NB0009', 'HDD Model', 'SAMSUNG MZVLQ512HBLU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(749, 'AST-NB0009', 'HDD Serial Number', '0025_38D5_1112_60A9', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(750, 'AST-NB0009', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(751, 'AST-NB0009', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(752, 'AST-NB0010', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(753, 'AST-NB0010', 'MAC Address WiFi', 'A8:93:4A:01:83:15', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(754, 'AST-NB0010', 'Serial Number', '8CG14502D7', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(755, 'AST-NB0010', 'HDD Model', 'MTFDHBA512QFD-1AX1AABHA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(756, 'AST-NB0010', 'HDD Serial Number', '0000_0000_0000_0001_00A0_7521_31A2_2A26', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(757, 'AST-NB0010', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(758, 'AST-NB0010', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(759, 'AST-NB0011', 'MAC Address LAN', '34:6F:24:A8:83:E7', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(760, 'AST-NB0011', 'Serial Number', '8CG145ZN3B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(761, 'AST-NB0011', 'HDD Model', 'SAMSUNG MZVLQ512HBLU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(762, 'AST-NB0011', 'HDD Serial Number', '0025_38DA_1104_AF11', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(763, 'AST-NB0011', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(764, 'AST-NB0011', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(765, 'AST-NB0012', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(766, 'AST-NB0012', 'Serial Number', '8CG2021S73', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(767, 'AST-NB0012', 'HDD Model', 'NVMe INTEL SSDPEKNU512GZH', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(768, 'AST-NB0012', 'HDD Serial Number', '0000_0000_0100_0000_E4D2_5CB5_B0DA_5401', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(769, 'AST-NB0012', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(770, 'AST-NB0012', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(771, 'AST-NB0013', 'MAC Address LAN', 'A8:93:4A:CA:D6:49', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(772, 'AST-NB0013', 'Serial Number', '5CG1489GF5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(773, 'AST-NB0013', 'HDD Model', 'INTEL SSDPEKNW512G8H', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(774, 'AST-NB0013', 'HDD Serial Number', '0000_0000_0100_0000_E4D2_5CDF_DE14_5501', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(775, 'AST-NB0013', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(776, 'AST-NB0013', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(777, 'AST-NB0014', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(778, 'AST-NB0014', 'Serial Number', 'CND2272S29', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(779, 'AST-NB0014', 'HDD Model', 'SAMSUNG MZVL21T0HCLR-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(780, 'AST-NB0014', 'HDD Serial Number', '0025_38B5_21C4_5CE2', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(781, 'AST-NB0014', 'Memory Type (raw)', '30', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(782, 'AST-NB0014', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(783, 'AST-NB0015', 'MAC Address LAN', 'A0:59:50:72:BE:88', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(784, 'AST-NB0015', 'Serial Number', 'CND22512FM', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(785, 'AST-NB0015', 'HDD Model', 'WD PC SN810 SDCPNRY-1T00-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(786, 'AST-NB0015', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4B61_E1B7', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(787, 'AST-NB0015', 'Memory Type (raw)', '30', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(788, 'AST-NB0015', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(789, 'AST-NB0016', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(790, 'AST-NB0016', 'MAC Address WiFi', '14:13:33:8B:2D:9B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(791, 'AST-NB0016', 'Serial Number', '5CD220C4R2', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(792, 'AST-NB0016', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(793, 'AST-NB0016', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4B4E_8DA7', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(794, 'AST-NB0016', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(795, 'AST-NB0016', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(796, 'AST-NB0017', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(797, 'AST-NB0017', 'Serial Number', '5CD220C4N5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(798, 'AST-NB0017', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(799, 'AST-NB0017', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4B4B_206B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(800, 'AST-NB0017', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(801, 'AST-NB0017', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(802, 'AST-NB0018', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(803, 'AST-NB0018', 'MAC Address WiFi', '3C:21:9C:9B:05:B4', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(804, 'AST-NB0018', 'Serial Number', 'CND23522M8', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(805, 'AST-NB0018', 'HDD Model', 'SAMSUNG MZVL2512HCJQ-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(806, 'AST-NB0018', 'HDD Serial Number', '0025_38B7_21B8_97A1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(807, 'AST-NB0018', 'Memory Type (raw)', '30', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(808, 'AST-NB0018', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(809, 'AST-NB0019', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(810, 'AST-NB0019', 'MAC Address WiFi', '34:6F:24:D2:3D:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(811, 'AST-NB0019', 'Serial Number', '5CD2374KY6', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(812, 'AST-NB0019', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(813, 'AST-NB0019', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_486A_254E', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(814, 'AST-NB0019', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(815, 'AST-NB0019', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(816, 'AST-NB0020', 'MAC Address LAN', '34:6F:24:D2:43:35', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(817, 'AST-NB0020', 'Serial Number', '5CD2374KYH', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(818, 'AST-NB0020', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006 .', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(819, 'AST-NB0020', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_486A_DAFF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(820, 'AST-NB0020', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(821, 'AST-NB0020', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(822, 'AST-NB0021', 'MAC Address LAN', '40:A3:CC:B3:7C:C0', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(823, 'AST-NB0021', 'Serial Number', '5CD803257D', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(824, 'AST-NB0021', 'HDD Model', 'SAMSUNG MZVLW256HEHP-000H1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(825, 'AST-NB0021', 'HDD Serial Number', '0025_38BC_71B7_BE81', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(826, 'AST-NB0021', 'Memory Type (raw)', '35', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(827, 'AST-NB0021', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(828, 'AST-NB0022', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(829, 'AST-NB0022', 'MAC Address WiFi', '74:40:BB:49:A1:CF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(830, 'AST-NB0022', 'Serial Number', '8CG8284KBP', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(831, 'AST-NB0022', 'HDD Model', 'KXG50ZNV512G TOSHIBA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(832, 'AST-NB0022', 'HDD Serial Number', '0000_0000_0000_0010_0008_0D03_002F_FEA5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(833, 'AST-NB0022', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(834, 'AST-NB0022', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(835, 'AST-NB0023', 'MAC Address LAN', '34:6F:24:E2:9D:DF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(836, 'AST-NB0023', 'Serial Number', '5CD2374L23', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(837, 'AST-NB0023', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(838, 'AST-NB0023', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_486A_797E', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(839, 'AST-NB0023', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(840, 'AST-NB0023', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(841, 'AST-NB0024', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(842, 'AST-NB0024', 'Serial Number', '8CG33447J6', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(843, 'AST-NB0024', 'HDD Model', 'SK hynix PC801 HFS512GEJ9X101N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(844, 'AST-NB0024', 'HDD Serial Number', 'ACE4_2E00_3528_69D0_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(845, 'AST-NB0024', 'Memory Type (raw)', '43', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(846, 'AST-NB0024', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(847, 'AST-NB0025', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(848, 'AST-NB0025', 'Serial Number', '5CD2374L03', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(849, 'AST-NB0025', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(850, 'AST-NB0025', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_486A_DD4C', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(851, 'AST-NB0025', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(852, 'AST-NB0025', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(853, 'AST-NB0026', 'MAC Address WiFi', '34:6F:24:E2:06:0B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(854, 'AST-NB0026', 'Serial Number', '5CD2374L1D', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(855, 'AST-NB0026', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(856, 'AST-NB0026', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_486A_D678', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(857, 'AST-NB0026', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(858, 'AST-NB0026', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(859, 'AST-NB0027', 'MAC Address LAN', '00:30:91:81:7E:9B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(860, 'AST-NB0027', 'MAC Address WiFi', 'B4:8C:9D:27:E0:1F', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(861, 'AST-NB0027', 'Serial Number', '5CD24316XX', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(862, 'AST-NB0027', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(863, 'AST-NB0027', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4BFE_DC0B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(864, 'AST-NB0027', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(865, 'AST-NB0027', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(866, 'AST-NB0028', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(867, 'AST-NB0028', 'Serial Number', '6KT9JG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(868, 'AST-NB0028', 'HDD Model', 'NVMe PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(869, 'AST-NB0028', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_41A3_53BC', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(870, 'AST-NB0028', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(871, 'AST-NB0028', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(872, 'AST-NB0029', 'MAC Address LAN', 'B4:45:06:20:8C:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(873, 'AST-NB0029', 'Serial Number', '4W1BJG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(874, 'AST-NB0029', 'HDD Model', 'NVMe PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(875, 'AST-NB0029', 'HDD Serial Number', 'ACE4_2E00_164D_4A97_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(876, 'AST-NB0029', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(877, 'AST-NB0029', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(878, 'AST-NB0030', 'MAC Address LAN', 'B4:45:06:20:96:A6', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(879, 'AST-NB0030', 'Serial Number', '9PW9JG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(880, 'AST-NB0030', 'HDD Model', 'NVMe PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(881, 'AST-NB0030', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4956_55DC', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(882, 'AST-NB0030', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(883, 'AST-NB0030', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(884, 'AST-NB0031', 'MAC Address LAN', 'B4:45:06:20:85:DA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(885, 'AST-NB0031', 'Serial Number', 'GR69JG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(886, 'AST-NB0031', 'HDD Model', 'NVMe PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(887, 'AST-NB0031', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_41A3_E138', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(888, 'AST-NB0031', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(889, 'AST-NB0031', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(890, 'AST-NB0032', 'MAC Address LAN', 'B4:45:06:20:9B:95', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(891, 'AST-NB0032', 'Serial Number', '8W3BJG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(892, 'AST-NB0032', 'HDD Model', 'NVMe PC711 NVMe SK hynix 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(893, 'AST-NB0032', 'HDD Serial Number', 'ACE4_2E00_1638_8B58_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(894, 'AST-NB0032', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(895, 'AST-NB0032', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(896, 'AST-NB0033', 'MAC Address LAN', '60:DD:8E:1F:03:96', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(897, 'AST-NB0033', 'Serial Number', '6B3BJG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(898, 'AST-NB0033', 'HDD Model', 'KXG60ZNV512G NVMe KIOXIA 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(899, 'AST-NB0033', 'HDD Serial Number', '0000_0000_0000_0001_8CE3_8E03_006E_7C7E', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(900, 'AST-NB0033', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(901, 'AST-NB0033', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(902, 'AST-NB0034', 'MAC Address LAN', 'B4:45:06:20:A3:97', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(903, 'AST-NB0034', 'Serial Number', 'CGX9JG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(904, 'AST-NB0034', 'HDD Model', 'NVMe PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(905, 'AST-NB0034', 'HDD Serial Number', '0000_0000_0000_0001_8CE3_8E03_006E_7D1F', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(906, 'AST-NB0034', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(907, 'AST-NB0034', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(908, 'AST-NB0035', 'MAC Address LAN', 'B4:45:06:20:A1:AD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(909, 'AST-NB0035', 'Serial Number', '6FX9JG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(910, 'AST-NB0035', 'HDD Model', 'NVMe KXG60ZNV512G NVMe KIOXIA 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(911, 'AST-NB0035', 'HDD Serial Number', '0000_0000_0000_0001_8CE3_8E03_006E_7CFA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(912, 'AST-NB0035', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(913, 'AST-NB0035', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(914, 'AST-NB0036', 'MAC Address LAN', 'B4:45:06:20:82:C5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(915, 'AST-NB0036', 'Serial Number', '9169JG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(916, 'AST-NB0036', 'HDD Model', 'PC711 NVMe SK hynix 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(917, 'AST-NB0036', 'HDD Serial Number', 'ACE4_2E00_164D_8225_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(918, 'AST-NB0036', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(919, 'AST-NB0036', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(920, 'AST-NB0037', 'MAC Address LAN', 'B4:45:06:20:97:F3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(921, 'AST-NB0037', 'Serial Number', '70V9JG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(922, 'AST-NB0037', 'HDD Model', 'PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(923, 'AST-NB0037', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4956_5BAB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(924, 'AST-NB0037', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(925, 'AST-NB0037', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(926, 'AST-NB0038', 'MAC Address LAN', 'B4:45:06:20:8D:0B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(927, 'AST-NB0038', 'Serial Number', '3YX9JG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(928, 'AST-NB0038', 'HDD Model', 'PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(929, 'AST-NB0038', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_41C4_EFCE', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(930, 'AST-NB0038', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(931, 'AST-NB0038', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(932, 'AST-NB0039', 'MAC Address LAN', 'B4:45:06:20:9E:8D', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(933, 'AST-NB0039', 'Serial Number', 'D03BJG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(934, 'AST-NB0039', 'HDD Model', 'NVMe PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(935, 'AST-NB0039', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_41C9_A503', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(936, 'AST-NB0039', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(937, 'AST-NB0039', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(938, 'AST-NB0040', 'MAC Address LAN', '18:67:B0:D0:2C:29', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(939, 'AST-NB0040', 'Serial Number', 'JK7991CF200559', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(940, 'AST-NB0040', 'HDD Model', 'SAMSUNG MZMTD128HAFV-000', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(941, 'AST-NB0040', 'HDD Serial Number', 'S15MNYCD881656', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(942, 'AST-NB0040', 'Memory Type (raw)', 'DDR2', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(943, 'AST-NB0040', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(944, 'AST-NB0041', 'MAC Address LAN', '00:30:91:81:7E:9B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(945, 'AST-NB0041', 'MAC Address WiFi', '18:67:B0:D0:23:59', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(946, 'AST-NB0041', 'Serial Number', 'JK7991CF200489', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(947, 'AST-NB0041', 'HDD Model', 'SAMSUNG MZMTD128HAFV-000', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(948, 'AST-NB0041', 'HDD Serial Number', 'S15MNYCD830028', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(949, 'AST-NB0041', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(950, 'AST-NB0042', 'MAC Address LAN', '84:14:4D:70:51:A2', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(951, 'AST-NB0042', 'Serial Number', '8CG151BCP8', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(952, 'AST-NB0042', 'HDD Model', 'NVMe INTEL SSDPEKNU512GZH', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(953, 'AST-NB0042', 'HDD Serial Number', '0000_0000_0100_0000_E4D2_5C16_641C_5501', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(954, 'AST-NB0042', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(955, 'AST-NB0042', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(956, 'AST-NB0043', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(957, 'AST-NB0043', 'MAC Address WiFi', 'cc:47:40:87:77:83', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(958, 'AST-NB0043', 'Serial Number', '8CG3384W1R', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(959, 'AST-NB0043', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(960, 'AST-NB0043', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00F4_8A43', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(961, 'AST-NB0043', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(962, 'AST-NB0043', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(963, 'AST-NB0044', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(964, 'AST-NB0044', 'Serial Number', '5CD24918GF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(965, 'AST-NB0044', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(966, 'AST-NB0044', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00F4_8835', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(967, 'AST-NB0044', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(968, 'AST-NB0044', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(969, 'AST-NB0045', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(970, 'AST-NB0045', 'Serial Number', '8CG2430KYL', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(971, 'AST-NB0045', 'HDD Model', 'SAMSUNG MZVLQ512HBLU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(972, 'AST-NB0045', 'HDD Serial Number', '0025_38D6_21D3_E251', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(973, 'AST-NB0045', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(974, 'AST-NB0045', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(975, 'AST-NB0046', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(976, 'AST-NB0046', 'MAC Address WiFi', 'B4:8C:9D:18:CA:33', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(977, 'AST-NB0046', 'Serial Number', '5CD242B92N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(978, 'AST-NB0046', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(979, 'AST-NB0046', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00BA_4B79', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(980, 'AST-NB0046', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(981, 'AST-NB0046', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(982, 'AST-NB0047', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(983, 'AST-NB0047', 'Serial Number', '5CD24918FZ', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(984, 'AST-NB0047', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(985, 'AST-NB0047', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00F4_8BBF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(986, 'AST-NB0047', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(987, 'AST-NB0047', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(988, 'AST-NB0048', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(989, 'AST-NB0048', 'MAC Address WiFi', 'B8:08:CF:AD:2D:48', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(990, 'AST-NB0048', 'Serial Number', '8CG806868N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(991, 'AST-NB0048', 'HDD Model', 'ST500LT012-1DG142', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(992, 'AST-NB0048', 'HDD Serial Number', 'S3PDWXB5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(993, 'AST-NB0048', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(994, 'AST-NB0048', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(995, 'AST-NB0049', 'MAC Address LAN', 'B8:08:CF:AD:2D:48', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(996, 'AST-NB0049', 'Serial Number', '8CG806868N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(997, 'AST-NB0049', 'HDD Model', 'ST500LT012-1DG142', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(998, 'AST-NB0049', 'HDD Serial Number', 'S3PDWXB5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(999, 'AST-NB0049', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1000, 'AST-NB0049', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1001, 'AST-NB0050', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1002, 'AST-NB0050', 'Serial Number', '5CD242B910', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1003, 'AST-NB0050', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1004, 'AST-NB0050', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00BD_1074', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1005, 'AST-NB0050', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1006, 'AST-NB0050', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1007, 'AST-NB0051', 'MAC Address LAN', '84:69:93:68:31:5A', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1008, 'AST-NB0051', 'MAC Address WiFi', '14:13:33:8C:BE:C7', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1009, 'AST-NB0051', 'Serial Number', '5CD220F3JC', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1010, 'AST-NB0051', 'HDD Model', 'SK hynix PC711 HFS512GDE9X073N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1011, 'AST-NB0051', 'HDD Serial Number', 'ACE4_2E00_2554_54B6_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1012, 'AST-NB0051', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1013, 'AST-NB0051', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1014, 'AST-NB0052', 'MAC Address LAN', '5C:60:BA:5F:82:8E', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1015, 'AST-NB0052', 'MAC Address WiFi', '14:13:33:A2:28:B7', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1016, 'AST-NB0052', 'Serial Number', '5CD2270T14', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1017, 'AST-NB0052', 'HDD Model', 'WD PC SN810 SDCPNRY-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1018, 'AST-NB0052', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4931_EEC9', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1019, 'AST-NB0052', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1020, 'AST-NB0052', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1021, 'AST-NB0053', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1022, 'AST-NB0053', 'MAC Address WiFi', 'B4:8C:9D:18:CA:23', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1023, 'AST-NB0053', 'Serial Number', '5CD242B92L', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1024, 'AST-NB0053', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1025, 'AST-NB0053', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00BA_4BCF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1026, 'AST-NB0053', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1027, 'AST-NB0053', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1028, 'AST-NB0054', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1029, 'AST-NB0054', 'Serial Number', '8CG2490VRX', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1030, 'AST-NB0054', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1031, 'AST-NB0054', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E04_0415_9A42', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1032, 'AST-NB0054', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1033, 'AST-NB0054', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1034, 'AST-NB0055', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1035, 'AST-NB0055', 'Serial Number', '5CD243DHJ9', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1036, 'AST-NB0055', 'HDD Model', 'SK hynix BC711 HFM512GD3JX013N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1037, 'AST-NB0055', 'HDD Serial Number', 'ACE4_2E00_2AB0_FDAB_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1038, 'AST-NB0055', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1039, 'AST-NB0055', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1040, 'AST-NB0056', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1041, 'AST-NB0056', 'MAC Address WiFi', 'B4:8C:9D:20:4C:9B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1042, 'AST-NB0056', 'Serial Number', '5CD24317JT', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1043, 'AST-NB0056', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1044, 'AST-NB0056', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4BFE_D7C0', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1045, 'AST-NB0056', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1046, 'AST-NB0056', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1047, 'AST-NB0057', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1048, 'AST-NB0057', 'Serial Number', '5CD242B90P', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1049, 'AST-NB0057', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1050, 'AST-NB0057', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00BD_104C', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1051, 'AST-NB0057', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1052, 'AST-NB0057', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1053, 'AST-NB0058', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1054, 'AST-NB0058', 'Serial Number', '5CD24317N9', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1055, 'AST-NB0058', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1056, 'AST-NB0058', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4BFE_5FD7', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1057, 'AST-NB0058', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1058, 'AST-NB0058', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1059, 'AST-NB0059', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1060, 'AST-NB0059', 'Serial Number', '5CD238M3WD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1061, 'AST-NB0059', 'HDD Model', 'INTEL SSDPEKNU512GZH', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1062, 'AST-NB0059', 'HDD Serial Number', '0000_0000_0100_0000_E4D2_5C98_D2AD_5501', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1063, 'AST-NB0059', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1064, 'AST-NB0059', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1065, 'AST-NB0060', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1066, 'AST-NB0060', 'Serial Number', '5CD2374L8D', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1067, 'AST-NB0060', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1068, 'AST-NB0060', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_486A_D6DF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1069, 'AST-NB0060', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1070, 'AST-NB0060', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1071, 'AST-NB0061', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1072, 'AST-NB0061', 'MAC Address WiFi', '34:6F:24:E2:A2:B7', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1073, 'AST-NB0061', 'Serial Number', '5CD2374L3F', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1074, 'AST-NB0061', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1075, 'AST-NB0061', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_486A_24FF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1076, 'AST-NB0061', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1077, 'AST-NB0061', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1078, 'AST-NB0062', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1079, 'AST-NB0062', 'Serial Number', '5CD24918FR', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1080, 'AST-NB0062', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1081, 'AST-NB0062', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00F4_8CAF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1082, 'AST-NB0062', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1083, 'AST-NB0062', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1084, 'AST-NB0063', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1085, 'AST-NB0063', 'MAC Address WiFi', 'E8:FB:1C:4A:86:09', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1086, 'AST-NB0063', 'Serial Number', '5CD24918GL', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1087, 'AST-NB0063', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1088, 'AST-NB0063', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00F4_883A', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1089, 'AST-NB0063', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1090, 'AST-NB0063', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1091, 'AST-NB0064', 'MAC Address LAN', 'e8:fb:1c:47:9c:e1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1092, 'AST-NB0064', 'Serial Number', '5CD2491894', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1093, 'AST-NB0064', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1094, 'AST-NB0064', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00F4_85DA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1095, 'AST-NB0064', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1096, 'AST-NB0064', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1097, 'AST-NB0065', 'MAC Address LAN', '8C:1D:96:7B:B2:A4', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1098, 'AST-NB0065', 'Serial Number', '70V9JG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1099, 'AST-NB0065', 'HDD Model', 'PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1100, 'AST-NB0065', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4956_5BAB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1101, 'AST-NB0065', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1102, 'AST-NB0065', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1103, 'AST-NB0066', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1104, 'AST-NB0066', 'Serial Number', '5CD24918DJ', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1105, 'AST-NB0066', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1106, 'AST-NB0066', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00F4_8AA9', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1107, 'AST-NB0066', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1108, 'AST-NB0066', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1109, 'AST-NB0067', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1110, 'AST-NB0067', 'MAC Address WiFi', 'E8:FB:1C:49:54:31', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1111, 'AST-NB0067', 'Serial Number', '5CD249189K', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1112, 'AST-NB0067', 'HDD Model', 'KBG50ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1113, 'AST-NB0067', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_00F4_8C8F', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1114, 'AST-NB0067', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1115, 'AST-NB0067', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1116, 'AST-NB0068', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1117, 'AST-NB0068', 'Serial Number', '8CG33447QG', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1118, 'AST-NB0068', 'HDD Model', 'SK hynix PC801 HFS512GEJ9X101N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1119, 'AST-NB0068', 'HDD Serial Number', 'ACE4_2E00_3528_2B93_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1120, 'AST-NB0068', 'Memory Type (raw)', '43', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1121, 'AST-NB0068', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1122, 'AST-NB0069', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1123, 'AST-NB0069', 'Serial Number', '8CG3384W3B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1124, 'AST-NB0069', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05');
INSERT INTO `asset_hardware` (`id`, `kode_asset`, `komponen`, `spesifikasi`, `keterangan`, `created_at`, `updated_at`) VALUES
(1125, 'AST-NB0069', 'HDD Serial Number', '0025_38B4_3103_71A4', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1126, 'AST-NB0069', 'Memory Type (raw)', '43', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1127, 'AST-NB0069', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1128, 'AST-NB0070', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1129, 'AST-NB0070', 'Serial Number', 'PF4RNMR6', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1130, 'AST-NB0070', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BL2', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1131, 'AST-NB0070', 'HDD Serial Number', '0025_38B5_3102_B72A', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1132, 'AST-NB0070', 'Memory Type (raw)', '43', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1133, 'AST-NB0070', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1134, 'AST-NB0071', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1135, 'AST-NB0071', 'Serial Number', '8CG33447LF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1136, 'AST-NB0071', 'HDD Model', 'SK hynix PC801 HFS512GEJ9X101N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1137, 'AST-NB0071', 'HDD Serial Number', 'ACE4_2E00_3528_2B6A_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1138, 'AST-NB0071', 'Memory Type (raw)', '43', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1139, 'AST-NB0071', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1140, 'AST-NB0072', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1141, 'AST-NB0072', 'Serial Number', '8CG33447FH', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1142, 'AST-NB0072', 'HDD Model', 'SK hynix PC801 HFS512GEJ9X101N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1143, 'AST-NB0072', 'HDD Serial Number', 'ACE4_2E00_3528_5AE5_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1144, 'AST-NB0072', 'Memory Type (raw)', '43', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1145, 'AST-NB0072', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1146, 'AST-NB0073', 'MAC Address LAN', '50:5A:65:FF:9E:02', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1147, 'AST-NB0073', 'Serial Number', '8CG33447QL', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1148, 'AST-NB0073', 'HDD Model', 'SK hynix PC801 HFS512GEJ9X101N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1149, 'AST-NB0073', 'HDD Serial Number', 'ACE4_2E00_3528_2BB5_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1150, 'AST-NB0073', 'Memory Type (raw)', '43', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1151, 'AST-NB0073', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1152, 'AST-NB0074', 'MAC Address LAN', '00:e0:4c:68:04:2c', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1153, 'AST-NB0074', 'MAC Address WiFi', '74:13:ea:72:1d:c5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1154, 'AST-NB0074', 'Serial Number', 'CND3312107', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1155, 'AST-NB0074', 'HDD Model', 'SK hynix PC801 HFS001TEJ9X101N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1156, 'AST-NB0074', 'HDD Serial Number', 'ACE4_2E00_3AA5_2731_2EE4_AC00_0000_0001', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1157, 'AST-NB0074', 'Memory Type (raw)', '36', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1158, 'AST-NB0074', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1159, 'AST-NB0075', 'MAC Address LAN', 'CC:47:40:45:91:5F', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1160, 'AST-NB0075', 'Serial Number', '8CG3384Y0V', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1161, 'AST-NB0075', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1162, 'AST-NB0075', 'HDD Serial Number', '0025_38B4_3103_7225', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1163, 'AST-NB0075', 'Memory Type (raw)', '35', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1164, 'AST-NB0075', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1165, 'AST-NB0076', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1166, 'AST-NB0076', 'Serial Number', '8CG3390T6N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1167, 'AST-NB0076', 'HDD Model', 'WD PC SN740 SDDPNQD-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1168, 'AST-NB0076', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4AF6_82DA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1169, 'AST-NB0076', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1170, 'AST-NB0076', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1171, 'AST-NB0077', 'MAC Address LAN', '6C:F6:DA:66:A7:F5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1172, 'AST-NB0077', 'Serial Number', '5CD421DVNX', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1173, 'AST-NB0077', 'HDD Model', 'KXG80ZNV1T02 KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1174, 'AST-NB0077', 'HDD Serial Number', '0000_0000_0000_0000_8CE3_8E10_01E1_43E8', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1175, 'AST-NB0077', 'Memory Type (raw)', '43', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1176, 'AST-NB0077', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1177, 'AST-NB0078', 'MAC Address LAN', '00:30:91:81:7E:64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1178, 'AST-NB0078', 'MAC Address WiFi', 'CC:47:40:87:7C:ED', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1179, 'AST-NB0078', 'Serial Number', '8CG3384VZP', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1180, 'AST-NB0078', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1181, 'AST-NB0078', 'HDD Serial Number', '0025_38B4_3103_72CA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1182, 'AST-NB0078', 'Memory Type (raw)', '43', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1183, 'AST-NB0078', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1184, 'AST-NB0079', 'MAC Address LAN', 'F8:54:F6:6D:C0:73', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1185, 'AST-NB0079', 'MAC Address WiFi', 'F8:54:F6:6D:C0:72', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1186, 'AST-NB0079', 'Serial Number', '8CG3390034', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1187, 'AST-NB0079', 'HDD Model', 'WD PC SN740 SDDPNQD-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1188, 'AST-NB0079', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4C40_66C9', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1189, 'AST-NB0079', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1190, 'AST-NB0079', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1191, 'AST-NB0080', 'MAC Address LAN', 'CC:47:40:45:8D:E6', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1192, 'AST-NB0080', 'Serial Number', '8CG3384W58', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1193, 'AST-NB0080', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1194, 'AST-NB0080', 'HDD Serial Number', '0025_38B4_3103_718A.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1195, 'AST-NB0080', 'Memory Type (raw)', '43', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1196, 'AST-NB0081', 'MAC Address LAN', '50:5A:65:FF:9E:40', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1197, 'AST-NB0081', 'Serial Number', '8CG33447KB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1198, 'AST-NB0081', 'HDD Model', 'SK hynix PC801 HFS512GEJ9X101N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1199, 'AST-NB0081', 'HDD Serial Number', 'ACE4_2E00_3528_69DD_2EE4_AC00_0000_0001.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1200, 'AST-NB0082', 'MAC Address LAN', 'CC:47:40:45:91:4C', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1201, 'AST-NB0082', 'Serial Number', '8CG3384W5L', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1202, 'AST-NB0082', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1203, 'AST-NB0082', 'HDD Serial Number', '0025_38B4_3103_71CA.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1204, 'AST-NB0083', 'MAC Address LAN', '98:5F:41:68:96:C8', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1205, 'AST-NB0083', 'Serial Number', 'CND4330S64', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1206, 'AST-NB0083', 'HDD Model', 'SAMSUNG MZVL81T0HELB-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1207, 'AST-NB0083', 'HDD Serial Number', '0025_3847_41BB_6AE5.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1208, 'AST-NB0084', 'MAC Address LAN', 'CC:47:40:45:91:54', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1209, 'AST-NB0084', 'Serial Number', '8CG3384Y1K', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1210, 'AST-NB0084', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1211, 'AST-NB0084', 'HDD Serial Number', '0025_38B4_3103_724B.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1212, 'AST-NB0085', 'MAC Address LAN', '98:2C:BC:24:D5:B9', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1213, 'AST-NB0085', 'Serial Number', '5CD92058MY', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1214, 'AST-NB0085', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1215, 'AST-NB0085', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4B4E_83D3.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1216, 'AST-NB0086', 'MAC Address LAN', 'CC:47:40:87:77:82', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1217, 'AST-NB0086', 'Serial Number', '8CG3384W1R', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1218, 'AST-NB0086', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1219, 'AST-NB0086', 'HDD Serial Number', '0025_38B4_3103_7265.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1220, 'AST-NB0087', 'MAC Address LAN', 'CC:47:40:87:77:26', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1221, 'AST-NB0087', 'Serial Number', '8CG3384W0N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1222, 'AST-NB0087', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1223, 'AST-NB0087', 'HDD Serial Number', '0025_38B4_3103_70D9.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1224, 'AST-NB0088', 'MAC Address LAN', '68:C6:AC:BB:24:65', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1225, 'AST-NB0088', 'Serial Number', '8CG43410MC', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1226, 'AST-NB0088', 'HDD Model', 'SAMSUNG MZVL8512HELU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1227, 'AST-NB0088', 'HDD Serial Number', '0025_38BB_31B0_3A76.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1228, 'AST-NB0089', 'MAC Address LAN', '28:D0:43:E1:52:DB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1229, 'AST-NB0089', 'Serial Number', '5CD439H5S2', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1230, 'AST-NB0089', 'HDD Model', 'SAMSUNG MZVL21T0HCLR-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1231, 'AST-NB0089', 'HDD Serial Number', '0025_3845_41B4_B081.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1232, 'AST-NB0090', 'MAC Address LAN', 'AC:74:B1:D3:26:4B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1233, 'AST-NB0090', 'Serial Number', '8CG1512KHL', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1234, 'AST-NB0090', 'HDD Model', 'NVMe INTEL SSDPEKNU512GZH', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1235, 'AST-NB0090', 'HDD Serial Number', '0000_0000_0100_0000_E4D2_5C3F_CFC6_5401.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1236, 'AST-NB0091', 'MAC Address LAN', 'CC:47:40:45:5E:7A', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1237, 'AST-NB0091', 'Serial Number', '8CG3384W15', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1238, 'AST-NB0091', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1239, 'AST-NB0091', 'HDD Serial Number', '0025_38B4_3103_70C3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1240, 'AST-NB0092', 'MAC Address LAN', '7C:B2:7D:D6:26:C5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1241, 'AST-NB0092', 'Serial Number', '5CG9416JHR', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1242, 'AST-NB0092', 'HDD Model', 'SAMSUNG MZVLB512HAJQ-000H1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1243, 'AST-NB0092', 'HDD Serial Number', '0025_3889_91C7_5B1D', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1244, 'AST-NB0093', 'MAC Address LAN', '98:5F:41:67:25:EA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1245, 'AST-NB0093', 'Serial Number', 'CND4330SNY', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1246, 'AST-NB0093', 'HDD Model', 'SAMSUNG MZVL81T0HELB-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1247, 'AST-NB0093', 'HDD Serial Number', '0025_3847_41BA_2F5E', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1248, 'AST-NB0094', 'MAC Address LAN', 'CC:47:40:87:77:82', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1249, 'AST-NB0094', 'Serial Number', '8CG3384W1R', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1250, 'AST-NB0094', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1251, 'AST-NB0094', 'HDD Serial Number', '0025_38B4_3103_70D9.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1252, 'AST-NB0095', 'MAC Address LAN', 'CC:47:40:88:13:92', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1253, 'AST-NB0095', 'Serial Number', '8CG3384W32', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1254, 'AST-NB0095', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1255, 'AST-NB0095', 'HDD Serial Number', '0025_38B4_3103_7155.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1256, 'AST-NB0096', 'MAC Address LAN', 'CC:47:40:45:91:44', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1257, 'AST-NB0096', 'Serial Number', '8CG3384Y19', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1258, 'AST-NB0096', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1259, 'AST-NB0096', 'HDD Serial Number', '0025_38B4_3103_7264', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1260, 'AST-NB0097', 'MAC Address LAN', '44:A3:BB:03:AC:72', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1261, 'AST-NB0097', 'Serial Number', 'CND4490JS6', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1262, 'AST-NB0097', 'HDD Model', 'SAMSUNG MZVL81T0HELB-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1263, 'AST-NB0097', 'HDD Serial Number', '0025_384A_41B1_56B3.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1264, 'AST-NB0098', 'MAC Address LAN', '7C:B2:7D:D6:26:B1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1265, 'AST-NB0098', 'Serial Number', '5CG9416JHP', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1266, 'AST-NB0098', 'HDD Model', 'SAMSUNG MZVLB512HAJQ-000H1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1267, 'AST-NB0098', 'HDD Serial Number', '0025_3889_91C7_5AC2', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1268, 'AST-NB0099', 'MAC Address LAN', 'CC:47:40:87:77:58', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1269, 'AST-NB0099', 'Serial Number', '8CG3384W34', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1270, 'AST-NB0099', 'HDD Model', 'SAMSUNG MZVL2512HDJD-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1271, 'AST-NB0099', 'HDD Serial Number', '0025_38B4_3103_7157', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1272, 'AST-NB0100', 'MAC Address LAN', 'A8:59:5F:E7:CB:5A', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1273, 'AST-NB0100', 'Serial Number', 'CND436291X', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1274, 'AST-NB0100', 'HDD Model', 'SAMSUNG MZVL8512HELU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1275, 'AST-NB0100', 'HDD Serial Number', '0025_3845_41B2_03DA.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1276, 'AST-NB0101', 'MAC Address LAN', '44:A3:BB:23:65:8F', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1277, 'AST-NB0101', 'Serial Number', 'CND450192F', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1278, 'AST-NB0101', 'HDD Model', 'SAMSUNG MZVL21T0HCLR-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1279, 'AST-NB0101', 'HDD Serial Number', '0025_38B2_41B6_81FD.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1280, 'AST-NB0102', 'MAC Address LAN', '44:A3:BB:23:67:74', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1281, 'AST-NB0102', 'Serial Number', 'CND45018YL', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1282, 'AST-NB0102', 'HDD Model', 'SAMSUNG MZVL21T0HCLR-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1283, 'AST-NB0102', 'HDD Serial Number', '0025_38B2_41B6_7E94.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1284, 'AST-NB0103', 'MAC Address LAN', '44:A3:BB:23:69:86', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1285, 'AST-NB0103', 'Serial Number', 'CND45018XL', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1286, 'AST-NB0103', 'HDD Model', 'SAMSUNG MZVL21T0HCLR-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1287, 'AST-NB0103', 'HDD Serial Number', '0025_38B2_41B6_7ECC.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1288, 'AST-NB0104', 'MAC Address LAN', '48:EA:62:00:82:F8', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1289, 'AST-NB0104', 'Serial Number', 'CND45018ZH', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1290, 'AST-NB0104', 'HDD Model', 'SAMSUNG MZVL21T0HCLR-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1291, 'AST-NB0104', 'HDD Serial Number', '0025_38B2_41B6_7EB1.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1292, 'AST-NB0105', 'MAC Address LAN', '70:08:10:65:68:AF', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1293, 'AST-NB0105', 'Serial Number', '5CD5180FQV', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1294, 'AST-NB0105', 'HDD Model', 'PC SN5000S SDEPNSJ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1295, 'AST-NB0105', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4545_9688', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1296, 'AST-NB0106', 'MAC Address LAN', 'B4:8C:9D:27:E0:1E', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1297, 'AST-NB0106', 'Serial Number', '5CD24316XX', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1298, 'AST-NB0106', 'HDD Model', 'WDC PC SN530 SDBPNPZ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1299, 'AST-NB0106', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4BFE_DC0B.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1300, 'AST-NB0107', 'MAC Address LAN', '44:A3:BB:23:66:39', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1301, 'AST-NB0107', 'Serial Number', 'CND450195Y', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1302, 'AST-NB0107', 'HDD Model', 'SAMSUNG MZVL21T0HCLR-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1303, 'AST-NB0107', 'HDD Serial Number', '0025_38B2_41B6_7FDE.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1304, 'AST-NB0108', 'MAC Address LAN', '70:08:10:63:72:A6', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1305, 'AST-NB0108', 'Serial Number', '5CD5180FQR', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1306, 'AST-NB0108', 'HDD Model', 'PC SN5000S SDEPNSJ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1307, 'AST-NB0108', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4545_9655.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1308, 'AST-NB0109', 'MAC Address LAN', 'AC:74:B1:A1:56:93', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1309, 'AST-NB0109', 'Serial Number', 'Latitude 3420', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1310, 'AST-NB0109', 'HDD Model', 'NVMe PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1311, 'AST-NB0109', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_41C9_5B41', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1312, 'AST-NB0110', 'MAC Address LAN', 'B4:45:06:20:87:CE', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1313, 'AST-NB0110', 'Serial Number', 'DK3BJG3', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1314, 'AST-NB0110', 'HDD Model', 'NVMe PC SN730 NVMe WDC 512GB', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1315, 'AST-NB0110', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_41C9_5B41', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1316, 'AST-NB0110', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1317, 'AST-NB0110', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1318, 'AST-NB0111', 'MAC Address LAN', '10:B6:76:80:BC:B0', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1319, 'AST-NB0111', 'Serial Number', '5CD51779T9', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1320, 'AST-NB0111', 'HDD Model', 'WD PC SN810 SDCPNRY-1T00-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1321, 'AST-NB0111', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4DE0_6EAF.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1322, 'AST-NB0112', 'MAC Address LAN', '24:FB:E3:2E:07:26', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1323, 'AST-NB0112', 'Serial Number', '5CD5180FQX', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1324, 'AST-NB0112', 'HDD Model', 'PC SN5000S SDEPNSJ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1325, 'AST-NB0112', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4545_9613', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1326, 'AST-NB0113', 'MAC Address LAN', '70:08:10:63:86:DD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1327, 'AST-NB0113', 'Serial Number', '5CD5180FQZ', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1328, 'AST-NB0113', 'HDD Model', 'PC SN5000S SDEPNSJ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1329, 'AST-NB0113', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4545_6F86', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1330, 'AST-NB0114', 'MAC Address LAN', '70:08:10:65:68:B8', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1331, 'AST-NB0114', 'Serial Number', '5CD5180FQW', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1332, 'AST-NB0114', 'HDD Model', 'PC SN5000S SDEPNSJ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1333, 'AST-NB0114', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4545_961A', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1334, 'AST-NB0115', 'MAC Address LAN', '70:08:10:63:75:67', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1335, 'AST-NB0115', 'Serial Number', '5CD5180FQS', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1336, 'AST-NB0115', 'HDD Model', 'PC SN5000S SDEPNSJ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1337, 'AST-NB0115', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4545_9687', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1338, 'AST-NB0116', 'MAC Address LAN', '70:08:10:65:68:63', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1339, 'AST-NB0116', 'Serial Number', '5CD5180FQY', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1340, 'AST-NB0116', 'HDD Model', 'PC SN5000S SDEPNSJ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1341, 'AST-NB0116', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4545_6D0E.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1342, 'AST-NB0117', 'MAC Address LAN', '98:5F:41:70:69:20', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1343, 'AST-NB0117', 'Serial Number', 'CND4330S21', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1344, 'AST-NB0117', 'HDD Model', 'SAMSUNG MZVL81T0HELB-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1345, 'AST-NB0117', 'HDD Serial Number', '0025_3847_41BB_6923', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1346, 'AST-NB0118', 'MAC Address LAN', '70:08:10:63:75:94', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1347, 'AST-NB0118', 'Serial Number', '5CD5180FQT', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1348, 'AST-NB0118', 'HDD Model', 'PC SN5000S SDEPNSJ-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1349, 'AST-NB0118', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_444A_4545_9667', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1350, 'AST-NB0119', 'MAC Address LAN', 'A8:59:5F:E8:17:2C', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1351, 'AST-NB0119', 'Serial Number', 'CND436291V', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1352, 'AST-NB0119', 'HDD Model', 'SAMSUNG MZVL8512HELU-00BH1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1353, 'AST-NB0119', 'HDD Serial Number', '0025_3845_41B2_03E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1354, 'AST-NB0120', 'MAC Address LAN', '7C:B2:7D:D6:26:C0', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1355, 'AST-NB0120', 'Serial Number', '5CG9415XLP', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1356, 'AST-NB0120', 'HDD Model', 'SAMSUNG MZVLB512HAJQ-000H1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1357, 'AST-NB0120', 'HDD Serial Number', '0025_3889_91C7_5C11.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1358, 'AST-NB0121', 'MAC Address LAN', '28:D0:43:31:57:3B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1359, 'AST-NB0121', 'Serial Number', '8CG4254C72', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1360, 'AST-NB0121', 'HDD Model', 'SK hynix BC901 HFS512GEJ9X108N', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1361, 'AST-NB0121', 'HDD Serial Number', '0000_0000_0000_0000_ACE4_2E00_4A5E_2779.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1362, 'AST-NB0122', 'MAC Address LAN', 'F8:E4:3B:96:A3:E5', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1363, 'AST-NB0122', 'Serial Number', '8CG331076K', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1364, 'AST-NB0122', 'HDD Model', 'WD PC SN740 SDDPNQD-512G-1006', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1365, 'AST-NB0122', 'HDD Serial Number', 'E823_8FA6_BF53_0001_001B_448B_4AB5_6070', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1366, 'AST-NB0122', 'Memory Type (raw)', '32', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1367, 'AST-NB0122', 'Display', 'LCD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1368, 'AST-NB0123', 'MAC Address LAN', '00:68:EB:63:7A:0B', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1369, 'AST-NB0123', 'Serial Number', '5CG9416JHH', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1370, 'AST-NB0123', 'HDD Model', 'SAMSUNG MZVLB512HAJQ-000H1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1371, 'AST-NB0123', 'HDD Serial Number', '0025_3889_91C7_5768.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1372, 'AST-NB0123', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1373, 'AST-NB0124', 'MAC Address LAN', '00:68:EB:63:7A:B6', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1374, 'AST-NB0124', 'Serial Number', '5CG9416JHG', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1375, 'AST-NB0124', 'HDD Model', 'KXG60ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1376, 'AST-NB0124', 'HDD Serial Number', '0000_0000_0000_0001_8CE3_8E10_0048_5ED7.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1377, 'AST-NB0124', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1378, 'AST-NB0125', 'MAC Address LAN', '00:68:EB:64:62:10', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1379, 'AST-NB0125', 'Serial Number', '5CG9416JHD', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1380, 'AST-NB0125', 'HDD Model', 'SAMSUNG MZVLB512HAJQ-000H1', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1381, 'AST-NB0125', 'HDD Serial Number', '0025_3889_91C7_571F.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1382, 'AST-NB0125', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1383, 'AST-NB0126', 'MAC Address LAN', '00:68:EB:63:AA:68', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1384, 'AST-NB0126', 'Serial Number', '5CG9416JHC', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1385, 'AST-NB0126', 'HDD Model', 'KXG60ZNV512G KIOXIA', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1386, 'AST-NB0126', 'HDD Serial Number', '0000_0000_0000_0001_8CE3_8E03_005C_5A12.', NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(1387, 'AST-NB0126', 'Memory Type (raw)', '26', 'Nilai asli dari Excel, format tidak jelas - cek manual', '2026-08-28 15:13:05', '2026-08-28 15:13:05');

-- --------------------------------------------------------

--
-- Struktur dari tabel `asset_hardware_detail`
--

CREATE TABLE `asset_hardware_detail` (
  `kode_asset` varchar(50) NOT NULL,
  `serial_no_pc` varchar(100) DEFAULT NULL,
  `mobo_type` varchar(100) DEFAULT NULL,
  `kelas` varchar(50) DEFAULT NULL,
  `processor` varchar(150) DEFAULT NULL,
  `hdd_size` varchar(50) DEFAULT NULL,
  `hdd_model` varchar(150) DEFAULT NULL,
  `hdd_serial_no` varchar(100) DEFAULT NULL,
  `memory_size` varchar(50) DEFAULT NULL,
  `memory_type` varchar(50) DEFAULT NULL,
  `display` varchar(100) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `asset_hardware_detail`
--

INSERT INTO `asset_hardware_detail` (`kode_asset`, `serial_no_pc`, `mobo_type`, `kelas`, `processor`, `hdd_size`, `hdd_model`, `hdd_serial_no`, `memory_size`, `memory_type`, `display`, `updated_at`) VALUES
('AST-NB0001', '8CG1390GTT', 'HP Pavilion Aero Laptop 13-be0xxx', NULL, 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', 'SAMSUNG MZVLQ512HBLU-00BH1', '0025_38D5_1112_9BF4', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0002', '5CD14478YY', 'HP Pavilion Gaming Laptop 15-ec2xxx', NULL, 'AMD Ryzen 5 5600H with Radeon Graphics', '500GB', 'MTFDHBA512TDV-1AZ1AABHA', '0000_0000_0000_0001_00A0_7521_2E53_9699', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0003', '8CG1387KLD', 'HP Pavilion Aero Laptop 13-be0xxx', NULL, 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', 'SAMSUNG MZVLQ512HBLU-00BH1', '0025_38D5_1112_7BAD', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0004', '8CG1387KTS', 'HP Pavilion Aero Laptop 13-be0xxx', NULL, 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', 'SAMSUNG MZVLQ512HBLU-00BH1', '0025_38D5_1112_7C66.', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0005', '8CG1474Y14', 'HP Pavilion x360 Convertible 14-dy0xxx', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe SK hynix BC711 HFM512GD3JX013N', 'ACE4_2E00_1665_C3DB_2EE4_AC00_0000_0001', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0006', '8CG145ZMYP', 'HP Pavilion Aero Laptop 13-be0xxx', NULL, 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', 'SAMSUNG MZVLQ512HBLU-00BH1', '0025_38DA_1104_B531', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0007', '8CG145ZN6M', 'HP Pavilion Aero Laptop 13-be0xxx', NULL, 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', 'SAMSUNG MZVLQ512HBLU-00BH1', '0025_38DA_1104_96F2', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0008', '8CG145028F', 'HP Pavilion Aero Laptop 13-be0xxx', NULL, 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', 'MTFDHBA512QFD-1AX1AABHA', '0000_0000_0000_0001_00A0_7521_31A2_2BEA', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0009', '8CG1390GWK', 'HP Pavilion Aero Laptop 13-be0xxx', NULL, 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', 'SAMSUNG MZVLQ512HBLU-00BH1', '0025_38D5_1112_60A9', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0010', '8CG14502D7', 'HP Pavilion Aero Laptop 13-be0xxx', NULL, 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', 'MTFDHBA512QFD-1AX1AABHA', '0000_0000_0000_0001_00A0_7521_31A2_2A26', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0011', '8CG145ZN3B', 'HP Pavilion Aero Laptop 13-be0xxx', NULL, 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', 'SAMSUNG MZVLQ512HBLU-00BH1', '0025_38DA_1104_AF11', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0012', '8CG2021S73', 'HP Pavilion x360 Convertible 14-dy0xxx', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe INTEL SSDPEKNU512GZH', '0000_0000_0100_0000_E4D2_5CB5_B0DA_5401', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0013', '5CG1489GF5', 'HP ProBook x360 435 G8 Notebook PC', NULL, 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', 'INTEL SSDPEKNW512G8H', '0000_0000_0100_0000_E4D2_5CDF_DE14_5501', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0014', 'CND2272S29', 'HP Spectre x360 2-in-1 Laptop 14-ef0xxx', NULL, '12th Gen Intel(R) Core(TM) i7-1255U', '1TB', 'SAMSUNG MZVL21T0HCLR-00BH1', '0025_38B5_21C4_5CE2', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0015', 'CND22512FM', 'HP Spectre x360 2-in-1 Laptop 14-ef0xxx', NULL, '12th Gen Intel(R) Core(TM) i7-1255U', '1TB', 'WD PC SN810 SDCPNRY-1T00-1006', 'E823_8FA6_BF53_0001_001B_448B_4B61_E1B7', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0016', '5CD220C4R2', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U, 2495MHz', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_448B_4B4E_8DA7', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0017', '5CD220C4N5', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_448B_4B4B_206B', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0018', 'CND23522M8', 'HP ENVY x360 2-in-1 Laptop 13-bf0xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1230U, 1689MHz', '500GB', 'SAMSUNG MZVL2512HCJQ-00BH1', '0025_38B7_21B8_97A1', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0019', '5CD2374KY6', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_486A_254E', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0020', '5CD2374KYH', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006 .', 'E823_8FA6_BF53_0001_001B_444A_486A_DAFF', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0021', '5CD803257D', 'HP Spectre x360 Convertible 13-ae0xx', NULL, 'Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz', '256GB', 'SAMSUNG MZVLW256HEHP-000H1', '0025_38BC_71B7_BE81', '4GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0022', '8CG8284KBP', 'HP ENVY x360 Convertible 13-ag0xxx', NULL, 'AMD Ryzen 5 2500U with Radeon Vega Mobile Gfx', '500GB', 'KXG50ZNV512G TOSHIBA', '0000_0000_0000_0010_0008_0D03_002F_FEA5', '4GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0023', '5CD2374L23', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_486A_797E', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0024', '8CG33447J6', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SK hynix PC801 HFS512GEJ9X101N', 'ACE4_2E00_3528_69D0_2EE4_AC00_0000_0001', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0025', '5CD2374L03', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_486A_DD4C', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0026', '5CD2374L1D', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_486A_D678', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0027', '5CD24316XX', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i7-1255U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_448B_4BFE_DC0B', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0028', '6KT9JG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe PC SN730 NVMe WDC 512GB', 'E823_8FA6_BF53_0001_001B_448B_41A3_53BC', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0029', '4W1BJG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe PC SN730 NVMe WDC 512GB', 'ACE4_2E00_164D_4A97_2EE4_AC00_0000_0001', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0030', '9PW9JG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe PC SN730 NVMe WDC 512GB', 'E823_8FA6_BF53_0001_001B_444A_4956_55DC', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0031', 'GR69JG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe PC SN730 NVMe WDC 512GB', 'E823_8FA6_BF53_0001_001B_448B_41A3_E138', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0032', '8W3BJG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe PC711 NVMe SK hynix 512GB', 'ACE4_2E00_1638_8B58_2EE4_AC00_0000_0001', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0033', '6B3BJG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'KXG60ZNV512G NVMe KIOXIA 512GB', '0000_0000_0000_0001_8CE3_8E03_006E_7C7E', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0034', 'CGX9JG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe PC SN730 NVMe WDC 512GB', '0000_0000_0000_0001_8CE3_8E03_006E_7D1F', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0035', '6FX9JG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe KXG60ZNV512G NVMe KIOXIA 512GB', '0000_0000_0000_0001_8CE3_8E03_006E_7CFA', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0036', '9169JG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'PC711 NVMe SK hynix 512GB', 'ACE4_2E00_164D_8225_2EE4_AC00_0000_0001', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0037', '70V9JG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'PC SN730 NVMe WDC 512GB', 'E823_8FA6_BF53_0001_001B_444A_4956_5BAB', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0038', '3YX9JG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'PC SN730 NVMe WDC 512GB', 'E823_8FA6_BF53_0001_001B_448B_41C4_EFCE', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0039', 'D03BJG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe PC SN730 NVMe WDC 512GB', 'E823_8FA6_BF53_0001_001B_448B_41C9_A503', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0040', 'JK7991CF200559', '905S3G/906S3G/915S3G', NULL, 'Quad-Core Processor (up to 1.4GHz)', '128GB', 'SAMSUNG MZMTD128HAFV-000', 'S15MNYCD881656', '4GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0041', 'JK7991CF200489', '905S3G/906S3G/915S3G/9305SG', NULL, 'Quad-Core Processor (up to 1.4GHz)', '1TB', 'SAMSUNG MZMTD128HAFV-000', 'S15MNYCD830028', '4GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0042', '8CG151BCP8', 'HP Pavilion x360 Convertible 14-dy0xxx', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe INTEL SSDPEKNU512GZH', '0000_0000_0100_0000_E4D2_5C16_641C_5501', '4GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0043', '8CG3384W1R', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00F4_8A43', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0044', '5CD24918GF', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00F4_8835', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0045', '8CG2430KYL', 'HP Pavilion x360 2-in-1 Laptop 14-ek0xxx', NULL, '12th Gen Intel(R) Core(TM) i7-1255U', '500GB', 'SAMSUNG MZVLQ512HBLU-00BH1', '0025_38D6_21D3_E251', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0046', '5CD242B92N', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00BA_4B79', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0047', '5CD24918FZ', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00F4_8BBF', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0048', '8CG806868N', 'HP Pavilion Laptop 14-dv2xxx', NULL, 'Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz', '500GB', 'ST500LT012-1DG142', 'S3PDWXB5', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0049', '8CG806868N', 'HP Pavilion x360 Convertible 14-ba1xx', NULL, 'Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz', '500GB', 'ST500LT012-1DG142', 'S3PDWXB5', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0050', '5CD242B910', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00BD_1074', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0051', '5CD220F3JC', 'Victus by HP Gaming Laptop 15-fb0xxx', NULL, 'AMD Ryzen 7 5800H with Radeon Graphics', '500GB', 'SK hynix PC711 HFS512GDE9X073N', 'ACE4_2E00_2554_54B6_2EE4_AC00_0000_0001', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0052', '5CD2270T14', 'Victus by HP Gaming Laptop 15-fb0xxx', NULL, 'AMD Ryzen 7 5800H with Radeon Graphics', '500GB', 'WD PC SN810 SDCPNRY-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_4931_EEC9', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0053', '5CD242B92L', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00BA_4BCF', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0054', '8CG2490VRX', 'HP Pavilion x360 2-in-1 Laptop 14-ek0xxx', NULL, '12th Gen Intel(R) Core(TM) i7-1255U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E04_0415_9A42', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0055', '5CD243DHJ9', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'SK hynix BC711 HFM512GD3JX013N', 'ACE4_2E00_2AB0_FDAB_2EE4_AC00_0000_0001', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0056', '5CD24317JT', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_448B_4BFE_D7C0', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0057', '5CD242B90P', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00BD_104C', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0058', '5CD24317N9', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_448B_4BFE_5FD7', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0059', '5CD238M3WD', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'INTEL SSDPEKNU512GZH', '0000_0000_0100_0000_E4D2_5C98_D2AD_5501', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0060', '5CD2374L8D', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_486A_D6DF', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0061', '5CD2374L3F', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_486A_24FF', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0062', '5CD24918FR', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00F4_8CAF', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0063', '5CD24918GL', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00F4_883A', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0064', '5CD2491894', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00F4_85DA', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0065', '70V9JG3', 'Latitude 3420', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'PC SN730 NVMe WDC 512GB', 'E823_8FA6_BF53_0001_001B_444A_4956_5BAB', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0066', '5CD24918DJ', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00F4_8AA9', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0067', '5CD249189K', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', 'KBG50ZNV512G KIOXIA', '0000_0000_0000_0000_8CE3_8E10_00F4_8C8F', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0068', '8CG33447QG', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SK hynix PC801 HFS512GEJ9X101N', 'ACE4_2E00_3528_2B93_2EE4_AC00_0000_0001', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0069', '8CG3384W3B', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_71A4', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0070', 'PF4RNMR6', 'Yoga Slim 7 Carbon 13IRP8', NULL, '13th Gen Intel(R) Core(TM) i5-1340P', '500GB', 'SAMSUNG MZVL2512HDJD-00BL2', '0025_38B5_3102_B72A', '2GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0071', '8CG33447LF', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SK hynix PC801 HFS512GEJ9X101N', 'ACE4_2E00_3528_2B6A_2EE4_AC00_0000_0001', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0072', '8CG33447FH', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SK hynix PC801 HFS512GEJ9X101N', 'ACE4_2E00_3528_5AE5_2EE4_AC00_0000_0001', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0073', '8CG33447QL', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SK hynix PC801 HFS512GEJ9X101N', 'ACE4_2E00_3528_2BB5_2EE4_AC00_0000_0001', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0074', 'CND3312107', 'HP Spectre x360 2-in-1 Laptop 14-ef2xxx', NULL, '13th Gen Intel(R) Core(TM) i7-1355U', '1TB', 'SK hynix PC801 HFS001TEJ9X101N', 'ACE4_2E00_3AA5_2731_2EE4_AC00_0000_0001', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0075', '8CG3384Y0V', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_7225', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0076', '8CG3390T6N', 'HP Pavilion x360 2-in-1 Laptop 14-ek1xxx', NULL, '13th Gen Intel(R) Core(TM) i7-1355U', '500GB', 'WD PC SN740 SDDPNQD-512G-1006', 'E823_8FA6_BF53_0001_001B_448B_4AF6_82DA', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0077', '5CD421DVNX', 'HP Spectre x360 2-in-1 Laptop 14-eu0xxx', NULL, 'Intel® Core™ Ultra 7 155H', '1TB', 'KXG80ZNV1T02 KIOXIA', '0000_0000_0000_0000_8CE3_8E10_01E1_43E8', '32GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0078', '8CG3384VZP', 'HP Pavilion Laptop 14-ew0xxx', NULL, '13th Gen Intel® Core™ i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_72CA', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0079', '8CG3390034', 'HP Pavililion x360 2-in-1 Laptop-ek1xxx', NULL, '13th Gen Intel® Core™ i7-1355U', '500GB', 'WD PC SN740 SDDPNQD-512G-1006', 'E823_8FA6_BF53_0001_001B_448B_4C40_66C9', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0080', '8CG3384W58', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '953.9GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_718A.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0081', '8CG33447KB', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SK hynix PC801 HFS512GEJ9X101N', 'ACE4_2E00_3528_69DD_2EE4_AC00_0000_0001.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0082', '8CG3384W5L', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, 'Intel(R) Core(TM) Ultra 7 155U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_71CA.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0083', 'CND4330S64', 'HP Envy x360 2-in-1 Laptop 14-fc0xxx', NULL, 'Intel(R) Core(TM) Ultra 7 155U', '1TB', 'SAMSUNG MZVL81T0HELB-00BH1', '0025_3847_41BB_6AE5.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0084', '8CG3384Y1K', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_724B.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0085', '5CD92058MY', 'Microsoft Windows 10 Pro 64-Bit', NULL, 'intel(R) Core(TM) i5-8265U CPU @ 1.60GHz', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_448B_4B4E_83D3.', '8GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0086', '8CG3384W1R', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_7265.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0087', '8CG3384W0N', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_70D9.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0088', '8CG43410MC', 'HP OmniBook Ultra Flip Laptop 14-fh0xxx', NULL, 'Intel(R) Core(TM) 5 120U', '1 TB', 'SAMSUNG MZVL8512HELU-00BH1', '0025_38BB_31B0_3A76.', '32GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0089', '5CD439H5S2', 'HP Pavilion x360 2-in-1 Laptop 14-ek2xxx', NULL, 'Intel(R) Core(TM) Ultra 7 258V', '512GB', 'SAMSUNG MZVL21T0HCLR-00BH1', '0025_3845_41B4_B081.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0090', '8CG1512KHL', 'HP Pavilion x360 Convertible 14-dy0xxx', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe INTEL SSDPEKNU512GZH', '0000_0000_0100_0000_E4D2_5C3F_CFC6_5401.', '8GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0091', '8CG3384W15', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_70C3', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0092', '5CG9416JHR', 'HP EliteBook 830 G6', NULL, 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', 'SAMSUNG MZVLB512HAJQ-000H1', '0025_3889_91C7_5B1D', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0093', 'CND4330SNY', 'HP Envy x360 2-in-1 Laptop 14-fc0xxx', NULL, 'Intel(R) Core(TM) Ultra 7 155U', '1TB', 'SAMSUNG MZVL81T0HELB-00BH1', '0025_3847_41BA_2F5E', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0094', '8CG3384W1R', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_70D9.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0095', '8CG3384W32', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_7155.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0096', '8CG3384Y19', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_7264', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0097', 'CND4490JS6', 'HP Pavilion Laptop 16-af0xxx', NULL, 'Intel(R) Core(TM) Ultra 5 125U', '1TB', 'SAMSUNG MZVL81T0HELB-00BH1', '0025_384A_41B1_56B3.', '15GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0098', '5CG9416JHP', 'HP EliteBook 830 G6', NULL, 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', 'SAMSUNG MZVLB512HAJQ-000H1', '0025_3889_91C7_5AC2', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0099', '8CG3384W34', 'HP Pavilion Plus Laptop 14-ew0xxx', NULL, '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', 'SAMSUNG MZVL2512HDJD-00BH1', '0025_38B4_3103_7157', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0100', 'CND436291X', 'HP Envy x360 2-in-1 Laptop 14-fc0xxx', NULL, 'Intel(R) Core(TM) Ultra 5 125U', '500GB', 'SAMSUNG MZVL8512HELU-00BH1', '0025_3845_41B2_03DA.', '15GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0101', 'CND450192F', 'Victus by HP Gaming Laptop 16-r1xxx', NULL, 'Intel(R) Core(TM) i7-14650HX', '1TB', 'SAMSUNG MZVL21T0HCLR-00BH1', '0025_38B2_41B6_81FD.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0102', 'CND45018YL', 'Victus by HP Gaming Laptop 16-r1xxx', NULL, 'Intel(R) Core(TM) i7-14650HX', '1TB', 'SAMSUNG MZVL21T0HCLR-00BH1', '0025_38B2_41B6_7E94.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0103', 'CND45018XL', 'Victus by HP Gaming Laptop 16-r1xxx', NULL, 'Intel(R) Core(TM) i7-14650HX', '1TB', 'SAMSUNG MZVL21T0HCLR-00BH1', '0025_38B2_41B6_7ECC.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0104', 'CND45018ZH', 'Victus by HP Gaming Laptop 16-r1xxx', NULL, 'Intel(R) Core(TM) i7-14650HX', '1TB', 'SAMSUNG MZVL21T0HCLR-00BH1', '0025_38B2_41B6_7EB1.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0105', '5CD5180FQV', 'HP EliteBook 640 14 inch G10 Notebook PC', NULL, '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', 'PC SN5000S SDEPNSJ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_4545_9688', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0106', '5CD24316XX', 'HP Pavilion Laptop 14-dv2xxx', NULL, '12th Gen Intel(R) Core(TM) i7-1255U', '500GB', 'WDC PC SN530 SDBPNPZ-512G-1006', 'E823_8FA6_BF53_0001_001B_448B_4BFE_DC0B.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0107', 'CND450195Y', 'Victus by HP Gaming Laptop 16-r1xxx', NULL, 'Intel(R) Core(TM) i7-14650HX', '1TB', 'SAMSUNG MZVL21T0HCLR-00BH1', '0025_38B2_41B6_7FDE.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0108', '5CD5180FQR', 'HP EliteBook 640 14 inch G10 Notebook PC', NULL, '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', 'PC SN5000S SDEPNSJ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_4545_9655.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0109', 'Latitude 3420', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe PC SN730 NVMe WDC 512GB', 'E823_8FA6_BF53_0001_001B_448B_41C9_5B41', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0110', 'DK3BJG3', 'Dell Inc.', NULL, '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', 'NVMe PC SN730 NVMe WDC 512GB', 'E823_8FA6_BF53_0001_001B_448B_41C9_5B41', '16GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0111', '5CD51779T9', 'HP EliteBook 640 14 inch G10 Notebook PC', NULL, '13th Gen Intel(R) Core(TM) i7-1365U', '1TB', 'WD PC SN810 SDCPNRY-1T00-1006', 'E823_8FA6_BF53_0001_001B_448B_4DE0_6EAF.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0112', '5CD5180FQX', 'HP EliteBook 640 14 inch G10 Notebook PC', NULL, '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', 'PC SN5000S SDEPNSJ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_4545_9613', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0113', '5CD5180FQZ', 'HP EliteBook 640 14 inch G10 Notebook PC', NULL, '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', 'PC SN5000S SDEPNSJ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_4545_6F86', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0114', '5CD5180FQW', 'HP EliteBook 640 14 inch G10 Notebook PC', NULL, '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', 'PC SN5000S SDEPNSJ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_4545_961A', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0115', '5CD5180FQS', 'HP EliteBook 640 14 inch G10 Notebook PC', NULL, '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', 'PC SN5000S SDEPNSJ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_4545_9687', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0116', '5CD5180FQY', 'HP EliteBook 640 14 inch G10 Notebook PC', NULL, '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', 'PC SN5000S SDEPNSJ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_4545_6D0E.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0117', 'CND4330S21', 'HP Envy x360 2-in-1 Laptop 14-fc0xxx', NULL, 'Intel(R) Core(TM) Ultra 7 155U', '1TB', 'SAMSUNG MZVL81T0HELB-00BH1', '0025_3847_41BB_6923', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0118', '5CD5180FQT', 'HP EliteBook 640 14 inch G10 Notebook PC', NULL, '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', 'PC SN5000S SDEPNSJ-512G-1006', 'E823_8FA6_BF53_0001_001B_444A_4545_9667', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0119', 'CND436291V', 'HP Envy x360 2-in-1 Laptop 14-fc0xxx', NULL, 'Intel(R) Core(TM) Ultra 5 125U', '500GB', 'SAMSUNG MZVL8512HELU-00BH1', '0025_3845_41B2_03E5', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0120', '5CG9415XLP', 'HP EliteBook 830 G6', NULL, 'Intel(R) Core(TM) i5-8265U CPU @ 1.60GHz', '500GB', 'SAMSUNG MZVLB512HAJQ-000H1', '0025_3889_91C7_5C11.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0121', '8CG4254C72', 'HP Pavilion x360 2-in-1 Laptop 14-ek2xxx', NULL, 'Intel(R) Core(TM) 5 120U', '600GB', 'SK hynix BC901 HFS512GEJ9X108N', '0000_0000_0000_0000_ACE4_2E00_4A5E_2779.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0122', '8CG331076K', 'HP Pavilion x360 2-in-1 Laptop 14-ek1xxx', NULL, '13th Gen Intel(R) Core(TM) i7-1355U', '500GB', 'WD PC SN740 SDDPNQD-512G-1006', 'E823_8FA6_BF53_0001_001B_448B_4AB5_6070', '8GB', NULL, 'LCD', '2026-09-07 03:31:35'),
('AST-NB0123', '5CG9416JHH', 'HP EliteBook 830 G6', NULL, 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', 'SAMSUNG MZVLB512HAJQ-000H1', '0025_3889_91C7_5768.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0124', '5CG9416JHG', 'HP EliteBook 830 G6', NULL, 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', 'KXG60ZNV512G KIOXIA', '0000_0000_0000_0001_8CE3_8E10_0048_5ED7.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0125', '5CG9416JHD', 'HP EliteBook 830 G6', NULL, 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', 'SAMSUNG MZVLB512HAJQ-000H1', '0025_3889_91C7_571F.', '16GB', NULL, NULL, '2026-09-07 03:31:35'),
('AST-NB0126', '5CG9416JHC', 'HP EliteBook 830 G6', NULL, 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', 'KXG60ZNV512G KIOXIA', '0000_0000_0000_0001_8CE3_8E03_005C_5A12.', '16GB', NULL, NULL, '2026-09-07 03:31:35');

-- --------------------------------------------------------

--
-- Struktur dari tabel `asset_history`
--

CREATE TABLE `asset_history` (
  `id` int(11) NOT NULL,
  `kode_asset` varchar(50) NOT NULL,
  `tanggal` date NOT NULL,
  `jenis_aktivitas` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `dilakukan_oleh` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `asset_holder_history`
--

CREATE TABLE `asset_holder_history` (
  `id` int(11) NOT NULL,
  `kode_asset` varchar(50) NOT NULL,
  `nik_lama` varchar(50) DEFAULT NULL,
  `nama_lama` varchar(150) DEFAULT NULL,
  `nik_baru` varchar(50) DEFAULT NULL,
  `nama_baru` varchar(150) DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `tanggal_pindah` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `asset_holder_history`
--

INSERT INTO `asset_holder_history` (`id`, `kode_asset`, `nik_lama`, `nama_lama`, `nik_baru`, `nama_baru`, `keterangan`, `tanggal_pindah`) VALUES
(1, 'AST-03784332', 'K0016', 'Putra', 'K0024', 'Nanda', 'resign', '2026-08-28 14:03:35');

-- --------------------------------------------------------

--
-- Struktur dari tabel `asset_software`
--

CREATE TABLE `asset_software` (
  `id` int(11) NOT NULL,
  `kode_asset` varchar(50) NOT NULL,
  `nama_software` varchar(150) NOT NULL,
  `versi` varchar(50) DEFAULT NULL,
  `lisensi` varchar(100) DEFAULT NULL,
  `tanggal_install` date DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `asset_software`
--

INSERT INTO `asset_software` (`id`, `kode_asset`, `nama_software`, `versi`, `lisensi`, `tanggal_install`, `keterangan`, `created_at`, `updated_at`) VALUES
(127, 'AST-NB0001', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(128, 'AST-NB0002', 'Microsoft Windows 10 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(129, 'AST-NB0003', 'Microsoft Windows 10 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(130, 'AST-NB0004', 'Microsoft Windows 10 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(131, 'AST-NB0005', 'Microsoft Windows 10 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(132, 'AST-NB0006', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(133, 'AST-NB0007', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(134, 'AST-NB0008', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(135, 'AST-NB0009', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(136, 'AST-NB0010', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(137, 'AST-NB0011', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(138, 'AST-NB0012', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(139, 'AST-NB0013', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(140, 'AST-NB0014', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(141, 'AST-NB0015', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(142, 'AST-NB0016', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(143, 'AST-NB0017', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(144, 'AST-NB0018', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(145, 'AST-NB0019', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(146, 'AST-NB0020', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(147, 'AST-NB0021', 'Microsoft Windows 10 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(148, 'AST-NB0022', 'Microsoft Windows 10 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(149, 'AST-NB0023', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(150, 'AST-NB0024', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(151, 'AST-NB0025', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(152, 'AST-NB0026', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(153, 'AST-NB0027', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(154, 'AST-NB0028', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(155, 'AST-NB0029', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(156, 'AST-NB0030', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(157, 'AST-NB0031', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(158, 'AST-NB0032', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(159, 'AST-NB0033', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(160, 'AST-NB0034', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(161, 'AST-NB0035', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(162, 'AST-NB0036', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(163, 'AST-NB0037', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(164, 'AST-NB0038', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(165, 'AST-NB0039', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(166, 'AST-NB0040', 'Microsoft Windows 8.1 Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(167, 'AST-NB0041', 'Microsoft Windows 8.1 Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(168, 'AST-NB0042', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(169, 'AST-NB0043', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(170, 'AST-NB0044', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(171, 'AST-NB0045', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(172, 'AST-NB0046', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(173, 'AST-NB0047', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(174, 'AST-NB0048', 'Microsoft Windows 10 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(175, 'AST-NB0049', 'Microsoft Windows 10 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(176, 'AST-NB0050', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(177, 'AST-NB0051', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(178, 'AST-NB0052', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(179, 'AST-NB0053', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(180, 'AST-NB0054', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(181, 'AST-NB0055', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(182, 'AST-NB0056', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(183, 'AST-NB0057', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(184, 'AST-NB0058', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(185, 'AST-NB0059', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(186, 'AST-NB0060', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(187, 'AST-NB0061', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(188, 'AST-NB0062', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(189, 'AST-NB0063', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(190, 'AST-NB0064', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(191, 'AST-NB0065', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(192, 'AST-NB0066', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(193, 'AST-NB0067', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(194, 'AST-NB0068', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(195, 'AST-NB0069', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(196, 'AST-NB0070', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(197, 'AST-NB0071', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(198, 'AST-NB0072', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(199, 'AST-NB0073', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(200, 'AST-NB0074', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(201, 'AST-NB0075', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(202, 'AST-NB0076', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(203, 'AST-NB0077', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(204, 'AST-NB0078', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(205, 'AST-NB0079', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(206, 'AST-NB0080', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(207, 'AST-NB0081', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(208, 'AST-NB0082', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(209, 'AST-NB0083', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(210, 'AST-NB0084', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(211, 'AST-NB0085', 'Microsoft Windows 10 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(212, 'AST-NB0086', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(213, 'AST-NB0087', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(214, 'AST-NB0088', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(215, 'AST-NB0089', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(216, 'AST-NB0090', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(217, 'AST-NB0091', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(218, 'AST-NB0092', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(219, 'AST-NB0093', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(220, 'AST-NB0094', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(221, 'AST-NB0095', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(222, 'AST-NB0096', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(223, 'AST-NB0097', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(224, 'AST-NB0098', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(225, 'AST-NB0099', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(226, 'AST-NB0100', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(227, 'AST-NB0101', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(228, 'AST-NB0102', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(229, 'AST-NB0103', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(230, 'AST-NB0104', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(231, 'AST-NB0105', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(232, 'AST-NB0106', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(233, 'AST-NB0107', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(234, 'AST-NB0108', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(235, 'AST-NB0109', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(236, 'AST-NB0110', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(237, 'AST-NB0111', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(238, 'AST-NB0112', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(239, 'AST-NB0113', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(240, 'AST-NB0114', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(241, 'AST-NB0115', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(242, 'AST-NB0116', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(243, 'AST-NB0117', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(244, 'AST-NB0118', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(245, 'AST-NB0119', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(246, 'AST-NB0120', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(247, 'AST-NB0121', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(248, 'AST-NB0122', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(249, 'AST-NB0123', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(250, 'AST-NB0124', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(251, 'AST-NB0125', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05'),
(252, 'AST-NB0126', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, NULL, '2026-08-28 15:13:05', '2026-08-28 15:13:05');

-- --------------------------------------------------------

--
-- Struktur dari tabel `asset_software_detail`
--

CREATE TABLE `asset_software_detail` (
  `kode_asset` varchar(50) NOT NULL,
  `operating_system` varchar(100) DEFAULT NULL,
  `serial_no_os` varchar(100) DEFAULT NULL,
  `ms_office` varchar(100) DEFAULT NULL,
  `ms_office_sn` varchar(100) DEFAULT NULL,
  `erp` enum('ADA','TIDAK') DEFAULT 'TIDAK',
  `wms` enum('ADA','TIDAK') DEFAULT 'TIDAK',
  `eris` enum('ADA','TIDAK') DEFAULT 'TIDAK',
  `cmms` enum('ADA','TIDAK') DEFAULT 'TIDAK',
  `visio` enum('ADA','TIDAK') DEFAULT 'TIDAK',
  `autocad` enum('ADA','TIDAK') DEFAULT 'TIDAK',
  `kaspersky` enum('ADA','TIDAK') DEFAULT 'TIDAK',
  `ms_project` enum('ADA','TIDAK') DEFAULT 'TIDAK',
  `acrobat` enum('ADA','TIDAK') DEFAULT 'TIDAK',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `asset_software_detail`
--

INSERT INTO `asset_software_detail` (`kode_asset`, `operating_system`, `serial_no_os`, `ms_office`, `ms_office_sn`, `erp`, `wms`, `eris`, `cmms`, `visio`, `autocad`, `kaspersky`, `ms_project`, `acrobat`, `updated_at`) VALUES
('AST-NB0001', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0002', 'Microsoft Windows 10 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0003', 'Microsoft Windows 10 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0004', 'Microsoft Windows 10 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0005', 'Microsoft Windows 10 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0006', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0007', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0008', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0009', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0010', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0011', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0012', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0013', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0014', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0015', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0016', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0017', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0018', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0019', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0020', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0021', 'Microsoft Windows 10 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0022', 'Microsoft Windows 10 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0023', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0024', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0025', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0026', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0027', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0028', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0029', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0030', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0031', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0032', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0033', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0034', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0035', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0036', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0037', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0038', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0039', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0040', 'Microsoft Windows 8.1 Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0041', 'Microsoft Windows 8.1 Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0042', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0043', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0044', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0045', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0046', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0047', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0048', 'Microsoft Windows 10 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0049', 'Microsoft Windows 10 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0050', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0051', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0052', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0053', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0054', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0055', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0056', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0057', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0058', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0059', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0060', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0061', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0062', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0063', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0064', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0065', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0066', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0067', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0068', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0069', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0070', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0071', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0072', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0073', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0074', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0075', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0076', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0077', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0078', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0079', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0080', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0081', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0082', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0083', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0084', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0085', 'Microsoft Windows 10 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0086', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0087', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0088', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0089', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0090', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0091', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0092', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0093', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0094', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0095', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0096', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0097', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0098', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0099', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0100', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0101', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0102', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0103', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0104', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0105', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0106', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0107', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0108', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0109', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0110', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0111', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0112', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0113', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0114', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0115', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0116', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0117', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0118', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0119', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0120', 'Microsoft Windows 11 Pro 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0121', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0122', 'Microsoft Windows 11 Home Single Language 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0123', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0124', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0125', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36'),
('AST-NB0126', 'Microsoft Windows 8 64-Bit', NULL, NULL, NULL, 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', 'TIDAK', '2026-09-07 03:31:36');

-- --------------------------------------------------------

--
-- Struktur dari tabel `assignment_ticket`
--

CREATE TABLE `assignment_ticket` (
  `id_assignment` int(11) NOT NULL,
  `id_ticket` varchar(20) NOT NULL,
  `id_teknisi` varchar(15) NOT NULL,
  `tanggal_assign` datetime NOT NULL DEFAULT current_timestamp(),
  `progress` tinyint(4) DEFAULT 0 COMMENT '0-100 %',
  `catatan_penyelesaian` varchar(255) DEFAULT NULL,
  `status_pengerjaan` enum('Menunggu Diproses','Proses','Selesai') NOT NULL DEFAULT 'Menunggu Diproses',
  `tanggal_selesai` datetime DEFAULT NULL,
  `is_paused` tinyint(1) DEFAULT 0,
  `paused_at` datetime DEFAULT NULL,
  `return_reason` text DEFAULT NULL,
  `return_status` enum('None','Pending','Approved','Rejected') DEFAULT 'None',
  `user_konfirmasi` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 = belum dikonfirmasi user, 1 = user sudah approve hasil perbaikan',
  `tanggal_konfirmasi_user` datetime DEFAULT NULL COMMENT 'Waktu user menekan tombol approve',
  `admin_approve` tinyint(1) DEFAULT 0,
  `admin_approve_by` varchar(100) DEFAULT NULL,
  `admin_approve_at` datetime DEFAULT NULL,
  `admin_konfirmasi` tinyint(1) DEFAULT 0,
  `tanggal_konfirmasi_admin` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `assignment_ticket`
--

INSERT INTO `assignment_ticket` (`id_assignment`, `id_ticket`, `id_teknisi`, `tanggal_assign`, `progress`, `catatan_penyelesaian`, `status_pengerjaan`, `tanggal_selesai`, `is_paused`, `paused_at`, `return_reason`, `return_status`, `user_konfirmasi`, `tanggal_konfirmasi_user`, `admin_approve`, `admin_approve_by`, `admin_approve_at`, `admin_konfirmasi`, `tanggal_konfirmasi_admin`) VALUES
(147, 'T1789438198505', 'TKN-0012', '2026-09-15 09:10:46', 100, 'selesai semuanya', 'Selesai', '2026-09-15 09:13:29', 0, NULL, NULL, 'None', 0, NULL, 0, NULL, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `bagian_departemen`
--

CREATE TABLE `bagian_departemen` (
  `id_bagian` int(11) NOT NULL,
  `id_departemen` int(11) NOT NULL,
  `nama_bagian` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `bagian_departemen`
--

INSERT INTO `bagian_departemen` (`id_bagian`, `id_departemen`, `nama_bagian`) VALUES
(1, 1, 'Infrastruktur'),
(2, 1, 'Network & Support'),
(3, 3, 'Welding & Forming'),
(4, 3, 'Galvanizing'),
(5, 3, 'Cutting & Threading'),
(6, 5, 'Incoming Inspection'),
(7, 5, 'Final Inspection'),
(8, 4, 'Production Planning'),
(9, 6, 'Mechanical'),
(10, 6, 'Electrical'),
(11, 9, 'Raw Material Store'),
(12, 9, 'Finished Goods Store'),
(13, 8, 'Accounting'),
(14, 2, 'Recruitment & GA'),
(16, 14, 'Umum');

-- --------------------------------------------------------

--
-- Struktur dari tabel `checklist_approval`
--

CREATE TABLE `checklist_approval` (
  `id_ticket` varchar(50) NOT NULL,
  `dibuat_oleh_nik` varchar(20) DEFAULT NULL,
  `tanggal_dibuat` datetime DEFAULT NULL,
  `diketahui_oleh_nik` varchar(20) DEFAULT NULL,
  `tanggal_diketahui` datetime DEFAULT NULL,
  `status_diketahui` enum('Menunggu','Approve','Reject') NOT NULL DEFAULT 'Menunggu',
  `catatan_diketahui` text DEFAULT NULL,
  `disetujui_oleh_nik` varchar(20) DEFAULT NULL,
  `tanggal_disetujui` datetime DEFAULT NULL,
  `status_disetujui` enum('Menunggu','Approve','Reject') NOT NULL DEFAULT 'Menunggu',
  `catatan_disetujui` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `checklist_approval`
--

INSERT INTO `checklist_approval` (`id_ticket`, `dibuat_oleh_nik`, `tanggal_dibuat`, `diketahui_oleh_nik`, `tanggal_diketahui`, `status_diketahui`, `catatan_diketahui`, `disetujui_oleh_nik`, `tanggal_disetujui`, `status_disetujui`, `catatan_disetujui`) VALUES
('T1789438198505', 'K0051', '2026-09-15 09:13:29', NULL, NULL, 'Menunggu', NULL, 'K0003', '2026-09-15 09:13:29', 'Approve', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `checklist_template`
--

CREATE TABLE `checklist_template` (
  `id_item` int(11) NOT NULL,
  `kategori_unit` varchar(50) NOT NULL,
  `uraian_pekerjaan` varchar(150) NOT NULL,
  `alat_yang_digunakan` varchar(100) DEFAULT NULL,
  `penerimaan_default` varchar(100) DEFAULT NULL,
  `urutan` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `checklist_template`
--

INSERT INTO `checklist_template` (`id_item`, `kategori_unit`, `uraian_pekerjaan`, `alat_yang_digunakan`, `penerimaan_default`, `urutan`) VALUES
(1, 'CPU', 'CHECK POWER SUPPLY', 'VISUAL,KUAS', 'BERFUNGSI', 1),
(2, 'CPU', 'CHECK MOTHERBOARD', 'VISUAL,KUAS', 'BERFUNGSI', 2),
(3, 'CPU', 'CHECK PROCESSOR', 'VISUAL,KUAS', 'BERFUNGSI', 3),
(4, 'CPU', 'CHECK HARDDISK', 'VISUAL,KUAS', 'BERFUNGSI', 4),
(5, 'CPU', 'CHECK MEMORY', 'VISUAL,KUAS', 'BERFUNGSI', 5),
(6, 'CPU', 'CHECK LAN CARD', 'VISUAL,KUAS', 'BERFUNGSI', 6),
(7, 'CPU', 'CHECK KEYBOARD & MOUSE', 'VISUAL,KUAS', 'BERFUNGSI', 7),
(8, 'Monitor', 'CHECK POWER SUPPLY', 'VISUAL,KUAS', 'BERFUNGSI', 1),
(9, 'Monitor', 'CHECK CRT TUBE/LCD', 'VISUAL,MAJUN', 'BERFUNGSI', 2),
(10, 'Monitor', 'CHECK DATA CABLE', 'VISUAL', 'BERFUNGSI', 3),
(11, 'Software', 'CHECK OS', 'VISUAL,KAV', 'BAIK', 1),
(12, 'Software', 'CHECK APP PROGRAM', 'VISUAL', 'BAIK', 2),
(13, 'Software', 'CHECK UTILITY PROG', 'VISUAL', 'BAIK', 3),
(14, 'Software', 'CHECK ANTIVIRUS', 'VISUAL,UPDATE', 'BAIK', 4),
(15, 'Printer/Scanner', 'CHECK PARALEL/USB', '', 'BERFUNGSI', 1),
(16, 'Printer/Scanner', 'CHECK TRACTOR UNIT', '', 'BERFUNGSI', 2),
(17, 'Printer/Scanner', 'CHECK PRINT HEAD/CATRIDGE', '', 'BERFUNGSI', 3),
(18, 'Printer/Scanner', 'CHECK INK/TONER/CARD', '', 'BERFUNGSI', 4),
(19, 'Printer/Scanner', 'CHECK OPTICAL RESOLUTION', '', 'BERFUNGSI', 5),
(20, 'Printer/Scanner', 'CHECK CONNECTIFITY', '', 'BERFUNGSI', 6),
(21, 'Printer/Scanner', 'CHECK POWER SUPPLY', '', 'BERFUNGSI', 7),
(22, 'Network Equipment', 'CHECK HUB / SWITCH', 'VISUAL', 'BERFUNGSI', 1),
(23, 'Network Equipment', 'CHECK UTP CABLE', 'VISUAL', 'BERFUNGSI', 2),
(24, 'Network Equipment', 'CHECK WIFI', 'VISUAL', 'BERFUNGSI', 3),
(25, 'Network Equipment', 'CHECK CONNECTOR RJ45', 'VISUAL', 'BERFUNGSI', 4),
(26, 'Network Equipment', 'CHECK NETWORK CONNECTION', 'VISUAL', 'BERFUNGSI', 5);

-- --------------------------------------------------------

--
-- Struktur dari tabel `departemen`
--

CREATE TABLE `departemen` (
  `id_departemen` int(11) NOT NULL,
  `nama_departemen` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `departemen`
--

INSERT INTO `departemen` (`id_departemen`, `nama_departemen`) VALUES
(27, '(Belum Diketahui)'),
(22, 'BMI'),
(15, 'Coating'),
(23, 'Commercial'),
(16, 'Engineering'),
(8, 'Finance & Accounting'),
(2, 'HRD'),
(1, 'IT'),
(14, 'IT support'),
(17, 'LAB'),
(24, 'Legal'),
(6, 'Maintenance'),
(7, 'Marketing'),
(18, 'MR'),
(19, 'OS'),
(4, 'PPIC'),
(20, 'Procurement'),
(3, 'Produksi'),
(10, 'Purchasing'),
(5, 'Quality Control'),
(21, 'Safety / HSE'),
(25, 'SEAPI'),
(9, 'Warehouse / Gudang'),
(26, 'WTM');

-- --------------------------------------------------------

--
-- Struktur dari tabel `inventory`
--

CREATE TABLE `inventory` (
  `kode_asset` varchar(15) NOT NULL,
  `nama_barang` varchar(100) NOT NULL,
  `merk_model` varchar(100) DEFAULT NULL,
  `computer_name` varchar(100) DEFAULT NULL,
  `it_priority` varchar(50) DEFAULT NULL,
  `tahun_perolehan` year(4) DEFAULT NULL,
  `user_pemakai` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `extension` varchar(20) DEFAULT NULL,
  `divisi` varchar(100) DEFAULT NULL,
  `gedung` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `id_departemen` int(11) NOT NULL,
  `id_kategori` int(11) NOT NULL,
  `nik_pemegang` varchar(10) DEFAULT NULL,
  `status_aset` enum('Aktif','Tidak Aktif') NOT NULL DEFAULT 'Aktif',
  `foto` varchar(255) DEFAULT NULL,
  `ram` varchar(50) DEFAULT NULL,
  `prosesor` varchar(100) DEFAULT NULL,
  `penyimpanan` varchar(50) DEFAULT NULL,
  `last_maintenance` date DEFAULT NULL,
  `next_maintenance` date DEFAULT NULL,
  `id_preventive_schedule` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `inventory`
--

INSERT INTO `inventory` (`kode_asset`, `nama_barang`, `merk_model`, `computer_name`, `it_priority`, `tahun_perolehan`, `user_pemakai`, `email`, `extension`, `divisi`, `gedung`, `ip_address`, `id_departemen`, `id_kategori`, `nik_pemegang`, `status_aset`, `foto`, `ram`, `prosesor`, `penyimpanan`, `last_maintenance`, `next_maintenance`, `id_preventive_schedule`) VALUES
('AST-03784332', 'Laptop', 'Asus Vivobook', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 'K0024', 'Aktif', NULL, NULL, NULL, NULL, '2026-08-28', '2026-08-27', NULL),
('AST-03807183', 'Laptop', 'Lenovo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 'K0018', 'Aktif', NULL, NULL, NULL, NULL, '2026-09-11', '2026-09-15', NULL),
('AST-03830114', 'Laptop', 'Thinkped', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 'K0018', 'Aktif', NULL, NULL, NULL, NULL, '2026-09-11', '2026-09-15', NULL),
('AST-04023605', 'Laptop Vivobook', 'Asus', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 1, 'K0017', 'Aktif', NULL, NULL, NULL, NULL, '2026-08-18', '2026-08-20', NULL),
('AST-15439874', 'PC', 'AXIO PC All in One MYPC U23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, 1, 'K0021', 'Aktif', NULL, NULL, NULL, NULL, '2026-09-03', '2026-09-16', NULL),
('AST-15469553', 'PC', ' Microsoft Surface Studio 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, 1, 'K0072', 'Aktif', NULL, NULL, NULL, NULL, '2026-09-03', '2026-09-16', NULL),
('AST-15521907', 'Printer', 'Epson', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, 2, 'K0019', 'Aktif', NULL, NULL, NULL, NULL, '2026-08-18', '2026-08-15', NULL),
('AST-18541983', 'Laptop', 'Lenovo 2019', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5, 1, 'K0022', 'Aktif', NULL, NULL, NULL, NULL, '2026-08-20', '2026-08-20', NULL),
('AST-23286245', 'Laptop', 'Lenovo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 'K0018', 'Aktif', NULL, NULL, NULL, NULL, '2026-09-11', '2026-09-08', NULL),
('AST-72497168', 'Laptop Asus ROG', 'Asus', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 9, 1, 'K0025', 'Aktif', NULL, NULL, NULL, NULL, '2026-08-21', '2026-09-21', NULL),
('AST-78812856', 'Laptop', 'Asus Vivobook', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 9, 1, 'K0023', 'Aktif', NULL, NULL, NULL, NULL, '2026-08-21', '2026-09-21', NULL),
('AST-90216948', 'Laptop', 'Acer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 14, 1, 'K0024', 'Aktif', NULL, NULL, NULL, NULL, '2026-08-18', '2026-08-15', NULL),
('AST-NB0001', 'Laptop', 'HP Pavilion Aero Laptop 13-be0xxx', 'LAPTOP-L6FSDV6Q', NULL, '2021', 'Heri Nuryanto', NULL, NULL, 'SEAPI', NULL, '172.16.1.7', 25, 1, 'K0082', 'Aktif', NULL, '8GB', 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', '2026-08-31', '2026-10-01', NULL),
('AST-NB0002', 'Laptop', 'HP Pavilion Gaming Laptop 15-ec2xxx', 'LAPTOP-4PJK1DQM', NULL, '2021', 'Dedi', NULL, NULL, NULL, NULL, '10.88.12.177', 27, 1, 'K0058', 'Aktif', NULL, '8GB', 'AMD Ryzen 5 5600H with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0003', 'Laptop', 'HP Pavilion Aero Laptop 13-be0xxx', 'LAPTOP-DUF9FJA2', NULL, '2022', 'Rizki Pirsiani', NULL, NULL, 'MR', NULL, '10.12.21.74', 18, 1, 'K0121', 'Aktif', NULL, '16GB', 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0004', 'Laptop', 'HP Pavilion Aero Laptop 13-be0xxx', 'LAPTOP-1M8HNBRR', NULL, '2022', 'BACKUP IT', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0045', 'Aktif', NULL, '8GB', 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0005', 'Laptop', 'HP Pavilion x360 Convertible 14-dy0xxx', 'DESKTOP-467KT4A', NULL, '2022', 'Wida Ratri', NULL, NULL, 'Purchasing', 'Office Depan Lt.1', '10.12.20.135', 10, 1, 'K0138', 'Aktif', NULL, '8GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, NULL, NULL),
('AST-NB0006', 'Laptop', 'HP Pavilion Aero Laptop 13-be0xxx', 'LAPTOP-ION7MP2L', NULL, '2022', 'EKS Nidya', NULL, NULL, 'MARKETING', NULL, '10.1.140.241', 7, 1, 'K0064', 'Aktif', NULL, '16GB', 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0007', 'Laptop', 'HP Pavilion Aero Laptop 13-be0xxx', 'BPI', NULL, '2022', 'Tofiqurahman', NULL, NULL, 'FINANCE', NULL, '10.12.20.206', 8, 1, 'K0134', 'Aktif', NULL, '16GB', 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0008', 'Laptop', 'HP Pavilion Aero Laptop 13-be0xxx', 'LAPTOP-54QI78B4', NULL, '2022', 'Yoyon', NULL, NULL, 'MAINTENANCE', NULL, '10.12.20.216', 6, 1, 'K0142', 'Aktif', NULL, '8GB', 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', '2026-09-03', '2026-09-16', NULL),
('AST-NB0009', 'Laptop', 'HP Pavilion Aero Laptop 13-be0xxx', 'ENGXX-Bagas', NULL, '2022', 'Bagas', NULL, NULL, 'PRODUKSI', NULL, '10.12.21.225', 3, 1, 'K0048', 'Aktif', NULL, '16GB', 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0010', 'Laptop', 'HP Pavilion Aero Laptop 13-be0xxx', 'LAPTOP-JD15DOQ4', NULL, '2022', 'HARI', NULL, NULL, NULL, NULL, '192.168.43.217', 27, 1, 'K0077', 'Aktif', NULL, '8GB', 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0011', 'Laptop', 'HP Pavilion Aero Laptop 13-be0xxx', 'LAPTOP-SPBCBS20', NULL, '2022', 'Wahyu', NULL, NULL, 'MR', 'Manufactur Lt.1', '10.101.20.20', 18, 1, 'K0137', 'Aktif', NULL, '16GB', 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0012', 'Laptop', 'HP Pavilion x360 Convertible 14-dy0xxx', 'DESKTOP-UEV30G6', NULL, '2022', 'Lise', NULL, NULL, 'LAB', 'Manufactur Lt.1', '10.12.15.229', 17, 1, 'K0095', 'Aktif', NULL, '8GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', '2026-09-11', '2026-09-25', 43),
('AST-NB0013', 'Laptop', 'HP ProBook x360 435 G8 Notebook PC', 'RUSMA-ATA', NULL, '2022', 'Rusma', NULL, NULL, 'Procurement', 'Manufactur Lt.1', '10.1.140.107', 20, 1, 'K0122', 'Aktif', NULL, '8GB', 'AMD Ryzen 5 5600U with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0014', 'Laptop', 'HP Spectre x360 2-in-1 Laptop 14-ef0xxx', 'DESKTOP-9P4088J', NULL, '2022', 'Widi Suharyanto', NULL, NULL, 'BMI', NULL, '10.12.13.56', 22, 1, 'K0139', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i7-1255U', '1TB', NULL, NULL, NULL),
('AST-NB0015', 'Laptop', 'HP Spectre x360 2-in-1 Laptop 14-ef0xxx', 'BSE', NULL, '2022', 'Bambang Sutjahjo Edi', NULL, NULL, 'SEAPI', NULL, '10.12.20.150', 25, 1, 'K0049', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i7-1255U', '1TB', '2026-08-31', '2026-10-01', NULL),
('AST-NB0016', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-8N5458D7', NULL, '2022', 'Mustakim', NULL, NULL, 'MAINTENANCE', NULL, '10.12.16.36', 6, 1, 'K0106', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U, 2495MHz', '500GB', '2026-09-03', '2026-09-16', NULL),
('AST-NB0017', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-DSKVQTND', NULL, '2022', 'Bangun Utomo', NULL, NULL, 'Warehouse', 'Warehouse', '10.12.21.140', 9, 1, 'K0050', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0018', 'Laptop', 'HP ENVY x360 2-in-1 Laptop 13-bf0xxx', 'DESKTOP-9RCTN95', NULL, '2022', 'Lukman Hakim', NULL, NULL, 'BMI', NULL, '192.168.10.141', 22, 1, 'K0098', 'Aktif', NULL, '8GB', '12th Gen Intel(R) Core(TM) i5-1230U, 1689MHz', '500GB', NULL, NULL, NULL),
('AST-NB0019', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'BPI', NULL, '2022', 'Kusuma', NULL, NULL, 'COMMERCIAL', NULL, '10.1.140.111', 23, 1, 'K0093', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0020', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'COATXX-Rino', NULL, '2022', 'Rino', NULL, NULL, 'Coating', 'Plant-Coating', '10.12.20.228', 15, 1, 'K0119', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0021', 'Laptop', 'HP Spectre x360 Convertible 13-ae0xx', 'DESKTOP-U697P3T', NULL, '2022', 'Yudi BMI', NULL, NULL, 'BMI', NULL, '10.12.20.108', 22, 1, 'K0143', 'Aktif', NULL, '4GB', 'Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz', '256GB', NULL, NULL, NULL),
('AST-NB0022', 'Laptop', 'HP ENVY x360 Convertible 13-ag0xxx', 'DESKTOP-0PBTUCC', NULL, '2023', 'Lukman BMI', NULL, NULL, 'BMI', NULL, '10.12.13.56', 22, 1, 'K0097', 'Aktif', NULL, '4GB', 'AMD Ryzen 5 2500U with Radeon Vega Mobile Gfx', '500GB', NULL, NULL, NULL),
('AST-NB0023', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'BPI', NULL, '2023', 'Rusmiyanto', NULL, NULL, 'COMMERCIAL', NULL, '10.12.20.170', 23, 1, 'K0123', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0024', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-TUKS3VT1', NULL, '2023', 'Arifo Gunawan', NULL, NULL, 'Engineering', 'Manufactur Lt.2', '10.12.21.77', 16, 1, 'K0043', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0025', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-Q4J7QIGG', NULL, '2023', 'Betalevi', NULL, NULL, 'COMMERCIAL', NULL, '10.1.140.148', 23, 1, 'K0052', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0026', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-414DCKUH', NULL, '2023', 'Rifai', NULL, NULL, 'COMMERCIAL', NULL, '10.1.140.67', 23, 1, 'K0118', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0027', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'NB-015', NULL, '2023', 'AFDAN', NULL, NULL, 'COMMERCIAL', NULL, '10.1.150.132', 23, 1, 'K0030', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i7-1255U', '500GB', NULL, NULL, NULL),
('AST-NB0028', 'Laptop', 'Dell Inc.', 'DESKTOP-PAU12HV', NULL, '2023', 'Gennady', NULL, NULL, 'MT', 'Manufactur Lt.2', '10.101.20.97', 6, 1, 'K0075', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', '2026-09-08', '2026-09-15', NULL),
('AST-NB0029', 'Laptop', 'Dell Inc.', 'DESKTOP-P7V7F3C', NULL, '2023', 'Dwiki Setyo', NULL, NULL, 'MT', 'Manufactur Lt.1', '10.12.21.205', 6, 1, 'K0063', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', '2026-09-03', '2026-09-15', NULL),
('AST-NB0030', 'Laptop', 'Dell Inc.', 'DEKSTOP-1V1LT20', NULL, '2023', 'Afkar Umam', NULL, NULL, 'MT', 'Manufactur Lt.2', '10.12.20.106', 6, 1, 'K0039', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-09-15', NULL),
('AST-NB0031', 'Laptop', 'Dell Inc.', 'MTNXX-Bima', NULL, '2023', 'Bima Putra', NULL, NULL, 'MT', 'Manufactur Lt.2', '10.12.13.56', 6, 1, 'K0053', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-09-15', NULL),
('AST-NB0032', 'Laptop', 'Dell Inc.', 'DESKTOP-7O3483D', NULL, '2023', 'ii Nurul hapsari', NULL, NULL, 'MT', NULL, '10.1.140.216', 6, 1, 'K0146', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-09-15', NULL),
('AST-NB0033', 'Laptop', 'Dell Inc.', 'PRCXX-Hakki', NULL, '2023', 'Munawar Hakki', NULL, NULL, 'MT', 'Manufactur Lt.1', '10.12.13.56', 6, 1, 'K0105', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-09-15', NULL),
('AST-NB0034', 'Laptop', 'Dell Inc.', 'DESKTOP-J8L6EUM', NULL, '2023', 'Farah', NULL, NULL, 'MT', 'HRD', '10.12.20.241', 6, 1, 'K0073', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-09-15', NULL),
('AST-NB0035', 'Laptop', 'Dell Inc.', 'DESKTOP-1E8S8AA', NULL, '2023', 'Hendrick', NULL, NULL, 'MT', NULL, '10.12.20.136', 6, 1, 'K0080', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-09-15', NULL),
('AST-NB0036', 'Laptop', 'Dell Inc.', 'DESKTOP-JIDHAKS', NULL, '2023', 'Makaarim', NULL, NULL, 'MT', NULL, '10.1.140.65', 6, 1, 'K0102', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-09-15', NULL),
('AST-NB0037', 'Laptop', 'Dell Inc.', 'DESKTOP-2O4DN3D', NULL, '2023', 'KHURAZA', NULL, NULL, 'MT', NULL, '10.12.20.178', 6, 1, 'K0090', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-09-15', NULL),
('AST-NB0038', 'Laptop', 'Dell Inc.', 'DESKTOP-I34CTDD', NULL, '2023', 'Hilda', NULL, NULL, 'MT', NULL, '10.1.140.233', 6, 1, 'K0083', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-09-15', NULL),
('AST-NB0039', 'Laptop', 'Dell Inc.', 'DESKTOP-NM3VE5T', NULL, '2023', 'Astri', NULL, NULL, 'MT', NULL, '10.12.20.166', 6, 1, 'K0044', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-10-04', NULL),
('AST-NB0040', 'Laptop', '905S3G/906S3G/915S3G', 'HRDXX-Tuti', NULL, '2023', 'Tuti', NULL, NULL, 'HRD', 'Office Depan Lt.1', '10.12.20.205', 2, 1, 'K0135', 'Aktif', NULL, '4GB', 'Quad-Core Processor (up to 1.4GHz)', '128GB', NULL, NULL, NULL),
('AST-NB0041', 'Laptop', '905S3G/906S3G/915S3G/9305SG', 'BPI', NULL, '2023', 'Intan Nori', NULL, NULL, 'HRD', 'B.Tower Lt.7', '10.12.13.56', 2, 1, 'K0088', 'Aktif', NULL, '4GB', 'Quad-Core Processor (up to 1.4GHz)', '1TB', NULL, NULL, NULL),
('AST-NB0042', 'Laptop', 'HP Pavilion x360 Convertible 14-dy0xxx', 'DESKTOP-KETPTO0', NULL, '2023', 'Mansyur', NULL, NULL, NULL, NULL, '10.12.20.231', 27, 1, 'K0103', 'Aktif', NULL, '4GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, NULL, NULL),
('AST-NB0043', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-GDEBROQ6', NULL, '2023', 'Indra Tower', NULL, NULL, 'COMMERCIAL', NULL, '10.12.21.189', 23, 1, 'K0087', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0044', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-P9C94MA5', NULL, '2023', 'Diki Amarta', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0060', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0045', 'Laptop', 'HP Pavilion x360 2-in-1 Laptop 14-ek0xxx', 'DESKTOP-00U67C3', NULL, '2023', 'Diko', NULL, NULL, 'PPC', NULL, '10.12.13.56', 4, 1, 'K0061', 'Aktif', NULL, '8GB', '12th Gen Intel(R) Core(TM) i7-1255U', '500GB', NULL, NULL, NULL),
('AST-NB0046', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-6TT3NC93', NULL, '2023', 'Nurseha', NULL, NULL, 'FINANCE', NULL, '10.12.13.56', 8, 1, 'K0111', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0047', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-9LGJOJAR', NULL, '2023', 'Novyar', NULL, NULL, 'LAB', 'Manufactur Lt.1', '10.101.20.63', 17, 1, 'K0110', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', '2026-09-14', '2026-09-25', 43),
('AST-NB0048', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-MRT5AAP1', NULL, '2023', 'Fadiel', NULL, NULL, 'COMMERCIAL', NULL, '10.12.20.1', 23, 1, 'K0071', 'Aktif', NULL, '8GB', 'Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz', '500GB', NULL, NULL, NULL),
('AST-NB0049', 'Laptop', 'HP Pavilion x360 Convertible 14-ba1xx', NULL, NULL, '2023', 'BACKUP IT', NULL, NULL, NULL, NULL, '10.12.20.197', 18, 1, 'K0045', 'Aktif', NULL, '8GB', 'Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz', '500GB', NULL, NULL, NULL),
('AST-NB0050', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-FLTDQ7E2', NULL, '2023', 'Setyo Bayu', NULL, NULL, 'Procurement', 'Manufactur Lt.1', '10.75.211.184', 20, 1, 'K0130', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0051', 'Laptop', 'Victus by HP Gaming Laptop 15-fb0xxx', 'LAPTOP-LPI0DRHL', NULL, '2023', 'Priyo', NULL, NULL, NULL, NULL, '14:13:33:8C:BE:C6', 27, 1, 'K0113', 'Aktif', NULL, '16GB', 'AMD Ryzen 7 5800H with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0052', 'Laptop', 'Victus by HP Gaming Laptop 15-fb0xxx', 'LAPTOP-IR0N330J', NULL, '2023', 'Mujaini', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0104', 'Aktif', NULL, '16GB', 'AMD Ryzen 7 5800H with Radeon Graphics', '500GB', NULL, NULL, NULL),
('AST-NB0053', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-5TGKR5GV', NULL, '2023', 'Ricky abdul karim', NULL, NULL, 'PPC', 'Manufactur Lt.2', '10.12.21.86', 4, 1, 'K0116', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0054', 'Laptop', 'HP Pavilion x360 2-in-1 Laptop 14-ek0xxx', 'HRDXX-Srj', NULL, '2023', 'Suraji', NULL, NULL, 'HRD', 'Baki Lt.2', '10.12.20.229', 2, 1, 'K0133', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i7-1255U', '500GB', NULL, NULL, NULL),
('AST-NB0055', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-IUH4M1K5', NULL, '2023', 'Lulu', NULL, NULL, 'HRD', 'Baki Lt.2', '10.88.10.189', 2, 1, 'K0099', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0056', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-BRCPKLOD', NULL, '2023', 'Haryono', NULL, NULL, 'COATING', NULL, '10.12.20.168', 15, 1, 'K0079', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0057', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-QL0NC6FQ', NULL, '2023', 'Diah Hapipah', NULL, NULL, 'PPC', 'Manufactur Lt.2', '10.12.21.70', 4, 1, 'K0059', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0058', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-78ECTPAI', NULL, '2023', 'Eko R', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0066', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0059', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-QC54327D', NULL, '2023', 'Holila', NULL, NULL, 'Safety', 'Safety', '10.12.20.55', 21, 1, 'K0084', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0060', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-LNVDTQ02', NULL, '2023', 'Yane Rosdiana', NULL, NULL, 'Legal', NULL, '10.1.140.128', 24, 1, 'K0141', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', '2026-09-01', '2026-10-01', NULL),
('AST-NB0061', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-0JBRTAML', NULL, '2023', 'Irfan Suharto Putra', NULL, NULL, NULL, NULL, '10.1.140.116', 27, 1, 'K0089', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0062', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-NJNJ76I7', NULL, '2023', 'Saimun Riswanto', NULL, NULL, 'PPC', 'Manufactur Lt.2', '10.12.21.124', 4, 1, 'K0128', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0063', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-52S02EAG', NULL, '2023', 'Kurniawan Tadi', NULL, NULL, 'OS', 'Office Depan Lt.1', '10.12.13.56', 19, 1, 'K0092', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0064', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-98F2A2NG', NULL, '2023', 'Ahmad Budianto', NULL, NULL, 'Purchasing', 'Office Depan Lt.1', '10.12.20.246', 10, 1, 'K0040', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0065', 'Laptop', 'Latitude 3420', 'DESKTOP-2O4DN3D', NULL, '2023', 'Khuraza', NULL, NULL, NULL, NULL, '10.12.20.178', 27, 1, 'K0091', 'Aktif', NULL, '8GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, NULL, NULL),
('AST-NB0066', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-3H52KH8T', NULL, '2023', 'Clarisya', NULL, NULL, NULL, NULL, '10.1.140.103', 27, 1, 'K0054', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0067', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'LAPTOP-NCPJB0AK', NULL, '2024', 'Ridwan QC', NULL, NULL, NULL, NULL, '10.12.21.237', 27, 1, 'K0117', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i5-1235U', '500GB', NULL, NULL, NULL),
('AST-NB0068', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-VMP0KRIV', NULL, '2024', 'Ziyad Ibnu Kama', NULL, NULL, 'PPC', 'Manufactur Lt.2', '10.12.21.165', 4, 1, 'K0145', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0069', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-00VNSDNC', NULL, '2024', 'Adi Supriyanto', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0037', 'Aktif', NULL, '8GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0070', 'Laptop', 'Yoga Slim 7 Carbon 13IRP8', 'LAPTOP-ARQ7SP9F', NULL, '2024', 'Dina', NULL, NULL, 'COMMERCIAL', NULL, '10.1.140.75', 23, 1, 'K0062', 'Aktif', NULL, '2GB', '13th Gen Intel(R) Core(TM) i5-1340P', '500GB', NULL, NULL, NULL),
('AST-NB0071', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-APML6RIG', NULL, '2024', 'VIVIN', NULL, NULL, 'Purchasing', 'Office Depan Lt.1', '10.12.20.248', 10, 1, 'K0136', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0072', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-F0UAAN30', NULL, '2024', 'Bayu', NULL, NULL, 'LEGAL', NULL, '10.1.140.225', 24, 1, 'K0051', 'Aktif', NULL, '8GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', '2026-09-01', '2026-10-01', NULL),
('AST-NB0073', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-R3H72CER', NULL, '2024', 'Fajar Tri Handoyo', NULL, NULL, 'Finance', 'Office Depan Lt.1', '10.12.20.174', 8, 1, 'K0072', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', '2026-09-04', '2026-10-04', NULL),
('AST-NB0074', 'Laptop', 'HP Spectre x360 2-in-1 Laptop 14-ef2xxx', 'DESKTOP-C9PA00I', NULL, '2025', 'AAS', NULL, NULL, NULL, NULL, '10.83.10.29', 27, 1, 'K0026', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i7-1355U', '1TB', NULL, NULL, NULL),
('AST-NB0075', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'HRDXX-Alif', NULL, '2024', 'Alif  Maula', NULL, NULL, 'HRD', 'Office Depan Lt.1', '192.168.10.221', 2, 1, 'K0042', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0076', 'Laptop', 'HP Pavilion x360 2-in-1 Laptop 14-ek1xxx', 'DESKTOP-TGHQ0U2', NULL, '2024', 'Fardhuzi', NULL, NULL, NULL, NULL, '10.83.10.195', 27, 1, 'K0074', 'Aktif', NULL, '8GB', '13th Gen Intel(R) Core(TM) i7-1355U', '500GB', NULL, NULL, NULL),
('AST-NB0077', 'Laptop', 'HP Spectre x360 2-in-1 Laptop 14-eu0xxx', 'DESKTOP-6J6L117', NULL, '2024', 'Deddy Kurnia', NULL, NULL, NULL, NULL, '10.12.20.152', 27, 1, 'K0057', 'Aktif', NULL, '32GB', 'Intel® Core™ Ultra 7 155H', '1TB', NULL, NULL, NULL),
('AST-NB0078', 'Laptop', 'HP Pavilion Laptop 14-ew0xxx', 'LAPTOP-74V36254', NULL, '2024', 'Salman Remunerasi', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0129', 'Aktif', NULL, '16GB', '13th Gen Intel® Core™ i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0079', 'Laptop', 'HP Pavililion x360 2-in-1 Laptop-ek1xxx', 'DESKTOP-AQN0K0N', NULL, '2024', 'Lukman Arif', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0096', 'Aktif', NULL, '16GB', '13th Gen Intel® Core™ i7-1355U', '500GB', NULL, NULL, NULL),
('AST-NB0080', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'RUDI', NULL, '2024', 'Aji Wibisono', NULL, NULL, NULL, NULL, '10.12.20.79', 27, 1, 'K0041', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '953.9GB', NULL, NULL, NULL),
('AST-NB0081', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-C6AUFICI', NULL, '2024', 'Hendro', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0081', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0082', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-S53ULGOO', NULL, '2024', 'Wigi', NULL, NULL, NULL, NULL, '10.12.20.215', 27, 1, 'K0140', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) Ultra 7 155U', '500GB', NULL, NULL, NULL),
('AST-NB0083', 'Laptop', 'HP Envy x360 2-in-1 Laptop 14-fc0xxx', 'DESKTOP-KTE7NIM', NULL, '2024', 'AZT', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0036', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) Ultra 7 155U', '1TB', NULL, NULL, NULL),
('AST-NB0084', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-HOEJ9NFB', NULL, '2025', 'Pamela', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0112', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0085', 'Laptop', 'Microsoft Windows 10 Pro 64-Bit', 'DESKTOP-1B8J5Q0', NULL, '2025', 'Riza fahlefi eks AZT', NULL, NULL, NULL, NULL, '10.12.20.193', 27, 1, 'K0120', 'Aktif', NULL, '8GB', 'intel(R) Core(TM) i5-8265U CPU @ 1.60GHz', '500GB', NULL, NULL, NULL),
('AST-NB0086', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-GDEBROQ6', NULL, '2025', 'Indra', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0086', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0087', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-DK9TSHJ0', NULL, '2025', 'Sugiyo ppic', NULL, NULL, NULL, NULL, '10.12.13.42', 27, 1, 'K0131', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0088', 'Laptop', 'HP OmniBook Ultra Flip Laptop 14-fh0xxx', 'LAPTOP-F22MMCKV', NULL, '2025', 'ADP', NULL, NULL, NULL, NULL, '10.12.20.134', 27, 1, 'K0029', 'Aktif', NULL, '32GB', 'Intel(R) Core(TM) 5 120U', '1 TB', NULL, NULL, NULL),
('AST-NB0089', 'Laptop', 'HP Pavilion x360 2-in-1 Laptop 14-ek2xxx', 'DESKTOP-QL916SP', NULL, '2025', 'AWP', NULL, NULL, NULL, NULL, '10.12.20.96', 27, 1, 'K0035', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) Ultra 7 258V', '512GB', NULL, NULL, NULL),
('AST-NB0090', 'Laptop', 'HP Pavilion x360 Convertible 14-dy0xxx', 'DESKTOP-Q02PHSF', NULL, '2025', 'LARASATI', NULL, NULL, NULL, NULL, '10.1.140.161', 27, 1, 'K0094', 'Aktif', NULL, '8GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, NULL, NULL),
('AST-NB0091', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-96JJ5739', NULL, '2025', 'ENDANG', NULL, NULL, NULL, NULL, '10.12.20.65', 27, 1, 'K0065', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0092', 'Laptop', 'HP EliteBook 830 G6', 'DESKTOP-7LCA5SQ', NULL, '2025', 'BACKUP IT', NULL, NULL, NULL, NULL, '10.12.20.201', 27, 1, 'K0045', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', NULL, NULL, NULL),
('AST-NB0093', 'Laptop', 'HP Envy x360 2-in-1 Laptop 14-fc0xxx', 'DESKTOP-6SOL587', NULL, '2025', 'ABS', NULL, NULL, NULL, NULL, '10.12.20.175', 27, 1, 'K0028', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) Ultra 7 155U', '1TB', NULL, NULL, NULL),
('AST-NB0094', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-GDEBROQ6', NULL, '2025', 'INDRA', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0085', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0095', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-C338U2QT', NULL, '2025', 'Hadi Komara', NULL, NULL, NULL, NULL, '10.12.20.237', 27, 1, 'K0078', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0096', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-JHS8GE67', NULL, '2025', 'FUAD', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0070', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0097', 'Laptop', 'HP Pavilion Laptop 16-af0xxx', 'LAPTOP-JUJVGD54', NULL, '2025', 'NUGRAHENI', NULL, NULL, NULL, NULL, '10.12.20.103', 27, 1, 'K0108', 'Aktif', NULL, '15GB', 'Intel(R) Core(TM) Ultra 5 125U', '1TB', NULL, NULL, NULL),
('AST-NB0098', 'Laptop', 'HP EliteBook 830 G6', 'DESKTOP-EU53CD4', NULL, '2025', 'ANGGORO', NULL, NULL, NULL, NULL, '10.12.20.101', 27, 1, 'K0034', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', NULL, NULL, NULL),
('AST-NB0099', 'Laptop', 'HP Pavilion Plus Laptop 14-ew0xxx', 'LAPTOP-577OK0MU', NULL, '2025', 'AHMAD', NULL, NULL, NULL, NULL, '10.12.24.236', 27, 1, 'K0031', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1335U', '500GB', NULL, NULL, NULL),
('AST-NB0100', 'Laptop', 'HP Envy x360 2-in-1 Laptop 14-fc0xxx', 'DESKTOP-31RLL3V', NULL, '2025', 'NIDYA', NULL, NULL, NULL, NULL, '10.12.25.152', 27, 1, 'K0107', 'Aktif', NULL, '15GB', 'Intel(R) Core(TM) Ultra 5 125U', '500GB', NULL, NULL, NULL),
('AST-NB0101', 'Laptop', 'Victus by HP Gaming Laptop 16-r1xxx', 'ITXXX-HAFIIZH', NULL, '2025', 'HAFIZH', NULL, NULL, NULL, NULL, '10.12.13.59', 27, 1, 'K0076', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-14650HX', '1TB', NULL, NULL, NULL),
('AST-NB0102', 'Laptop', 'Victus by HP Gaming Laptop 16-r1xxx', 'ITXXX-AMRUL', NULL, '2025', 'AMMRUL', NULL, NULL, NULL, NULL, '172.16.1.10', 27, 1, 'K0032', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-14650HX', '1TB', NULL, NULL, NULL),
('AST-NB0103', 'Laptop', 'Victus by HP Gaming Laptop 16-r1xxx', 'ITXXX-ABBA', NULL, '2025', 'ABBA', NULL, NULL, NULL, NULL, '10.12.12.21', 27, 1, 'K0027', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-14650HX', '1TB', NULL, NULL, NULL),
('AST-NB0104', 'Laptop', 'Victus by HP Gaming Laptop 16-r1xxx', 'ITXXX-RIZKI', NULL, '2025', 'RIZKI', NULL, NULL, NULL, NULL, '192.168.25.226', 27, 1, 'K0115', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-14650HX', '1TB', NULL, NULL, NULL),
('AST-NB0105', 'Laptop', 'HP EliteBook 640 14 inch G10 Notebook PC', 'NB-001', NULL, '2025', 'FADILAH', NULL, NULL, NULL, NULL, '10.12.13.44', 27, 1, 'K0067', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', NULL, NULL, NULL),
('AST-NB0106', 'Laptop', 'HP Pavilion Laptop 14-dv2xxx', 'ITXX-BACKUP', NULL, '2025', 'REZHA IT', NULL, NULL, NULL, NULL, '10.12.27.194', 27, 1, 'K0114', 'Aktif', NULL, '16GB', '12th Gen Intel(R) Core(TM) i7-1255U', '500GB', NULL, NULL, NULL),
('AST-NB0107', 'Laptop', 'Victus by HP Gaming Laptop 16-r1xxx', 'ITXXX-FANDY', NULL, '2025', 'FANDY', NULL, NULL, NULL, NULL, '10.12.12.14', 27, 1, 'K0069', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-14650HX', '1TB', NULL, NULL, NULL),
('AST-NB0108', 'Laptop', 'HP EliteBook 640 14 inch G10 Notebook PC', 'NB-002', NULL, '2025', 'FAJRI', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0068', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', NULL, NULL, NULL),
('AST-NB0109', 'Laptop', 'Dell Inc.', 'NB-003', NULL, '2025', 'AFDAN', NULL, NULL, NULL, NULL, '10.12.25.183', 27, 1, 'K0030', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, NULL, NULL),
('AST-NB0110', 'Laptop', 'Dell Inc.', 'NB-003', NULL, '2025', 'Afdan', NULL, NULL, 'MT', 'Manufactur Lt.2', '10.12.21.194', 6, 1, 'K0038', 'Aktif', NULL, '16GB', '11th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz', '500GB', NULL, '2026-10-04', NULL),
('AST-NB0111', 'Laptop', 'HP EliteBook 640 14 inch G10 Notebook PC', 'NB-004', NULL, '2025', 'NUGROHO', NULL, NULL, NULL, NULL, '10.12.26.43', 27, 1, 'K0109', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i7-1365U', '1TB', NULL, NULL, NULL),
('AST-NB0112', 'Laptop', 'HP EliteBook 640 14 inch G10 Notebook PC', 'NB-005', NULL, '2025', 'M.K.AZZAM', NULL, NULL, NULL, NULL, '10.12.13.44', 27, 1, 'K0100', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', NULL, NULL, NULL),
('AST-NB0113', 'Laptop', 'HP EliteBook 640 14 inch G10 Notebook PC', 'NB-006', NULL, '2025', 'ANDRESITO', NULL, NULL, NULL, NULL, '10.12.25.128', 27, 1, 'K0033', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', NULL, NULL, NULL),
('AST-NB0114', 'Laptop', 'HP EliteBook 640 14 inch G10 Notebook PC', 'NB-007', NULL, '2025', 'DAFFA', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0055', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', NULL, NULL, NULL),
('AST-NB0115', 'Laptop', 'HP EliteBook 640 14 inch G10 Notebook PC', 'NB-008', NULL, '2025', 'M.RIFQI', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0101', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', NULL, NULL, NULL),
('AST-NB0116', 'Laptop', 'HP EliteBook 640 14 inch G10 Notebook PC', 'NB-009', NULL, '2025', 'raihan', NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, 'K0147', 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', NULL, NULL, NULL),
('AST-NB0117', 'Laptop', 'HP Envy x360 2-in-1 Laptop 14-fc0xxx', 'NB-010', NULL, '2025', 'BDF', NULL, NULL, NULL, NULL, '10.12.20.119', 27, 1, 'K0046', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) Ultra 7 155U', '1TB', NULL, NULL, NULL),
('AST-NB0118', 'Laptop', 'HP EliteBook 640 14 inch G10 Notebook PC', 'NB-011', NULL, '2025', NULL, NULL, NULL, NULL, NULL, '10.12.13.56', 27, 1, NULL, 'Aktif', NULL, '16GB', '13th Gen Intel(R) Core(TM) i5-1350P', '500GB', NULL, NULL, NULL),
('AST-NB0119', 'Laptop', 'HP Envy x360 2-in-1 Laptop 14-fc0xxx', 'NB-014', NULL, '2025', 'DHANIE', NULL, NULL, NULL, NULL, '10.12.24.119', 27, 1, 'K0056', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) Ultra 5 125U', '500GB', NULL, NULL, NULL),
('AST-NB0120', 'Laptop', 'HP EliteBook 830 G6', 'DESKTOP-LLN8TPC', NULL, '2001', 'Suhadi', NULL, NULL, NULL, NULL, '10.12.20.238', 27, 1, 'K0132', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i5-8265U CPU @ 1.60GHz', '500GB', NULL, NULL, NULL),
('AST-NB0121', 'Laptop', 'HP Pavilion x360 2-in-1 Laptop 14-ek2xxx', 'DESKTOP-AIT1GAN', NULL, NULL, 'Yuni ACC', NULL, NULL, NULL, NULL, '10.12.20.205', 27, 1, 'K0144', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) 5 120U', '600GB', NULL, NULL, NULL),
('AST-NB0122', 'Laptop', 'HP Pavilion x360 2-in-1 Laptop 14-ek1xxx', NULL, NULL, NULL, 'BHK', NULL, NULL, 'MR', 'Manufactur Lt.1', NULL, 18, 1, 'K0047', 'Aktif', NULL, '8GB', '13th Gen Intel(R) Core(TM) i7-1355U', '500GB', NULL, NULL, NULL),
('AST-NB0123', 'Laptop', 'HP EliteBook 830 G6', 'NB-016', NULL, '2025', 'SEAPI 01', NULL, NULL, NULL, NULL, '10.12.13.44', 27, 1, 'K0124', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', NULL, NULL, NULL),
('AST-NB0124', 'Laptop', 'HP EliteBook 830 G6', 'NB-017', NULL, '2025', 'SEAPI 02', NULL, NULL, NULL, NULL, '10.12.13.43', 27, 1, 'K0125', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', NULL, NULL, NULL),
('AST-NB0125', 'Laptop', 'HP EliteBook 830 G6', 'NB-018', NULL, '2025', 'SEAPI 03', NULL, NULL, NULL, NULL, '10.12.13.43', 27, 1, 'K0126', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', NULL, NULL, NULL),
('AST-NB0126', 'Laptop', 'HP EliteBook 830 G6', 'NB-019', NULL, '2025', 'SEAPI 04', NULL, NULL, NULL, NULL, '10.12.13.42', 27, 1, 'K0127', 'Aktif', NULL, '16GB', 'Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz', '500GB', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `jabatan`
--

CREATE TABLE `jabatan` (
  `id_jabatan` int(11) NOT NULL,
  `nama_jabatan` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `jabatan`
--

INSERT INTO `jabatan` (`id_jabatan`, `nama_jabatan`) VALUES
(7, 'Admin'),
(1, 'Kepala Departemen'),
(4, 'Kepala Regu'),
(2, 'Manager'),
(5, 'Operator'),
(6, 'Staff'),
(3, 'Supervisor');

-- --------------------------------------------------------

--
-- Struktur dari tabel `karyawan`
--

CREATE TABLE `karyawan` (
  `nik` varchar(10) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `tanda_tangan` varchar(255) DEFAULT NULL,
  `alamat` varchar(150) DEFAULT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') NOT NULL,
  `id_departemen` int(11) NOT NULL,
  `id_bagian` int(11) DEFAULT NULL,
  `id_jabatan` int(11) NOT NULL,
  `no_hp` varchar(15) DEFAULT NULL,
  `tanggal_masuk` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `karyawan`
--

INSERT INTO `karyawan` (`nik`, `nama`, `tanda_tangan`, `alamat`, `jenis_kelamin`, `id_departemen`, `id_bagian`, `id_jabatan`, `no_hp`, `tanggal_masuk`) VALUES
('K0003', 'Desi Ramadhani', '/uploads/signatures/ttd_K0003_1788416299288.png', 'Tangerang', 'Perempuan', 1, 2, 1, '081234560003', '2017-01-10'),
('K0016', 'Putra', '/uploads/signatures/ttd_K0016_1788491337934.png', 'Kota Tegal', 'Laki-laki', 1, 1, 3, NULL, NULL),
('K0017', 'Tama', '/uploads/signatures/ttd_K0017_1788416256422.png', 'Jakarta Selatan', 'Laki-laki', 2, 14, 2, NULL, NULL),
('K0018', 'Niko', '/uploads/signatures/ttd_K0018_1788493662728.png', 'Cirebon', 'Laki-laki', 1, 2, 2, NULL, NULL),
('K0019', 'Fikri', NULL, 'Jakarta Barat', 'Laki-laki', 4, 8, 3, NULL, NULL),
('K0020', 'Yulita', NULL, 'Bandung', 'Perempuan', 1, 2, 3, NULL, NULL),
('K0021', 'Habib', NULL, 'Tegal', 'Laki-laki', 6, 9, 3, NULL, NULL),
('K0022', 'Imel', NULL, 'Jakarta barat', 'Perempuan', 5, 6, 5, NULL, NULL),
('K0023', 'Fadil', NULL, 'Bekasi', 'Laki-laki', 9, 11, 1, NULL, NULL),
('K0024', 'Nanda', NULL, 'Semarang', 'Laki-laki', 14, 16, 5, NULL, NULL),
('K0025', 'Andi', NULL, 'Bekasi', 'Laki-laki', 9, 11, 5, NULL, NULL),
('K0026', 'AAS', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0027', 'ABBA', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0028', 'ABS', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0029', 'ADP', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0030', 'AFDAN', NULL, NULL, 'Laki-laki', 23, NULL, 6, NULL, NULL),
('K0031', 'AHMAD', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0032', 'AMMRUL', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0033', 'ANDRESITO', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0034', 'ANGGORO', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0035', 'AWP', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0036', 'AZT', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0037', 'Adi Supriyanto', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0038', 'Afdan', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0039', 'Afkar Umam', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0040', 'Ahmad Budianto', NULL, NULL, 'Laki-laki', 10, NULL, 6, NULL, NULL),
('K0041', 'Aji Wibisono', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0042', 'Alif  Maula', NULL, NULL, 'Laki-laki', 2, NULL, 6, NULL, NULL),
('K0043', 'Arifo Gunawan', NULL, NULL, 'Laki-laki', 16, NULL, 6, NULL, NULL),
('K0044', 'Astri', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0045', 'BACKUP IT', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0046', 'BDF', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0047', 'BHK', NULL, NULL, 'Laki-laki', 18, NULL, 6, NULL, NULL),
('K0048', 'Bagas', NULL, NULL, 'Laki-laki', 3, NULL, 6, NULL, NULL),
('K0049', 'Bambang Sutjahjo Edi', NULL, NULL, 'Laki-laki', 25, NULL, 6, NULL, NULL),
('K0050', 'Bangun Utomo', NULL, NULL, 'Laki-laki', 9, NULL, 6, NULL, NULL),
('K0051', 'Bayu', '/uploads/signatures/ttd_K0051_1789113213242.png', NULL, 'Laki-laki', 24, NULL, 6, NULL, NULL),
('K0052', 'Betalevi', NULL, NULL, 'Laki-laki', 23, NULL, 6, NULL, NULL),
('K0053', 'Bima Putra', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0054', 'Clarisya', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0055', 'DAFFA', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0056', 'DHANIE', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0057', 'Deddy Kurnia', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0058', 'Dedi', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0059', 'Diah Hapipah', NULL, NULL, 'Laki-laki', 4, NULL, 6, NULL, NULL),
('K0060', 'Diki Amarta', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0061', 'Diko', NULL, NULL, 'Laki-laki', 4, NULL, 6, NULL, NULL),
('K0062', 'Dina', NULL, NULL, 'Laki-laki', 23, NULL, 6, NULL, NULL),
('K0063', 'Dwiki Setyo', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0064', 'EKS Nidya', NULL, NULL, 'Laki-laki', 7, NULL, 6, NULL, NULL),
('K0065', 'ENDANG', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0066', 'Eko R', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0067', 'FADILAH', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0068', 'FAJRI', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0069', 'FANDY', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0070', 'FUAD', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0071', 'Fadiel', NULL, NULL, 'Laki-laki', 23, NULL, 6, NULL, NULL),
('K0072', 'Fajar Tri Handoyo', '/uploads/signatures/ttd_K0072_1788416490850.png', NULL, 'Laki-laki', 8, NULL, 6, NULL, NULL),
('K0073', 'Farah', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0074', 'Fardhuzi', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0075', 'Gennady', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0076', 'HAFIZH', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0077', 'HARI', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0078', 'Hadi Komara', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0079', 'Haryono', NULL, NULL, 'Laki-laki', 15, NULL, 6, NULL, NULL),
('K0080', 'Hendrick', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0081', 'Hendro', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0082', 'Heri Nuryanto', NULL, NULL, 'Laki-laki', 25, NULL, 6, NULL, NULL),
('K0083', 'Hilda', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0084', 'Holila', NULL, NULL, 'Laki-laki', 21, NULL, 6, NULL, NULL),
('K0085', 'INDRA', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0086', 'Indra', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0087', 'Indra Tower', NULL, NULL, 'Laki-laki', 23, NULL, 6, NULL, NULL),
('K0088', 'Intan Nori', NULL, NULL, 'Laki-laki', 2, NULL, 6, NULL, NULL),
('K0089', 'Irfan Suharto Putra', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0090', 'KHURAZA', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0091', 'Khuraza', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0092', 'Kurniawan Tadi', NULL, NULL, 'Laki-laki', 19, NULL, 6, NULL, NULL),
('K0093', 'Kusuma', NULL, NULL, 'Laki-laki', 23, NULL, 6, NULL, NULL),
('K0094', 'LARASATI', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0095', 'Lise', '/uploads/signatures/ttd_K0095_1789113240310.png', NULL, 'Laki-laki', 17, NULL, 6, NULL, NULL),
('K0096', 'Lukman Arif', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0097', 'Lukman BMI', NULL, NULL, 'Laki-laki', 22, NULL, 6, NULL, NULL),
('K0098', 'Lukman Hakim', NULL, NULL, 'Laki-laki', 22, NULL, 6, NULL, NULL),
('K0099', 'Lulu', NULL, NULL, 'Laki-laki', 2, NULL, 6, NULL, NULL),
('K0100', 'M.K.AZZAM', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0101', 'M.RIFQI', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0102', 'Makaarim', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0103', 'Mansyur', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0104', 'Mujaini', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0105', 'Munawar Hakki', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0106', 'Mustakim', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0107', 'NIDYA', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0108', 'NUGRAHENI', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0109', 'NUGROHO', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0110', 'Novyar', '/uploads/signatures/ttd_K0110_1789114306456.jpg', NULL, 'Laki-laki', 17, NULL, 6, NULL, NULL),
('K0111', 'Nurseha', NULL, NULL, 'Laki-laki', 8, NULL, 6, NULL, NULL),
('K0112', 'Pamela', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0113', 'Priyo', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0114', 'REZHA IT', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0115', 'RIZKI', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0116', 'Ricky abdul karim', NULL, NULL, 'Laki-laki', 4, NULL, 6, NULL, NULL),
('K0117', 'Ridwan QC', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0118', 'Rifai', NULL, NULL, 'Laki-laki', 23, NULL, 6, NULL, NULL),
('K0119', 'Rino', NULL, NULL, 'Laki-laki', 15, NULL, 6, NULL, NULL),
('K0120', 'Riza fahlefi eks AZT', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0121', 'Rizki Pirsiani', NULL, NULL, 'Laki-laki', 18, NULL, 6, NULL, NULL),
('K0122', 'Rusma', NULL, NULL, 'Laki-laki', 20, NULL, 6, NULL, NULL),
('K0123', 'Rusmiyanto', NULL, NULL, 'Laki-laki', 23, NULL, 6, NULL, NULL),
('K0124', 'SEAPI 01', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0125', 'SEAPI 02', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0126', 'SEAPI 03', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0127', 'SEAPI 04', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0128', 'Saimun Riswanto', NULL, NULL, 'Laki-laki', 4, NULL, 6, NULL, NULL),
('K0129', 'Salman Remunerasi', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0130', 'Setyo Bayu', NULL, NULL, 'Laki-laki', 20, NULL, 6, NULL, NULL),
('K0131', 'Sugiyo ppic', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0132', 'Suhadi', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0133', 'Suraji', NULL, NULL, 'Laki-laki', 2, NULL, 6, NULL, NULL),
('K0134', 'Tofiqurahman', NULL, NULL, 'Laki-laki', 8, NULL, 6, NULL, NULL),
('K0135', 'Tuti', NULL, NULL, 'Laki-laki', 2, NULL, 6, NULL, NULL),
('K0136', 'VIVIN', NULL, NULL, 'Laki-laki', 10, NULL, 6, NULL, NULL),
('K0137', 'Wahyu', NULL, NULL, 'Laki-laki', 18, NULL, 6, NULL, NULL),
('K0138', 'Wida Ratri', NULL, NULL, 'Laki-laki', 10, NULL, 6, NULL, NULL),
('K0139', 'Widi Suharyanto', NULL, NULL, 'Laki-laki', 22, NULL, 6, NULL, NULL),
('K0140', 'Wigi', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0141', 'Yane Rosdiana', NULL, NULL, 'Laki-laki', 24, NULL, 6, NULL, NULL),
('K0142', 'Yoyon', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0143', 'Yudi BMI', NULL, NULL, 'Laki-laki', 22, NULL, 6, NULL, NULL),
('K0144', 'Yuni ACC', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0145', 'Ziyad Ibnu Kama', NULL, NULL, 'Laki-laki', 4, NULL, 6, NULL, NULL),
('K0146', 'ii Nurul hapsari', NULL, NULL, 'Laki-laki', 6, NULL, 6, NULL, NULL),
('K0147', 'raihan', NULL, NULL, 'Laki-laki', 27, NULL, 6, NULL, NULL),
('K0148', 'Bagas', '/uploads/signatures/ttd_K0148_1789091597173.png', 'Bekasi', 'Laki-laki', 1, 2, 3, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `kategori`
--

CREATE TABLE `kategori` (
  `id_kategori` int(11) NOT NULL,
  `nama_kategori` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kategori`
--

INSERT INTO `kategori` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Hardware'),
(3, 'Jaringan'),
(4, 'Mesin Produksi'),
(5, 'Sistem ERP'),
(2, 'Software');

-- --------------------------------------------------------

--
-- Struktur dari tabel `laporan_feedback`
--

CREATE TABLE `laporan_feedback` (
  `id_feedback` int(11) NOT NULL,
  `id_ticket` varchar(20) NOT NULL,
  `nik_pelapor` varchar(10) NOT NULL,
  `tanggal` datetime NOT NULL DEFAULT current_timestamp(),
  `feedback` enum('Positif','Negatif') NOT NULL,
  `keterangan` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `list_ticket`
--

CREATE TABLE `list_ticket` (
  `id_ticket` varchar(20) NOT NULL,
  `nik_pelapor` varchar(10) NOT NULL,
  `id_departemen` int(11) NOT NULL,
  `id_kategori` int(11) DEFAULT NULL,
  `id_sub_kategori` int(11) DEFAULT NULL,
  `kode_asset` varchar(15) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `lampiran` varchar(255) DEFAULT NULL COMMENT 'path/nama file foto lampiran',
  `tanggal_lapor` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('Menunggu Approval','On Process','Solved','Reject') NOT NULL DEFAULT 'Menunggu Approval',
  `prioritas` enum('Low','Normal','Urgent') DEFAULT 'Normal',
  `deadline` datetime DEFAULT NULL,
  `id_schedule` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `list_ticket`
--

INSERT INTO `list_ticket` (`id_ticket`, `nik_pelapor`, `id_departemen`, `id_kategori`, `id_sub_kategori`, `kode_asset`, `deskripsi`, `lampiran`, `tanggal_lapor`, `status`, `prioritas`, `deadline`, `id_schedule`) VALUES
('T1789438198505', 'K0110', 17, 1, 1, 'AST-NB0047', 'piyrw', '/uploads/lampiran/1789438198469-466471310.jpeg', '2026-09-15 09:09:58', 'Solved', 'Normal', '2026-09-15 15:11:24', NULL),
('T1789452975561', 'K0110', 17, 1, 1, 'AST-NB0047', '828393', NULL, '2026-09-15 13:16:15', 'Reject', 'Normal', NULL, NULL),
('T1789458753418', 'K0110', 17, 1, 1, 'AST-NB0047', 'papapa', NULL, '2026-09-15 14:52:33', '', 'Normal', NULL, NULL),
('T1789461573079', 'K0110', 17, 1, 1, 'AST-NB0047', 'rusak', NULL, '2026-09-15 15:39:33', '', 'Normal', NULL, NULL),
('T1789461871897', 'K0110', 17, 1, 2, 'AST-NB0047', 'appapa', NULL, '2026-09-15 15:44:31', '', 'Urgent', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `preventive_schedule`
--

CREATE TABLE `preventive_schedule` (
  `id_schedule` int(11) NOT NULL,
  `nama_schedule` varchar(100) NOT NULL,
  `id_departemen` int(11) NOT NULL,
  `id_kategori` int(11) DEFAULT NULL,
  `id_sub_kategori` int(11) DEFAULT NULL,
  `frekuensi` int(11) NOT NULL COMMENT 'angka periode',
  `satuan` enum('hari','minggu','bulan','tahun') NOT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `id_teknis` text DEFAULT NULL COMMENT 'bisa multiple, simpan sebagai JSON atau comma separated, atau buat tabel terpisah',
  `deskripsi` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `checklist_kategori` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `preventive_schedule`
--

INSERT INTO `preventive_schedule` (`id_schedule`, `nama_schedule`, `id_departemen`, `id_kategori`, `id_sub_kategori`, `frekuensi`, `satuan`, `tanggal_mulai`, `tanggal_selesai`, `id_teknis`, `deskripsi`, `is_active`, `created_at`, `updated_at`, `checklist_kategori`) VALUES
(42, 'Pembersihan ', 17, NULL, NULL, 5, 'hari', '2026-09-14', '2026-09-19', NULL, 'apa aja bersih', 1, '2026-09-14 03:48:54', '2026-09-14 03:48:54', '[\"CPU\",\"Monitor\",\"Software\",\"Printer/Scanner\",\"Network Equipment\"]'),
(43, 'Pembersihan', 17, NULL, NULL, 9, 'hari', '2026-09-16', '2026-09-25', NULL, 'cepetan', 1, '2026-09-15 02:04:01', '2026-09-15 04:10:08', '[\"CPU\",\"Monitor\",\"Software\",\"Printer/Scanner\",\"Network Equipment\"]');

-- --------------------------------------------------------

--
-- Struktur dari tabel `schedule_asset`
--

CREATE TABLE `schedule_asset` (
  `id_schedule` int(11) NOT NULL,
  `kode_asset` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `schedule_asset`
--

INSERT INTO `schedule_asset` (`id_schedule`, `kode_asset`) VALUES
(42, 'AST-NB0012'),
(42, 'AST-NB0047'),
(43, 'AST-NB0012'),
(43, 'AST-NB0047');

-- --------------------------------------------------------

--
-- Struktur dari tabel `schedule_asset_claim`
--

CREATE TABLE `schedule_asset_claim` (
  `id_claim` int(11) NOT NULL,
  `id_schedule` int(11) NOT NULL,
  `kode_asset` varchar(50) NOT NULL,
  `id_teknisi` varchar(20) NOT NULL,
  `id_ticket` varchar(50) NOT NULL,
  `claimed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `schedule_asset_claim`
--

INSERT INTO `schedule_asset_claim` (`id_claim`, `id_schedule`, `kode_asset`, `id_teknisi`, `id_ticket`, `claimed_at`) VALUES
(14, 42, 'AST-NB0047', 'TKN-0012', 'T1789369173881120', '2026-09-14 13:59:34');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sub_kategori`
--

CREATE TABLE `sub_kategori` (
  `id_sub_kategori` int(11) NOT NULL,
  `id_kategori` int(11) NOT NULL,
  `nama_sub_kategori` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sub_kategori`
--

INSERT INTO `sub_kategori` (`id_sub_kategori`, `id_kategori`, `nama_sub_kategori`) VALUES
(1, 1, 'Kerusakan Monitor'),
(2, 1, 'Kerusakan Mouse'),
(3, 1, 'Kerusakan Keyboard'),
(4, 1, 'Kerusakan Printer'),
(5, 2, 'Error Aplikasi'),
(6, 2, 'Install Ulang Software'),
(7, 3, 'Koneksi Internet Lambat'),
(8, 3, 'Wifi Tidak Terdeteksi'),
(9, 4, 'Mesin Welding Overheat'),
(10, 4, 'Mesin Cutting Macet'),
(11, 5, 'Login SAP Gagal');

-- --------------------------------------------------------

--
-- Struktur dari tabel `teknisi`
--

CREATE TABLE `teknisi` (
  `id_teknisi` varchar(15) NOT NULL,
  `nik` varchar(10) NOT NULL,
  `id_kategori` int(11) NOT NULL COMMENT 'Spesialisasi kategori',
  `status` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  `jumlah_tiket_ditangani` int(11) NOT NULL DEFAULT 0 COMMENT 'auto increment saat assignment dibuat'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `teknisi`
--

INSERT INTO `teknisi` (`id_teknisi`, `nik`, `id_kategori`, `status`, `jumlah_tiket_ditangani`) VALUES
('TKN-0009', 'K0017', 1, 'Aktif', 24),
('TKN-0010', 'K0016', 1, 'Aktif', 0),
('TKN-0011', 'K0148', 1, 'Aktif', 0),
('TKN-0012', 'K0051', 1, 'Aktif', 6);

-- --------------------------------------------------------

--
-- Struktur dari tabel `ticket_chat`
--

CREATE TABLE `ticket_chat` (
  `id_chat` int(11) NOT NULL,
  `id_ticket` varchar(20) NOT NULL,
  `sender_id` varchar(15) NOT NULL COMMENT 'nik (Users/Admin) atau id_teknisi (Teknisi)',
  `sender_role` enum('Admin','Teknisi','Users') NOT NULL,
  `sender_name` varchar(100) NOT NULL,
  `message` text DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL COMMENT 'path foto yang dikirim, misal /uploads/xxxx.jpg',
  `created_at` datetime DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `ticket_checklist_result`
--

CREATE TABLE `ticket_checklist_result` (
  `id_result` int(11) NOT NULL,
  `id_ticket` varchar(50) NOT NULL,
  `id_item` int(11) NOT NULL,
  `kondisi` enum('OK','NC') DEFAULT NULL,
  `kondisi_huruf` enum('B','C','D') DEFAULT NULL,
  `catatan` varchar(255) DEFAULT NULL,
  `checked_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `ticket_progress_log`
--

CREATE TABLE `ticket_progress_log` (
  `id_log` int(11) NOT NULL,
  `id_assignment` int(11) NOT NULL,
  `progress` tinyint(4) NOT NULL,
  `catatan` text DEFAULT NULL,
  `status_pengerjaan` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ticket_progress_log`
--

INSERT INTO `ticket_progress_log` (`id_log`, `id_assignment`, `progress`, `catatan`, `status_pengerjaan`, `created_at`) VALUES
(272, 147, 0, NULL, 'Proses', '2026-09-15 02:10:58'),
(273, 147, 50, NULL, 'Proses', '2026-09-15 02:11:13'),
(274, 147, 70, 'proses pembelian', 'Proses', '2026-09-15 02:11:47'),
(275, 147, 70, 'proses pembelian', 'Proses', '2026-09-15 02:12:03'),
(276, 147, 70, 'proses pembelian', 'Proses', '2026-09-15 02:12:41'),
(277, 147, 100, 'selesai semuanya', 'Proses', '2026-09-15 02:13:21'),
(278, 147, 100, 'selesai semuanya', 'Selesai', '2026-09-15 02:13:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nik` varchar(10) NOT NULL,
  `level` enum('Admin','Teknisi','Users') NOT NULL DEFAULT 'Users',
  `status` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `user`
--

INSERT INTO `user` (`id_user`, `username`, `password`, `nik`, `level`, `status`) VALUES
(1, 'K0003', '$2a$10$LPbY2TKiMfJSfLNGSN0kreHci1Rb9Mz1S9cu4C0e9Jf5NW5eqD8MS', 'K0003', 'Admin', 'Aktif'),
(42, 'K0110', '$2a$10$a84yeqDuwY5GLAbD1H9q8./YhwncOHQPPKEdTTNAO53svNlvolKOu', 'K0110', 'Users', 'Aktif'),
(44, 'K0051', '$2a$10$Q/mQMhI5nNBhjVS8088U7.d5H1ovLpGNbVhiVCgMIbEzrDPbbQZdu', 'K0051', 'Teknisi', 'Aktif'),
(45, 'K0095', '$2a$10$sCbRFzQMNBcLJXCz3grfh.9gtYVfbbW149dqmD4PoUrN0kiVGUpgC', 'K0095', 'Users', 'Aktif');

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `v_dashboard_summary`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `v_dashboard_summary` (
`total_tiket` bigint(21)
,`total_karyawan` bigint(21)
,`total_user_aktif` bigint(21)
,`total_teknisi_aktif` bigint(21)
,`total_asset` bigint(21)
,`tiket_solved` bigint(21)
,`tiket_on_process` bigint(21)
,`tiket_menunggu_approval` bigint(21)
,`tiket_reject` bigint(21)
,`feedback_positif` bigint(21)
,`feedback_negatif` bigint(21)
);

-- --------------------------------------------------------

--
-- Struktur untuk view `v_dashboard_summary`
--
DROP TABLE IF EXISTS `v_dashboard_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_dashboard_summary`  AS SELECT (select count(0) from `list_ticket`) AS `total_tiket`, (select count(0) from `karyawan`) AS `total_karyawan`, (select count(0) from `user` where `user`.`status` = 'Aktif') AS `total_user_aktif`, (select count(0) from `teknisi` where `teknisi`.`status` = 'Aktif') AS `total_teknisi_aktif`, (select count(0) from `inventory`) AS `total_asset`, (select count(0) from `list_ticket` where `list_ticket`.`status` = 'Solved') AS `tiket_solved`, (select count(0) from `list_ticket` where `list_ticket`.`status` = 'On Process') AS `tiket_on_process`, (select count(0) from `list_ticket` where `list_ticket`.`status` = 'Menunggu Approval') AS `tiket_menunggu_approval`, (select count(0) from `list_ticket` where `list_ticket`.`status` = 'Reject') AS `tiket_reject`, (select count(0) from `laporan_feedback` where `laporan_feedback`.`feedback` = 'Positif') AS `feedback_positif`, (select count(0) from `laporan_feedback` where `laporan_feedback`.`feedback` = 'Negatif') AS `feedback_negatif` ;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `approval_ticket`
--
ALTER TABLE `approval_ticket`
  ADD PRIMARY KEY (`id_approval`),
  ADD UNIQUE KEY `id_ticket` (`id_ticket`),
  ADD KEY `nik_admin` (`nik_admin`);

--
-- Indeks untuk tabel `asset_department_history`
--
ALTER TABLE `asset_department_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asset_department_history_kode` (`kode_asset`);

--
-- Indeks untuk tabel `asset_hardware`
--
ALTER TABLE `asset_hardware`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hardware_kode` (`kode_asset`);

--
-- Indeks untuk tabel `asset_hardware_detail`
--
ALTER TABLE `asset_hardware_detail`
  ADD PRIMARY KEY (`kode_asset`);

--
-- Indeks untuk tabel `asset_history`
--
ALTER TABLE `asset_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_history_kode` (`kode_asset`);

--
-- Indeks untuk tabel `asset_holder_history`
--
ALTER TABLE `asset_holder_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kode_asset` (`kode_asset`);

--
-- Indeks untuk tabel `asset_software`
--
ALTER TABLE `asset_software`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_software_kode` (`kode_asset`);

--
-- Indeks untuk tabel `asset_software_detail`
--
ALTER TABLE `asset_software_detail`
  ADD PRIMARY KEY (`kode_asset`);

--
-- Indeks untuk tabel `assignment_ticket`
--
ALTER TABLE `assignment_ticket`
  ADD PRIMARY KEY (`id_assignment`),
  ADD UNIQUE KEY `id_ticket` (`id_ticket`),
  ADD KEY `id_teknisi` (`id_teknisi`);

--
-- Indeks untuk tabel `bagian_departemen`
--
ALTER TABLE `bagian_departemen`
  ADD PRIMARY KEY (`id_bagian`),
  ADD KEY `id_departemen` (`id_departemen`);

--
-- Indeks untuk tabel `checklist_approval`
--
ALTER TABLE `checklist_approval`
  ADD PRIMARY KEY (`id_ticket`);

--
-- Indeks untuk tabel `checklist_template`
--
ALTER TABLE `checklist_template`
  ADD PRIMARY KEY (`id_item`);

--
-- Indeks untuk tabel `departemen`
--
ALTER TABLE `departemen`
  ADD PRIMARY KEY (`id_departemen`),
  ADD UNIQUE KEY `nama_departemen` (`nama_departemen`);

--
-- Indeks untuk tabel `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`kode_asset`),
  ADD KEY `id_departemen` (`id_departemen`),
  ADD KEY `id_kategori` (`id_kategori`),
  ADD KEY `nik_pemegang` (`nik_pemegang`),
  ADD KEY `id_preventive_schedule` (`id_preventive_schedule`);

--
-- Indeks untuk tabel `jabatan`
--
ALTER TABLE `jabatan`
  ADD PRIMARY KEY (`id_jabatan`),
  ADD UNIQUE KEY `nama_jabatan` (`nama_jabatan`);

--
-- Indeks untuk tabel `karyawan`
--
ALTER TABLE `karyawan`
  ADD PRIMARY KEY (`nik`),
  ADD KEY `id_departemen` (`id_departemen`),
  ADD KEY `id_bagian` (`id_bagian`),
  ADD KEY `id_jabatan` (`id_jabatan`);

--
-- Indeks untuk tabel `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id_kategori`),
  ADD UNIQUE KEY `nama_kategori` (`nama_kategori`);

--
-- Indeks untuk tabel `laporan_feedback`
--
ALTER TABLE `laporan_feedback`
  ADD PRIMARY KEY (`id_feedback`),
  ADD UNIQUE KEY `id_ticket` (`id_ticket`),
  ADD KEY `nik_pelapor` (`nik_pelapor`);

--
-- Indeks untuk tabel `list_ticket`
--
ALTER TABLE `list_ticket`
  ADD PRIMARY KEY (`id_ticket`),
  ADD KEY `nik_pelapor` (`nik_pelapor`),
  ADD KEY `id_departemen` (`id_departemen`),
  ADD KEY `id_kategori` (`id_kategori`),
  ADD KEY `id_sub_kategori` (`id_sub_kategori`),
  ADD KEY `kode_asset` (`kode_asset`),
  ADD KEY `fk_list_ticket_schedule` (`id_schedule`);

--
-- Indeks untuk tabel `preventive_schedule`
--
ALTER TABLE `preventive_schedule`
  ADD PRIMARY KEY (`id_schedule`),
  ADD KEY `id_departemen` (`id_departemen`),
  ADD KEY `id_kategori` (`id_kategori`),
  ADD KEY `id_sub_kategori` (`id_sub_kategori`);

--
-- Indeks untuk tabel `schedule_asset`
--
ALTER TABLE `schedule_asset`
  ADD PRIMARY KEY (`id_schedule`,`kode_asset`),
  ADD KEY `kode_asset` (`kode_asset`);

--
-- Indeks untuk tabel `schedule_asset_claim`
--
ALTER TABLE `schedule_asset_claim`
  ADD PRIMARY KEY (`id_claim`),
  ADD UNIQUE KEY `uniq_schedule_asset` (`id_schedule`,`kode_asset`);

--
-- Indeks untuk tabel `sub_kategori`
--
ALTER TABLE `sub_kategori`
  ADD PRIMARY KEY (`id_sub_kategori`),
  ADD KEY `id_kategori` (`id_kategori`);

--
-- Indeks untuk tabel `teknisi`
--
ALTER TABLE `teknisi`
  ADD PRIMARY KEY (`id_teknisi`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD KEY `id_kategori` (`id_kategori`);

--
-- Indeks untuk tabel `ticket_chat`
--
ALTER TABLE `ticket_chat`
  ADD PRIMARY KEY (`id_chat`),
  ADD KEY `id_ticket` (`id_ticket`);

--
-- Indeks untuk tabel `ticket_checklist_result`
--
ALTER TABLE `ticket_checklist_result`
  ADD PRIMARY KEY (`id_result`),
  ADD UNIQUE KEY `uniq_ticket_item` (`id_ticket`,`id_item`),
  ADD KEY `id_item` (`id_item`);

--
-- Indeks untuk tabel `ticket_progress_log`
--
ALTER TABLE `ticket_progress_log`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_assignment` (`id_assignment`);

--
-- Indeks untuk tabel `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `nik` (`nik`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `approval_ticket`
--
ALTER TABLE `approval_ticket`
  MODIFY `id_approval` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT untuk tabel `asset_department_history`
--
ALTER TABLE `asset_department_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `asset_hardware`
--
ALTER TABLE `asset_hardware`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1388;

--
-- AUTO_INCREMENT untuk tabel `asset_history`
--
ALTER TABLE `asset_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `asset_holder_history`
--
ALTER TABLE `asset_holder_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `asset_software`
--
ALTER TABLE `asset_software`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=253;

--
-- AUTO_INCREMENT untuk tabel `assignment_ticket`
--
ALTER TABLE `assignment_ticket`
  MODIFY `id_assignment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=152;

--
-- AUTO_INCREMENT untuk tabel `bagian_departemen`
--
ALTER TABLE `bagian_departemen`
  MODIFY `id_bagian` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `checklist_template`
--
ALTER TABLE `checklist_template`
  MODIFY `id_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT untuk tabel `departemen`
--
ALTER TABLE `departemen`
  MODIFY `id_departemen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT untuk tabel `jabatan`
--
ALTER TABLE `jabatan`
  MODIFY `id_jabatan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id_kategori` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `laporan_feedback`
--
ALTER TABLE `laporan_feedback`
  MODIFY `id_feedback` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `preventive_schedule`
--
ALTER TABLE `preventive_schedule`
  MODIFY `id_schedule` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT untuk tabel `schedule_asset_claim`
--
ALTER TABLE `schedule_asset_claim`
  MODIFY `id_claim` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `sub_kategori`
--
ALTER TABLE `sub_kategori`
  MODIFY `id_sub_kategori` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `ticket_chat`
--
ALTER TABLE `ticket_chat`
  MODIFY `id_chat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `ticket_checklist_result`
--
ALTER TABLE `ticket_checklist_result`
  MODIFY `id_result` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1975;

--
-- AUTO_INCREMENT untuk tabel `ticket_progress_log`
--
ALTER TABLE `ticket_progress_log`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=283;

--
-- AUTO_INCREMENT untuk tabel `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `approval_ticket`
--
ALTER TABLE `approval_ticket`
  ADD CONSTRAINT `approval_ticket_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `list_ticket` (`id_ticket`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `approval_ticket_ibfk_2` FOREIGN KEY (`nik_admin`) REFERENCES `karyawan` (`nik`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `asset_department_history`
--
ALTER TABLE `asset_department_history`
  ADD CONSTRAINT `fk_asset_department_history_asset` FOREIGN KEY (`kode_asset`) REFERENCES `inventory` (`kode_asset`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `asset_hardware`
--
ALTER TABLE `asset_hardware`
  ADD CONSTRAINT `fk_hardware_asset` FOREIGN KEY (`kode_asset`) REFERENCES `inventory` (`kode_asset`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `asset_hardware_detail`
--
ALTER TABLE `asset_hardware_detail`
  ADD CONSTRAINT `fk_hwdetail_asset` FOREIGN KEY (`kode_asset`) REFERENCES `inventory` (`kode_asset`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `asset_history`
--
ALTER TABLE `asset_history`
  ADD CONSTRAINT `fk_history_asset` FOREIGN KEY (`kode_asset`) REFERENCES `inventory` (`kode_asset`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `asset_holder_history`
--
ALTER TABLE `asset_holder_history`
  ADD CONSTRAINT `asset_holder_history_ibfk_1` FOREIGN KEY (`kode_asset`) REFERENCES `inventory` (`kode_asset`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `asset_software`
--
ALTER TABLE `asset_software`
  ADD CONSTRAINT `fk_software_asset` FOREIGN KEY (`kode_asset`) REFERENCES `inventory` (`kode_asset`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `asset_software_detail`
--
ALTER TABLE `asset_software_detail`
  ADD CONSTRAINT `fk_swdetail_asset` FOREIGN KEY (`kode_asset`) REFERENCES `inventory` (`kode_asset`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `assignment_ticket`
--
ALTER TABLE `assignment_ticket`
  ADD CONSTRAINT `assignment_ticket_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `list_ticket` (`id_ticket`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `assignment_ticket_ibfk_2` FOREIGN KEY (`id_teknisi`) REFERENCES `teknisi` (`id_teknisi`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `bagian_departemen`
--
ALTER TABLE `bagian_departemen`
  ADD CONSTRAINT `bagian_departemen_ibfk_1` FOREIGN KEY (`id_departemen`) REFERENCES `departemen` (`id_departemen`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `checklist_approval`
--
ALTER TABLE `checklist_approval`
  ADD CONSTRAINT `fk_checklist_approval_ticket` FOREIGN KEY (`id_ticket`) REFERENCES `list_ticket` (`id_ticket`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`id_departemen`) REFERENCES `departemen` (`id_departemen`) ON UPDATE CASCADE,
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON UPDATE CASCADE,
  ADD CONSTRAINT `inventory_ibfk_3` FOREIGN KEY (`nik_pemegang`) REFERENCES `karyawan` (`nik`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `inventory_ibfk_4` FOREIGN KEY (`id_preventive_schedule`) REFERENCES `preventive_schedule` (`id_schedule`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `karyawan`
--
ALTER TABLE `karyawan`
  ADD CONSTRAINT `karyawan_ibfk_1` FOREIGN KEY (`id_departemen`) REFERENCES `departemen` (`id_departemen`) ON UPDATE CASCADE,
  ADD CONSTRAINT `karyawan_ibfk_2` FOREIGN KEY (`id_bagian`) REFERENCES `bagian_departemen` (`id_bagian`) ON UPDATE CASCADE,
  ADD CONSTRAINT `karyawan_ibfk_3` FOREIGN KEY (`id_jabatan`) REFERENCES `jabatan` (`id_jabatan`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `laporan_feedback`
--
ALTER TABLE `laporan_feedback`
  ADD CONSTRAINT `laporan_feedback_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `list_ticket` (`id_ticket`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `laporan_feedback_ibfk_2` FOREIGN KEY (`nik_pelapor`) REFERENCES `karyawan` (`nik`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `list_ticket`
--
ALTER TABLE `list_ticket`
  ADD CONSTRAINT `fk_list_ticket_schedule` FOREIGN KEY (`id_schedule`) REFERENCES `preventive_schedule` (`id_schedule`),
  ADD CONSTRAINT `list_ticket_ibfk_1` FOREIGN KEY (`nik_pelapor`) REFERENCES `karyawan` (`nik`) ON UPDATE CASCADE,
  ADD CONSTRAINT `list_ticket_ibfk_2` FOREIGN KEY (`id_departemen`) REFERENCES `departemen` (`id_departemen`) ON UPDATE CASCADE,
  ADD CONSTRAINT `list_ticket_ibfk_3` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON UPDATE CASCADE,
  ADD CONSTRAINT `list_ticket_ibfk_4` FOREIGN KEY (`id_sub_kategori`) REFERENCES `sub_kategori` (`id_sub_kategori`) ON UPDATE CASCADE,
  ADD CONSTRAINT `list_ticket_ibfk_5` FOREIGN KEY (`kode_asset`) REFERENCES `inventory` (`kode_asset`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `preventive_schedule`
--
ALTER TABLE `preventive_schedule`
  ADD CONSTRAINT `preventive_schedule_ibfk_1` FOREIGN KEY (`id_departemen`) REFERENCES `departemen` (`id_departemen`),
  ADD CONSTRAINT `preventive_schedule_ibfk_2` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`),
  ADD CONSTRAINT `preventive_schedule_ibfk_3` FOREIGN KEY (`id_sub_kategori`) REFERENCES `sub_kategori` (`id_sub_kategori`);

--
-- Ketidakleluasaan untuk tabel `schedule_asset`
--
ALTER TABLE `schedule_asset`
  ADD CONSTRAINT `schedule_asset_ibfk_1` FOREIGN KEY (`id_schedule`) REFERENCES `preventive_schedule` (`id_schedule`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedule_asset_ibfk_2` FOREIGN KEY (`kode_asset`) REFERENCES `inventory` (`kode_asset`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `sub_kategori`
--
ALTER TABLE `sub_kategori`
  ADD CONSTRAINT `sub_kategori_ibfk_1` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `teknisi`
--
ALTER TABLE `teknisi`
  ADD CONSTRAINT `teknisi_ibfk_1` FOREIGN KEY (`nik`) REFERENCES `karyawan` (`nik`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `teknisi_ibfk_2` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `ticket_chat`
--
ALTER TABLE `ticket_chat`
  ADD CONSTRAINT `ticket_chat_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `list_ticket` (`id_ticket`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `ticket_checklist_result`
--
ALTER TABLE `ticket_checklist_result`
  ADD CONSTRAINT `ticket_checklist_result_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `list_ticket` (`id_ticket`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_checklist_result_ibfk_2` FOREIGN KEY (`id_item`) REFERENCES `checklist_template` (`id_item`);

--
-- Ketidakleluasaan untuk tabel `ticket_progress_log`
--
ALTER TABLE `ticket_progress_log`
  ADD CONSTRAINT `ticket_progress_log_ibfk_1` FOREIGN KEY (`id_assignment`) REFERENCES `assignment_ticket` (`id_assignment`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`nik`) REFERENCES `karyawan` (`nik`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
