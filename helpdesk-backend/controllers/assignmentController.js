const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

// 1. Mengambil tiket yang bisa di-assign oleh Admin
exports.getAssignableTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT lt.id_ticket, k.nama AS reported, lt.id_kategori, ka.nama_kategori AS kategori,
             sk.nama_sub_kategori AS sub_kategori, lt.kode_asset AS asset, lt.tanggal_lapor AS tanggal,
             lt.prioritas, lt.deadline
      FROM list_ticket lt
      JOIN approval_ticket at ON at.id_ticket = lt.id_ticket AND at.status_approval = 'Approve'
      JOIN karyawan k ON k.nik = lt.nik_pelapor
      JOIN kategori ka ON ka.id_kategori = lt.id_kategori
      LEFT JOIN sub_kategori sk ON sk.id_sub_kategori = lt.id_sub_kategori
      LEFT JOIN assignment_ticket asg ON asg.id_ticket = lt.id_ticket
      WHERE asg.id_ticket IS NULL
      ORDER BY lt.tanggal_lapor ASC
    `);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil tiket yang bisa di-assign: ' + err.message, 500);
  }
};

// 2. Mengambil teknisi berdasarkan kategori
exports.getTeknisiByKategori = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tk.id_teknisi, k.nama, tk.jumlah_tiket_ditangani
      FROM teknisi tk
      JOIN karyawan k ON k.nik = tk.nik
      WHERE tk.id_kategori = ?
        AND tk.status = 'Aktif'
        AND NOT EXISTS (
          SELECT 1 FROM assignment_ticket a
          WHERE a.id_teknisi = tk.id_teknisi AND a.status_pengerjaan != 'Selesai'
        )
    `, [req.params.id_kategori]);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil daftar teknisi: ' + err.message, 500);
  }
};

// 3. Proses Assign Tiket (Admin)
exports.assignTicket = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_ticket } = req.params;
    const { id_teknisi, prioritas } = req.body;

    if (!id_teknisi) return fail(res, 'id_teknisi wajib diisi');

    const [approval] = await conn.query('SELECT status_approval FROM approval_ticket WHERE id_ticket = ?', [id_ticket]);
    if (approval.length === 0 || approval[0].status_approval !== 'Approve') {
      return fail(res, 'Tiket ini belum di-approve, tidak bisa di-assign');
    }

    const [existing] = await conn.query('SELECT id_assignment FROM assignment_ticket WHERE id_ticket = ?', [id_ticket]);
    if (existing.length > 0) return fail(res, 'Tiket ini sudah pernah di-assign ke teknisi');

    const [busyCheck] = await conn.query(
      `SELECT id_assignment FROM assignment_ticket WHERE id_teknisi = ? AND status_pengerjaan != 'Selesai'`,
      [id_teknisi]
    );
    if (busyCheck.length > 0) {
      return fail(res, 'Teknisi ini sedang menangani tiket lain yang belum selesai');
    }

    // Logic Hitung Deadline
    let hoursToAdd = 6;
    if (prioritas === 'Low') hoursToAdd = 12;
    else if (prioritas === 'Urgent') hoursToAdd = 4;
    
    const deadline = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO assignment_ticket (id_ticket, id_teknisi, tanggal_assign, progress, status_pengerjaan)
       VALUES (?, ?, NOW(), 0, 'Menunggu Diproses')`,
      [id_ticket, id_teknisi]
    );

    await conn.query(
      `UPDATE list_ticket SET prioritas = ?, deadline = ?, status = 'On Process' WHERE id_ticket = ?`,
      [prioritas || 'Normal', deadline, id_ticket]
    );

    await conn.query('UPDATE teknisi SET jumlah_tiket_ditangani = jumlah_tiket_ditangani + 1 WHERE id_teknisi = ?', [id_teknisi]);

    await conn.commit();
    return ok(res, { id_ticket, id_teknisi, prioritas, deadline }, 'Tiket berhasil di-assign ke teknisi');
  } catch (err) {
    await conn.rollback();
    return fail(res, 'Gagal assign tiket: ' + err.message, 500);
  } finally {
    conn.release();
  }
};

// 4. GET Tugas Teknisi (Dashboard Teknisi) - 🔥 FIXED
exports.getMyAssignments = async (req, res) => {
  try {
    const [teknisiRow] = await pool.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [req.user.nik]);
    if (teknisiRow.length === 0) return fail(res, 'Data teknisi tidak ditemukan', 404);

    const [rows] = await pool.query(`
      SELECT asg.id_assignment, lt.id_ticket, k.nama AS nama_pelapor, ka.nama_kategori AS nama_kategori,
             sk.nama_sub_kategori AS nama_sub_kategori, lt.kode_asset AS aset, lt.lampiran, lt.deskripsi,
             lt.prioritas, lt.deadline,
             asg.tanggal_assign, asg.progress, asg.catatan_penyelesaian,
             asg.status_pengerjaan, asg.tanggal_selesai
      FROM assignment_ticket asg
      JOIN list_ticket lt ON lt.id_ticket = asg.id_ticket
      JOIN karyawan k ON k.nik = lt.nik_pelapor
      JOIN kategori ka ON ka.id_kategori = lt.id_kategori
      LEFT JOIN sub_kategori sk ON sk.id_sub_kategori = lt.id_sub_kategori
      WHERE asg.id_teknisi = ?
      ORDER BY asg.tanggal_assign DESC
    `, [teknisiRow[0].id_teknisi]);

    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil tiket assignment: ' + err.message, 500);
  }
};

// 5. GET Riwayat Teknisi - 🔥 FIXED
exports.getRiwayatTeknisi = async (req, res) => {
  try {
    const [teknisiRow] = await pool.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [req.user.nik]);
    if (teknisiRow.length === 0) return fail(res, 'Data teknisi tidak ditemukan', 404);

    const [rows] = await pool.query(`
      SELECT lt.id_ticket, k.nama AS reported, ka.nama_kategori AS kategori,
             lt.prioritas, lt.deadline,
             asg.tanggal_selesai AS tanggal_selesai, asg.progress, asg.status_pengerjaan AS status
      FROM assignment_ticket asg
      JOIN list_ticket lt ON lt.id_ticket = asg.id_ticket
      JOIN karyawan k ON k.nik = lt.nik_pelapor
      JOIN kategori ka ON ka.id_kategori = lt.id_kategori
      WHERE asg.id_teknisi = ? AND asg.status_pengerjaan = 'Selesai'
      ORDER BY asg.tanggal_selesai DESC
    `, [teknisiRow[0].id_teknisi]);

    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil riwayat tiket: ' + err.message, 500);
  }
};

// 6. Update Progress
exports.updateProgress = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_ticket } = req.params;
    const { progress, catatan_penyelesaian, status_pengerjaan } = req.body;

    const [teknisiRow] = await conn.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [req.user.nik]);
    const [asgRow] = await conn.query('SELECT * FROM assignment_ticket WHERE id_ticket = ?', [id_ticket]);
    if (asgRow.length === 0) return fail(res, 'Assignment tidak ditemukan', 404);
    if (asgRow[0].id_teknisi !== teknisiRow[0].id_teknisi) return fail(res, 'Ini bukan tiket yang ditugaskan ke Anda', 403);

    await conn.beginTransaction();

    const selesai = status_pengerjaan === 'Selesai';
    await conn.query(
      `UPDATE assignment_ticket
       SET progress = ?, catatan_penyelesaian = ?, status_pengerjaan = ?, tanggal_selesai = ?
       WHERE id_ticket = ?`,
      [progress ?? asgRow[0].progress, catatan_penyelesaian ?? asgRow[0].catatan_penyelesaian,
        status_pengerjaan || asgRow[0].status_pengerjaan, selesai ? new Date() : null, id_ticket]
    );

    if (selesai) {
      await conn.query("UPDATE list_ticket SET status = 'Solved' WHERE id_ticket = ?", [id_ticket]);
    }

    await conn.commit();
    return ok(res, null, 'Progress tiket berhasil diperbarui');
  } catch (err) {
    await conn.rollback();
    return fail(res, 'Gagal update progress: ' + err.message, 500);
  } finally {
    conn.release();
  }
};