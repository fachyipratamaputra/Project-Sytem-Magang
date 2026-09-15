const pool = require('../config/db');
const { ok, created, fail } = require('../utils/response');

// Factory CRUD generik untuk tabel master sederhana (tanpa relasi anak):
// dipakai untuk Jabatan (fitur 8), Departemen (fitur 9), Kategori (fitur 11)
function buildSimpleCrud(table, pk, nameField) {
  return {
    getAll: async (req, res) => {
      try {
        const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY ${pk}`);
        return ok(res, rows);
      } catch (err) {
        return fail(res, `Gagal mengambil data ${table}: ` + err.message, 500);
      }
    },
    create: async (req, res) => {
      try {
        const value = req.body[nameField];
        if (!value) return fail(res, `${nameField} wajib diisi`);
        const [result] = await pool.query(`INSERT INTO ${table} (${nameField}) VALUES (?)`, [value]);
        return created(res, { [pk]: result.insertId }, 'Berhasil ditambahkan');
      } catch (err) {
        return fail(res, 'Gagal menambah data: ' + err.message, 500);
      }
    },
    update: async (req, res) => {
      try {
        const value = req.body[nameField];
        await pool.query(`UPDATE ${table} SET ${nameField} = ? WHERE ${pk} = ?`, [value, req.params.id]);
        return ok(res, null, 'Berhasil diperbarui');
      } catch (err) {
        return fail(res, 'Gagal memperbarui data: ' + err.message, 500);
      }
    },
    remove: async (req, res) => {
      try {
        await pool.query(`DELETE FROM ${table} WHERE ${pk} = ?`, [req.params.id]);
        return ok(res, null, 'Berhasil dihapus');
      } catch (err) {
        return fail(res, 'Gagal menghapus (kemungkinan masih dipakai data lain): ' + err.message, 500);
      }
    }
  };
}

exports.jabatan = buildSimpleCrud('jabatan', 'id_jabatan', 'nama_jabatan');
exports.departemen = buildSimpleCrud('departemen', 'id_departemen', 'nama_departemen');
exports.kategori = buildSimpleCrud('kategori', 'id_kategori', 'nama_kategori');

// Fitur 10: Bagian Departemen (anak dari Departemen, perlu JOIN nama departemen)
exports.bagianDepartemen = {
  getAll: async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT b.id_bagian, b.nama_bagian, b.id_departemen, d.nama_departemen AS departemen
        FROM bagian_departemen b
        JOIN departemen d ON d.id_departemen = b.id_departemen
        ORDER BY b.id_bagian
      `);
      return ok(res, rows);
    } catch (err) {
      return fail(res, 'Gagal mengambil data bagian departemen: ' + err.message, 500);
    }
  },
  create: async (req, res) => {
    try {
      const { id_departemen, nama_bagian } = req.body;
      if (!id_departemen || !nama_bagian) return fail(res, 'id_departemen dan nama_bagian wajib diisi');
      const [result] = await pool.query(
        'INSERT INTO bagian_departemen (id_departemen, nama_bagian) VALUES (?, ?)',
        [id_departemen, nama_bagian]
      );
      return created(res, { id_bagian: result.insertId }, 'Bagian departemen berhasil ditambahkan');
    } catch (err) {
      return fail(res, 'Gagal menambah bagian departemen: ' + err.message, 500);
    }
  },
  update: async (req, res) => {
    try {
      const { id_departemen, nama_bagian } = req.body;
      await pool.query(
        'UPDATE bagian_departemen SET id_departemen = ?, nama_bagian = ? WHERE id_bagian = ?',
        [id_departemen, nama_bagian, req.params.id]
      );
      return ok(res, null, 'Bagian departemen berhasil diperbarui');
    } catch (err) {
      return fail(res, 'Gagal memperbarui bagian departemen: ' + err.message, 500);
    }
  },
  remove: async (req, res) => {
    try {
      await pool.query('DELETE FROM bagian_departemen WHERE id_bagian = ?', [req.params.id]);
      return ok(res, null, 'Bagian departemen berhasil dihapus');
    } catch (err) {
      return fail(res, 'Gagal menghapus bagian departemen: ' + err.message, 500);
    }
  }
};

// Fitur 12: Sub Kategori (anak dari Kategori)
exports.subKategori = {
  getAll: async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT sk.id_sub_kategori, sk.nama_sub_kategori, sk.id_kategori, k.nama_kategori AS kategori
        FROM sub_kategori sk
        JOIN kategori k ON k.id_kategori = sk.id_kategori
        ORDER BY sk.id_sub_kategori
      `);
      return ok(res, rows);
    } catch (err) {
      return fail(res, 'Gagal mengambil data sub kategori: ' + err.message, 500);
    }
  },
  getByKategori: async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM sub_kategori WHERE id_kategori = ?', [req.params.id_kategori]);
      return ok(res, rows);
    } catch (err) {
      return fail(res, 'Gagal mengambil sub kategori: ' + err.message, 500);
    }
  },
  create: async (req, res) => {
    try {
      const { id_kategori, nama_sub_kategori } = req.body;
      if (!id_kategori || !nama_sub_kategori) return fail(res, 'id_kategori dan nama_sub_kategori wajib diisi');
      const [result] = await pool.query(
        'INSERT INTO sub_kategori (id_kategori, nama_sub_kategori) VALUES (?, ?)',
        [id_kategori, nama_sub_kategori]
      );
      return created(res, { id_sub_kategori: result.insertId }, 'Sub kategori berhasil ditambahkan');
    } catch (err) {
      return fail(res, 'Gagal menambah sub kategori: ' + err.message, 500);
    }
  },
  update: async (req, res) => {
    try {
      const { id_kategori, nama_sub_kategori } = req.body;
      await pool.query(
        'UPDATE sub_kategori SET id_kategori = ?, nama_sub_kategori = ? WHERE id_sub_kategori = ?',
        [id_kategori, nama_sub_kategori, req.params.id]
      );
      return ok(res, null, 'Sub kategori berhasil diperbarui');
    } catch (err) {
      return fail(res, 'Gagal memperbarui sub kategori: ' + err.message, 500);
    }
  },
  remove: async (req, res) => {
    try {
      await pool.query('DELETE FROM sub_kategori WHERE id_sub_kategori = ?', [req.params.id]);
      return ok(res, null, 'Sub kategori berhasil dihapus');
    } catch (err) {
      return fail(res, 'Gagal menghapus sub kategori: ' + err.message, 500);
    }
  }
};
