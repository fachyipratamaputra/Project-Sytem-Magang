const pool = require('../config/db');

// Helper: Mencari ID Departemen, Bagian, Jabatan berdasarkan Nama
const getMasterIds = async (departemen, bagian, jabatan) => {
  let id_departemen = null, id_bagian = null, id_jabatan = null;

  if (departemen) {
    const [dept] = await pool.query('SELECT id_departemen FROM departemen WHERE nama_departemen = ?', [departemen]);
    id_departemen = dept.length > 0 ? dept[0].id_departemen : null;
  }
  if (bagian) {
    const [bag] = await pool.query('SELECT id_bagian FROM bagian_departemen WHERE nama_bagian = ?', [bagian]);
    id_bagian = bag.length > 0 ? bag[0].id_bagian : null;
  }
  if (jabatan) {
    const [jab] = await pool.query('SELECT id_jabatan FROM jabatan WHERE nama_jabatan = ?', [jabatan]);
    id_jabatan = jab.length > 0 ? jab[0].id_jabatan : null;
  }
  return { id_departemen, id_bagian, id_jabatan };
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        k.nik AS id, 
        k.nik, 
        k.nama, 
        k.alamat, 
        k.jenis_kelamin AS jenisKelamin,
        d.nama_departemen AS departemen, 
        b.nama_bagian AS bagian, 
        j.nama_jabatan AS jabatan
      FROM karyawan k
      LEFT JOIN departemen d ON d.id_departemen = k.id_departemen
      LEFT JOIN bagian_departemen b ON b.id_bagian = k.id_bagian
      LEFT JOIN jabatan j ON j.id_jabatan = k.id_jabatan
      ORDER BY k.nik
    `);
    return res.status(200).json(rows); 
  } catch (err) {
    console.error('Gagal mengambil data karyawan:', err);
    return res.status(500).json({ error: 'Gagal mengambil data: ' + err.message });
  }
};

// ==========================================
// 🔥 Endpoint baru: Ambil karyawan yang belum punya akun user
// ==========================================
exports.getAvailable = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        k.nik, 
        k.nama, 
        d.nama_departemen AS departemen
      FROM karyawan k
      LEFT JOIN departemen d ON d.id_departemen = k.id_departemen
      WHERE k.nik NOT IN (SELECT nik FROM user)  -- user tabel bernama 'user'
        AND k.nik IS NOT NULL
      ORDER BY k.nik
    `);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Gagal mengambil karyawan yang tersedia:', err);
    return res.status(500).json({ error: 'Gagal mengambil data karyawan yang tersedia: ' + err.message });
  }
};

// ==========================================
// CREATE dengan generate NIK otomatis
// ==========================================
exports.create = async (req, res) => {
  try {
    const { nama, alamat, jenisKelamin, departemen, bagian, jabatan } = req.body;

    if (!nama || !jenisKelamin || !departemen || !jabatan) {
      return res.status(400).json({ error: 'nama, jenisKelamin, departemen, jabatan wajib diisi' });
    }

    const [lastRow] = await pool.query(
      `SELECT MAX(CAST(SUBSTRING(nik, 2) AS UNSIGNED)) as max_num FROM karyawan`
    );
    let nextNumber = 1;
    if (lastRow[0].max_num) {
      nextNumber = lastRow[0].max_num + 1;
    }
    const nik = 'K' + String(nextNumber).padStart(4, '0');

    const ids = await getMasterIds(departemen, bagian, jabatan);
    if (!ids.id_departemen) return res.status(400).json({ error: 'Departemen tidak ditemukan' });
    if (!ids.id_jabatan) return res.status(400).json({ error: 'Jabatan tidak ditemukan' });

    await pool.query(
      `INSERT INTO karyawan (nik, nama, alamat, jenis_kelamin, id_departemen, id_bagian, id_jabatan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nik, nama, alamat || null, jenisKelamin, ids.id_departemen, ids.id_bagian, ids.id_jabatan]
    );
    
    return res.status(201).json({ message: 'Karyawan berhasil ditambahkan', nik: nik });
  } catch (err) {
    console.error('Gagal menambah karyawan:', err);
    return res.status(500).json({ error: 'Gagal menambah karyawan: ' + err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { nama, alamat, jenisKelamin, departemen, bagian, jabatan } = req.body;
    const idParam = req.params.id; 

    const ids = await getMasterIds(departemen, bagian, jabatan);

    await pool.query(
      `UPDATE karyawan SET nama=?, alamat=?, jenis_kelamin=?, id_departemen=?, id_bagian=?, id_jabatan=?
       WHERE nik = ?`,
      [nama, alamat, jenisKelamin, ids.id_departemen, ids.id_bagian, ids.id_jabatan, idParam]
    );
    return res.status(200).json({ message: 'Karyawan berhasil diperbarui' });
  } catch (err) {
    console.error('Gagal memperbarui karyawan:', err);
    return res.status(500).json({ error: 'Gagal memperbarui karyawan: ' + err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const idParam = req.params.id;
    await pool.query('DELETE FROM karyawan WHERE nik = ?', [idParam]);
    return res.status(200).json({ message: 'Karyawan berhasil dihapus' });
  } catch (err) {
    // 🔧 DITAMBAHKAN: console.error supaya error sebenarnya muncul di terminal
    console.error('Gagal menghapus karyawan:', err);

    // 🔧 DITAMBAHKAN: pesan khusus & jelas kalau penyebabnya foreign key
    // constraint (karyawan ini masih dipakai sebagai teknisi / punya akun user / dll)
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(400).json({
        error: 'Karyawan ini tidak bisa dihapus karena masih terhubung dengan data lain (misalnya sudah terdaftar sebagai Teknisi atau punya akun User). Hapus/lepas data terkait itu dulu.'
      });
    }

    return res.status(500).json({ error: 'Gagal menghapus karyawan: ' + err.message });
  }
};