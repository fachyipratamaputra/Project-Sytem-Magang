-- =========================================================
-- DATABASE: admin
-- Sistem Helpdesk Ticketing - PT Bakrie Pipe Industries (Bekasi)
-- Sudah disesuaikan dengan 14 fitur Admin di dokumen Word:
-- 2.Dashboard 3.List Ticket 4.Approval Ticket 5.Assignment Ticket
-- 6.Karyawan 7.User 8.Jabatan 9.Departemen 10.Bagian Departemen
-- 11.Kategori 12.Sub Kategori 13.Teknisi 14.Inventory 15.Laporan Feedback
-- Semua tabel terhubung lewat FOREIGN KEY (tidak ada tabel berdiri sendiri)
-- =========================================================

DROP DATABASE IF EXISTS admin;
CREATE DATABASE admin CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE admin;

-- =========================================================
-- 9. DEPARTEMEN
-- =========================================================
CREATE TABLE departemen (
    id_departemen INT AUTO_INCREMENT PRIMARY KEY,
    nama_departemen VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO departemen (id_departemen, nama_departemen) VALUES
(1, 'IT'), (2, 'HRD'), (3, 'Produksi'), (4, 'PPIC'), (5, 'Quality Control'),
(6, 'Maintenance'), (7, 'Marketing'), (8, 'Finance & Accounting'),
(9, 'Warehouse / Gudang'), (10, 'Purchasing');

-- =========================================================
-- 10. BAGIAN DEPARTEMEN (anak dari Departemen)
-- =========================================================
CREATE TABLE bagian_departemen (
    id_bagian INT AUTO_INCREMENT PRIMARY KEY,
    id_departemen INT NOT NULL,
    nama_bagian VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_departemen) REFERENCES departemen(id_departemen)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO bagian_departemen (id_bagian, id_departemen, nama_bagian) VALUES
(1, 1, 'Infrastruktur'), (2, 1, 'Network & Support'),
(3, 3, 'Welding & Forming'), (4, 3, 'Galvanizing'), (5, 3, 'Cutting & Threading'),
(6, 5, 'Incoming Inspection'), (7, 5, 'Final Inspection'),
(8, 4, 'Production Planning'), (9, 6, 'Mechanical'), (10, 6, 'Electrical'),
(11, 9, 'Raw Material Store'), (12, 9, 'Finished Goods Store'),
(13, 8, 'Accounting'), (14, 2, 'Recruitment & GA');

-- =========================================================
-- 8. JABATAN
-- =========================================================
CREATE TABLE jabatan (
    id_jabatan INT AUTO_INCREMENT PRIMARY KEY,
    nama_jabatan VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO jabatan (id_jabatan, nama_jabatan) VALUES
(1, 'Kepala Departemen'), (2, 'Manager'), (3, 'Supervisor'),
(4, 'Kepala Regu'), (5, 'Operator'), (6, 'Staff'), (7, 'Admin');

-- =========================================================
-- 6. KARYAWAN (pusat relasi: departemen, bagian, jabatan)
-- =========================================================
CREATE TABLE karyawan (
    nik VARCHAR(10) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    alamat VARCHAR(150),
    jenis_kelamin ENUM('Laki-laki','Perempuan') NOT NULL,
    id_departemen INT NOT NULL,
    id_bagian INT,
    id_jabatan INT NOT NULL,
    no_hp VARCHAR(15),
    tanggal_masuk DATE,
    FOREIGN KEY (id_departemen) REFERENCES departemen(id_departemen) ON UPDATE CASCADE,
    FOREIGN KEY (id_bagian) REFERENCES bagian_departemen(id_bagian) ON UPDATE CASCADE,
    FOREIGN KEY (id_jabatan) REFERENCES jabatan(id_jabatan) ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO karyawan (nik, nama, alamat, jenis_kelamin, id_departemen, id_bagian, id_jabatan, no_hp, tanggal_masuk) VALUES
('K0001', 'Ahmad Fauzi',      'Cikarang, Bekasi',       'Laki-laki', 1, 1, 1, '081234560001', '2018-03-01'),
('K0002', 'Muhlison',         'Tambun, Bekasi',         'Laki-laki', 1, 2, 6, '081234560002', '2020-06-15'),
('K0003', 'Desi Ramadhani',   'Tangerang',              'Perempuan', 1, 2, 1, '081234560003', '2017-01-10'),
('K0004', 'Dewi Anggraini',   'Jakarta Timur',          'Perempuan', 1, 1, 5, '081234560004', '2019-09-05'),
('K0005', 'Yulita Sari',      'Bogor',                  'Perempuan', 4, 8, 1, '081234560005', '2016-11-20'),
('K0006', 'Rudi Hartono',     'Bekasi Timur',           'Laki-laki', 3, 3, 3, '081234560006', '2015-04-12'),
('K0007', 'Siti Aminah',      'Cibitung, Bekasi',       'Perempuan', 5, 6, 6, '081234560007', '2021-02-01'),
('K0008', 'Bambang Setiawan', 'Cikarang Barat, Bekasi', 'Laki-laki', 6, 9, 3, '081234560008', '2014-07-22'),
('K0009', 'Andi Prasetyo',    'Karawang',               'Laki-laki', 9, 11, 5, '081234560009', '2022-05-16'),
('K0010', 'Rina Marlina',     'Bekasi Selatan',         'Perempuan', 2, 14, 2, '081234560010', '2013-08-30');

-- =========================================================
-- 7. USER (akun login, fitur 7: kelola akun user/teknisi/admin)
-- =========================================================
CREATE TABLE user (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nik VARCHAR(10) NOT NULL,
    level ENUM('Admin','Teknisi','Users') NOT NULL DEFAULT 'Users',
    status ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
    FOREIGN KEY (nik) REFERENCES karyawan(nik) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- password contoh: semua "password123" di-hash bcrypt (ganti nanti lewat register/seed asli)
INSERT INTO user (username, password, nik, level, status) VALUES
('K0003', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8p1Sd0G5Kj2p8V8kM5D5X5X5X5X5X.', 'K0003', 'Admin',   'Aktif'),
('K0002', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8p1Sd0G5Kj2p8V8kM5D5X5X5X5X5X.', 'K0002', 'Teknisi', 'Aktif'),
('K0008', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8p1Sd0G5Kj2p8V8kM5D5X5X5X5X5X.', 'K0008', 'Teknisi', 'Aktif'),
('K0004', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8p1Sd0G5Kj2p8V8kM5D5X5X5X5X5X.', 'K0004', 'Teknisi', 'Aktif'),
('K0007', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8p1Sd0G5Kj2p8V8kM5D5X5X5X5X5X.', 'K0007', 'Users',   'Aktif'),
('K0010', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8p1Sd0G5Kj2p8V8kM5D5X5X5X5X5X.', 'K0010', 'Users',   'Aktif'),
('K0005', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8p1Sd0G5Kj2p8V8kM5D5X5X5X5X5X.', 'K0005', 'Users',   'Aktif'),
('K0006', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8p1Sd0G5Kj2p8V8kM5D5X5X5X5X5X.', 'K0006', 'Teknisi', 'Nonaktif');

-- =========================================================
-- 11. KATEGORI
-- =========================================================
CREATE TABLE kategori (
    id_kategori INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO kategori (id_kategori, nama_kategori) VALUES
(1, 'Hardware'), (2, 'Software'), (3, 'Jaringan'), (4, 'Mesin Produksi'), (5, 'Sistem ERP');

-- =========================================================
-- 12. SUB KATEGORI (anak dari Kategori)
-- =========================================================
CREATE TABLE sub_kategori (
    id_sub_kategori INT AUTO_INCREMENT PRIMARY KEY,
    id_kategori INT NOT NULL,
    nama_sub_kategori VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO sub_kategori (id_sub_kategori, id_kategori, nama_sub_kategori) VALUES
(1, 1, 'Kerusakan Monitor'), (2, 1, 'Kerusakan Mouse'), (3, 1, 'Kerusakan Keyboard'),
(4, 1, 'Kerusakan Printer'), (5, 2, 'Error Aplikasi'), (6, 2, 'Install Ulang Software'),
(7, 3, 'Koneksi Internet Lambat'), (8, 3, 'Wifi Tidak Terdeteksi'),
(9, 4, 'Mesin Welding Overheat'), (10, 4, 'Mesin Cutting Macet'), (11, 5, 'Login SAP Gagal');

-- =========================================================
-- 13. TEKNISI (spesialisasi kategori, fitur assignment butuh ini)
-- =========================================================
CREATE TABLE teknisi (
    id_teknisi VARCHAR(15) PRIMARY KEY,
    nik VARCHAR(10) NOT NULL UNIQUE,
    id_kategori INT NOT NULL COMMENT 'Spesialisasi kategori',
    status ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
    jumlah_tiket_ditangani INT NOT NULL DEFAULT 0 COMMENT 'auto increment saat assignment dibuat',
    FOREIGN KEY (nik) REFERENCES karyawan(nik) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori) ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO teknisi (id_teknisi, nik, id_kategori, status, jumlah_tiket_ditangani) VALUES
('TKN-0001', 'K0002', 1, 'Aktif', 3),
('TKN-0002', 'K0008', 4, 'Aktif', 1),
('TKN-0003', 'K0004', 2, 'Aktif', 1),
('TKN-0004', 'K0006', 3, 'Nonaktif', 0);

-- =========================================================
-- 14. INVENTORY (aset IT, bisa diinput sendiri oleh pemegang/users)
-- =========================================================
CREATE TABLE inventory (
    kode_asset VARCHAR(15) PRIMARY KEY,
    nama_barang VARCHAR(100) NOT NULL,
    merk_model VARCHAR(100),
    id_departemen INT NOT NULL,
    id_kategori INT NOT NULL,
    nik_pemegang VARCHAR(10),
    FOREIGN KEY (id_departemen) REFERENCES departemen(id_departemen) ON UPDATE CASCADE,
    FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori) ON UPDATE CASCADE,
    FOREIGN KEY (nik_pemegang) REFERENCES karyawan(nik) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO inventory (kode_asset, nama_barang, merk_model, id_departemen, id_kategori, nik_pemegang) VALUES
('AST-0001', 'Monitor',       'Samsung 19"',           1, 1, 'K0004'),
('AST-0002', 'Laptop',        'Lenovo ThinkPad',       1, 1, 'K0003'),
('AST-0003', 'Printer',       'Epson L3110',           5, 1, 'K0007'),
('AST-0004', 'PC Desktop',    'HP ProDesk 400',        4, 1, 'K0005'),
('AST-0005', 'Mesin Welding', 'Miller Multimatic 220', 3, 4, 'K0006'),
('AST-0006', 'Server ERP',    'Dell PowerEdge R740',   1, 5, 'K0002');

-- =========================================================
-- 3. LIST TICKET (tiket/keluhan yang masuk, kolom lampiran wajib
-- ada karena New Ticket harus upload bukti foto - lihat dokumen)
-- status di sini adalah status FINAL tiket, di-update backend saat
-- approval/assignment berubah supaya selalu sinkron
-- =========================================================
CREATE TABLE list_ticket (
    id_ticket VARCHAR(20) PRIMARY KEY,
    nik_pelapor VARCHAR(10) NOT NULL,
    id_departemen INT NOT NULL,
    id_kategori INT NOT NULL,
    id_sub_kategori INT,
    kode_asset VARCHAR(15),
    deskripsi TEXT,
    lampiran VARCHAR(255) COMMENT 'path/nama file foto lampiran',
    tanggal_lapor DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Menunggu Approval','On Process','Solved','Reject') NOT NULL DEFAULT 'Menunggu Approval',
    FOREIGN KEY (nik_pelapor) REFERENCES karyawan(nik) ON UPDATE CASCADE,
    FOREIGN KEY (id_departemen) REFERENCES departemen(id_departemen) ON UPDATE CASCADE,
    FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori) ON UPDATE CASCADE,
    FOREIGN KEY (id_sub_kategori) REFERENCES sub_kategori(id_sub_kategori) ON UPDATE CASCADE,
    FOREIGN KEY (kode_asset) REFERENCES inventory(kode_asset) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO list_ticket (id_ticket, nik_pelapor, id_departemen, id_kategori, id_sub_kategori, kode_asset, deskripsi, lampiran, tanggal_lapor, status) VALUES
('T202612020001', 'K0004', 1, 1, 1, 'AST-0001', 'Kerusakan komponen monitor, layar bergaris', 'lampiran/foto_monitor_0001.jpg', '2026-12-02 16:59:02', 'On Process'),
('T202612020002', 'K0004', 1, 1, 1, NULL,        'Kerusakan komponen monitor, tidak menyala',  'lampiran/foto_monitor_0002.jpg', '2026-12-02 16:44:45', 'Menunggu Approval'),
('T202612020003', 'K0007', 5, 1, 1, NULL,        'Layar monitor berkedip-kedip, ada garis vertikal hitam', 'lampiran/foto_monitor_0003.jpg', '2026-12-02 16:44:45', 'On Process'),
('T202612010004', 'K0005', 4, 4, 9, 'AST-0005',  'Mesin welding overheat saat digunakan',       'lampiran/foto_mesin_0004.jpg',   '2026-12-01 09:15:00', 'Solved'),
('T202611280005', 'K0010', 2, 2, 5, NULL,        'Aplikasi absensi tidak bisa dibuka',          NULL,                              '2026-11-28 08:20:00', 'Reject'),
('T202611250006', 'K0007', 5, 1, 4, 'AST-0003', 'Printer sering macet saat mencetak',          'lampiran/foto_printer_0006.jpg', '2026-11-25 10:00:00', 'Solved'),
('T202611200007', 'K0010', 2, 2, 5, NULL,        'Login aplikasi ERP gagal terus menerus',     NULL,                              '2026-11-20 13:30:00', 'Solved');

-- =========================================================
-- 4. APPROVAL TICKET (1 tiket = 1 baris approval, dibuat otomatis
-- saat New Ticket disubmit, lalu di-update saat admin approve/reject)
-- =========================================================
CREATE TABLE approval_ticket (
    id_approval INT AUTO_INCREMENT PRIMARY KEY,
    id_ticket VARCHAR(20) NOT NULL UNIQUE,
    nik_admin VARCHAR(10) COMMENT 'admin yang memvalidasi (NULL selama masih menunggu)',
    tanggal_approval DATETIME,
    status_approval ENUM('Menunggu Approval','Approve','Reject') NOT NULL DEFAULT 'Menunggu Approval',
    catatan_approval VARCHAR(255),
    FOREIGN KEY (id_ticket) REFERENCES list_ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (nik_admin) REFERENCES karyawan(nik) ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO approval_ticket (id_ticket, nik_admin, tanggal_approval, status_approval, catatan_approval) VALUES
('T202612020001', 'K0003', '2026-12-02 17:05:00', 'Approve', 'Disetujui, kerusakan hardware terkonfirmasi'),
('T202612020002', NULL,    NULL,                  'Menunggu Approval', NULL),
('T202612020003', 'K0003', '2026-12-02 16:55:00', 'Approve', 'Disetujui, prioritas normal'),
('T202612010004', 'K0003', '2026-12-01 09:20:00', 'Approve', 'Disetujui, prioritas tinggi karena mengganggu produksi'),
('T202611280005', 'K0003', '2026-11-28 08:30:00', 'Reject',  'Bukan kewenangan IT, sudah ditangani vendor eksternal'),
('T202611250006', 'K0003', '2026-11-25 10:10:00', 'Approve', 'Disetujui, perbaikan printer'),
('T202611200007', 'K0003', '2026-11-20 13:40:00', 'Approve', 'Disetujui, kendala software ERP');

-- =========================================================
-- 5. ASSIGNMENT TICKET (hanya boleh dibuat untuk tiket yang
-- approval_ticket.status_approval = 'Approve', divalidasi di backend)
-- =========================================================
CREATE TABLE assignment_ticket (
    id_assignment INT AUTO_INCREMENT PRIMARY KEY,
    id_ticket VARCHAR(20) NOT NULL UNIQUE,
    id_teknisi VARCHAR(15) NOT NULL,
    tanggal_assign DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    progress TINYINT DEFAULT 0 COMMENT '0-100 %',
    catatan_penyelesaian VARCHAR(255),
    status_pengerjaan ENUM('Menunggu Diproses','Proses','Selesai') NOT NULL DEFAULT 'Menunggu Diproses',
    tanggal_selesai DATETIME,
    FOREIGN KEY (id_ticket) REFERENCES list_ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_teknisi) REFERENCES teknisi(id_teknisi) ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO assignment_ticket (id_ticket, id_teknisi, tanggal_assign, progress, catatan_penyelesaian, status_pengerjaan, tanggal_selesai) VALUES
('T202612020001', 'TKN-0001', '2026-12-02 17:10:00', 60,  NULL, 'Proses',  NULL),
('T202612020003', 'TKN-0001', '2026-12-02 17:00:00', 30,  NULL, 'Proses',  NULL),
('T202612010004', 'TKN-0002', '2026-12-01 09:30:00', 100, 'Kipas pendingin mesin sudah diganti', 'Selesai', '2026-12-01 14:00:00'),
('T202611250006', 'TKN-0001', '2026-11-25 10:20:00', 100, 'Printer sudah dibersihkan dan cartridge diganti', 'Selesai', '2026-11-25 15:00:00'),
('T202611200007', 'TKN-0003', '2026-11-20 13:50:00', 100, 'Aplikasi ERP sudah di-install ulang, login normal', 'Selesai', '2026-11-20 16:30:00');

-- =========================================================
-- 15. LAPORAN FEEDBACK (hanya untuk tiket status 'Solved')
-- =========================================================
CREATE TABLE laporan_feedback (
    id_feedback INT AUTO_INCREMENT PRIMARY KEY,
    id_ticket VARCHAR(20) NOT NULL UNIQUE,
    nik_pelapor VARCHAR(10) NOT NULL,
    tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    feedback ENUM('Positif','Negatif') NOT NULL,
    keterangan VARCHAR(255),
    FOREIGN KEY (id_ticket) REFERENCES list_ticket(id_ticket) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (nik_pelapor) REFERENCES karyawan(nik) ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO laporan_feedback (id_ticket, nik_pelapor, tanggal, feedback, keterangan) VALUES
('T202612010004', 'K0005', '2026-12-01 14:10:00', 'Positif', 'Penanganan cepat dan tuntas, teknisi responsif'),
('T202611250006', 'K0007', '2026-11-25 15:20:00', 'Negatif', 'Diperbaiki tapi butuh waktu cukup lama'),
('T202611200007', 'K0010', '2026-11-20 16:45:00', 'Positif', 'Software sudah normal, proses cepat');

-- =========================================================
-- 2. DASHBOARD
-- Tidak dibuat sebagai tabel snapshot statis -- rawan tidak sinkron
-- (ini akar masalah kolom status yang tidak sama antara DB & web).
-- Dashboard dihitung LIVE lewat query di dashboardController.js,
-- jadi tabel ini dihapus dari schema dan diganti view ringkasan.
-- =========================================================
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM list_ticket) AS total_tiket,
    (SELECT COUNT(*) FROM karyawan) AS total_karyawan,
    (SELECT COUNT(*) FROM user WHERE status = 'Aktif') AS total_user_aktif,
    (SELECT COUNT(*) FROM teknisi WHERE status = 'Aktif') AS total_teknisi_aktif,
    (SELECT COUNT(*) FROM inventory) AS total_asset,
    (SELECT COUNT(*) FROM list_ticket WHERE status = 'Solved') AS tiket_solved,
    (SELECT COUNT(*) FROM list_ticket WHERE status = 'On Process') AS tiket_on_process,
    (SELECT COUNT(*) FROM list_ticket WHERE status = 'Menunggu Approval') AS tiket_menunggu_approval,
    (SELECT COUNT(*) FROM list_ticket WHERE status = 'Reject') AS tiket_reject,
    (SELECT COUNT(*) FROM laporan_feedback WHERE feedback = 'Positif') AS feedback_positif,
    (SELECT COUNT(*) FROM laporan_feedback WHERE feedback = 'Negatif') AS feedback_negatif;
