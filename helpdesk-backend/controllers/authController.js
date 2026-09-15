const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { ok, fail } = require('../utils/response');
require('dotenv').config();

// Fitur 1: Login (Admin, Teknisi, Users pakai endpoint yang sama)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return fail(res, 'Username dan password wajib diisi');

    const [rows] = await pool.query(
      `SELECT u.id_user, u.username, u.password, u.level, u.status,
              k.nik, k.nama, k.id_departemen, d.nama_departemen
       FROM user u
       JOIN karyawan k ON k.nik = u.nik
       LEFT JOIN departemen d ON d.id_departemen = k.id_departemen
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length === 0) return fail(res, 'Username atau password salah', 401);
    const user = rows[0];

    if (user.status === 'Nonaktif') return fail(res, 'Akun Anda nonaktif, hubungi admin', 403);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return fail(res, 'Username atau password salah', 401);

    const token = jwt.sign(
      { id_user: user.id_user, nik: user.nik, username: user.username, level: user.level },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return ok(res, {
      token,
      user: {
        nik: user.nik,
        nama: user.nama,
        username: user.username,
        level: user.level,
        departemen: user.nama_departemen
      }
    }, 'Login berhasil');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal login: ' + err.message, 500);
  }
};

// Ganti password akun sendiri
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const [rows] = await pool.query('SELECT * FROM user WHERE id_user = ?', [req.user.id_user]);
    if (rows.length === 0) return fail(res, 'User tidak ditemukan', 404);

    const match = await bcrypt.compare(old_password, rows[0].password);
    if (!match) return fail(res, 'Password lama salah', 401);

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE user SET password = ? WHERE id_user = ?', [hashed, req.user.id_user]);
    return ok(res, null, 'Password berhasil diubah');
  } catch (err) {
    return fail(res, 'Gagal mengubah password: ' + err.message, 500);
  }
};
