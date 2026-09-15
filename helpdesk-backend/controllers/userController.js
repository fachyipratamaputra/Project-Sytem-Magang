const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { ok, created, fail } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id_user, u.username, u.level, u.status, k.nik, k.nama, d.nama_departemen AS departemen
      FROM user u
      JOIN karyawan k ON k.nik = u.nik
      JOIN departemen d ON d.id_departemen = k.id_departemen
      ORDER BY u.id_user
    `);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil data user: ' + err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { username, password, nik, level } = req.body;
    if (!username || !password || !nik || !level) return fail(res, 'Semua field wajib diisi');

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO user (username, password, nik, level, status) VALUES (?, ?, ?, ?, "Aktif")',
      [username, hashed, nik, level]
    );
    return created(res, { id_user: result.insertId }, 'User berhasil ditambahkan');
  } catch (err) {
    return fail(res, 'Gagal menambah user: ' + err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { level, status } = req.body;
    await pool.query('UPDATE user SET level = ?, status = ? WHERE id_user = ?', [level, status, req.params.id]);
    return ok(res, null, 'User berhasil diperbarui');
  } catch (err) {
    return fail(res, 'Gagal memperbarui user: ' + err.message, 500);
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM user WHERE id_user = ?', [req.params.id]);
    return ok(res, null, 'User berhasil dihapus');
  } catch (err) {
    return fail(res, 'Gagal menghapus user: ' + err.message, 500);
  }
};