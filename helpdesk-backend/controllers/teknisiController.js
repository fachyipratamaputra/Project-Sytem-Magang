const pool = require('../config/db');
const { ok, created, fail } = require('../utils/response');

// Fitur 13: Teknisi (data teknisi, spesialisasi kategori)
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tk.id_teknisi, k.nama, ka.nama_kategori AS kategori_spesialis,
             tk.status, tk.jumlah_tiket_ditangani
      FROM teknisi tk
      JOIN karyawan k ON k.nik = tk.nik
      JOIN kategori ka ON ka.id_kategori = tk.id_kategori
      ORDER BY tk.id_teknisi
    `);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil data teknisi: ' + err.message, 500);
  }
};

// Ambil teknisi berdasarkan kategori (Untuk halaman Assignment Ticket)
exports.getByKategori = async (req, res) => {
  try {
    const { id_kategori } = req.params;

    console.log("Mencari teknisi untuk id_kategori:", id_kategori);

    const [rows] = await pool.query(`
      SELECT tk.id_teknisi, k.nama, tk.jumlah_tiket_ditangani
      FROM teknisi tk
      JOIN karyawan k ON k.nik = tk.nik
      WHERE tk.id_kategori = ? AND tk.status = 'Aktif'
      ORDER BY tk.jumlah_tiket_ditangani ASC
    `, [id_kategori]);

    console.log("Data teknisi ditemukan:", rows);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil data teknisi berdasarkan kategori: ' + err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { nik, id_kategori } = req.body;
    if (!nik || !id_kategori) return fail(res, 'nik dan id_kategori wajib diisi');

    // 🔧 DIPERBAIKI: id_teknisi di-generate otomatis (format TKN-0001, TKN-0002, ...),
    // tidak lagi wajib dikirim dari frontend (sebelumnya selalu gagal karena
    // frontend memang tidak pernah mengirim field ini)
    const [rows] = await pool.query(
      `SELECT id_teknisi FROM teknisi ORDER BY id_teknisi DESC LIMIT 1`
    );
    let nextNumber = 1;
    if (rows.length > 0) {
      const lastNumber = parseInt(rows[0].id_teknisi.replace('TKN-', ''), 10);
      nextNumber = lastNumber + 1;
    }
    const id_teknisi = 'TKN-' + String(nextNumber).padStart(4, '0');

    await pool.query(
      `INSERT INTO teknisi (id_teknisi, nik, id_kategori, status, jumlah_tiket_ditangani) VALUES (?, ?, ?, 'Aktif', 0)`,
      [id_teknisi, nik, id_kategori]
    );
    await pool.query(`UPDATE user SET level = 'Teknisi' WHERE nik = ?`, [nik]);
    return created(res, { id_teknisi }, 'Teknisi berhasil ditambahkan');
  } catch (err) {
    return fail(res, 'Gagal menambah teknisi: ' + err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { id_kategori, status } = req.body;
    await pool.query('UPDATE teknisi SET id_kategori = ?, status = ? WHERE id_teknisi = ?', [id_kategori, status, req.params.id]);
    return ok(res, null, 'Teknisi berhasil diperbarui');
  } catch (err) {
    return fail(res, 'Gagal memperbarui teknisi: ' + err.message, 500);
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM teknisi WHERE id_teknisi = ?', [req.params.id]);
    return ok(res, null, 'Teknisi berhasil dihapus');
  } catch (err) {
    console.error('Gagal menghapus teknisi:', err);

    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return fail(res, 'Teknisi ini tidak bisa dihapus karena masih punya tiket yang di-assign ke dia (di tabel assignment_ticket). Assign ulang tiketnya ke teknisi lain dulu, atau hapus riwayat assignment-nya.', 400);
    }

    return fail(res, 'Gagal menghapus teknisi: ' + err.message, 500);
  }
};