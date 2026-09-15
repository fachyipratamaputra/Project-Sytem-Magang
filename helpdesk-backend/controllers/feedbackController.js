const pool = require('../config/db');
const { ok, created, fail } = require('../utils/response');

// Fitur 15: Laporan Feedback - hanya untuk tiket berstatus 'Solved'
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.id_feedback, f.id_ticket, k.nama AS reported, f.tanggal, f.feedback, f.keterangan
      FROM laporan_feedback f
      JOIN karyawan k ON k.nik = f.nik_pelapor
      ORDER BY f.tanggal DESC
    `);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil data feedback: ' + err.message, 500);
  }
};

exports.create = async (req, res) => {
  try {
    const { id_ticket, feedback, keterangan } = req.body;
    if (!id_ticket || !feedback) return fail(res, 'id_ticket dan feedback wajib diisi');

    const [ticket] = await pool.query('SELECT status, nik_pelapor FROM list_ticket WHERE id_ticket = ?', [id_ticket]);
    if (ticket.length === 0) return fail(res, 'Tiket tidak ditemukan', 404);
    if (ticket[0].status !== 'Solved') return fail(res, 'Feedback hanya bisa diberikan untuk tiket yang sudah Solved');
    if (ticket[0].nik_pelapor !== req.user.nik) return fail(res, 'Ini bukan tiket Anda', 403);

    await pool.query(
      'INSERT INTO laporan_feedback (id_ticket, nik_pelapor, tanggal, feedback, keterangan) VALUES (?, ?, NOW(), ?, ?)',
      [id_ticket, req.user.nik, feedback, keterangan || null]
    );
    return created(res, null, 'Feedback berhasil dikirim, terima kasih');
  } catch (err) {
    return fail(res, 'Gagal mengirim feedback: ' + err.message, 500);
  }
};
