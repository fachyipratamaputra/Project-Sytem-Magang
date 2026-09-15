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
-- Database: `teknisi`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `proses_ticket`
--

CREATE TABLE `proses_ticket` (
  `id_proses` int(11) NOT NULL,
  `id_ticket` varchar(30) DEFAULT NULL,
  `deskripsi_masalah` text NOT NULL,
  `lampiran` varchar(255) DEFAULT NULL,
  `progress` int(11) DEFAULT 0,
  `catatan_penyelesaian` text DEFAULT NULL,
  `update_status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `proses_ticket`
--

INSERT INTO `proses_ticket` (`id_proses`, `id_ticket`, `deskripsi_masalah`, `lampiran`, `progress`, `catatan_penyelesaian`, `update_status`) VALUES
(1, 'T202612020001', 'Kerusakan monitor', 'Foto', 50, 'Monitor sudah diganti', 'Proses');

-- --------------------------------------------------------

--
-- Struktur dari tabel `riwayat_ticket`
--

CREATE TABLE `riwayat_ticket` (
  `id_riwayat` int(11) NOT NULL,
  `id_ticket` varchar(30) DEFAULT NULL,
  `reported` varchar(100) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `progress` varchar(10) DEFAULT '100%',
  `status` varchar(50) DEFAULT 'Selesai'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `riwayat_ticket`
--

INSERT INTO `riwayat_ticket` (`id_riwayat`, `id_ticket`, `reported`, `kategori`, `tanggal_selesai`, `progress`, `status`) VALUES
(1, 'T202612020001', 'Desi', 'Hardware', '2026-12-02', '100%', 'Selesai');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ticket_teknisi`
--

CREATE TABLE `ticket_teknisi` (
  `id_ticket` varchar(30) NOT NULL,
  `reported` varchar(100) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `sub_kategori` varchar(100) NOT NULL,
  `asset` varchar(50) DEFAULT NULL,
  `lampiran` varchar(255) DEFAULT NULL,
  `tanggal_assign` date NOT NULL,
  `status` varchar(50) DEFAULT 'Menunggu Diproses'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ticket_teknisi`
--

INSERT INTO `ticket_teknisi` (`id_ticket`, `reported`, `kategori`, `sub_kategori`, `asset`, `lampiran`, `tanggal_assign`, `status`) VALUES
('T202612020001', 'Desi', 'Hardware', 'Kerusakan monitor', 'Laptop', 'Foto', '2026-12-02', 'Menunggu Diproses');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `proses_ticket`
--
ALTER TABLE `proses_ticket`
  ADD PRIMARY KEY (`id_proses`),
  ADD KEY `id_ticket` (`id_ticket`);

--
-- Indeks untuk tabel `riwayat_ticket`
--
ALTER TABLE `riwayat_ticket`
  ADD PRIMARY KEY (`id_riwayat`);

--
-- Indeks untuk tabel `ticket_teknisi`
--
ALTER TABLE `ticket_teknisi`
  ADD PRIMARY KEY (`id_ticket`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `proses_ticket`
--
ALTER TABLE `proses_ticket`
  MODIFY `id_proses` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `riwayat_ticket`
--
ALTER TABLE `riwayat_ticket`
  MODIFY `id_riwayat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `proses_ticket`
--
ALTER TABLE `proses_ticket`
  ADD CONSTRAINT `proses_ticket_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `ticket_teknisi` (`id_ticket`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
