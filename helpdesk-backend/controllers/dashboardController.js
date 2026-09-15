const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

// Fitur 2: Dashboard Admin - dihitung LIVE dari data asli (bukan tabel snapshot),
// supaya tidak ada lagi kasus status di dashboard beda dengan status sebenarnya.
exports.getAdminDashboard = async (req, res) => {
  try {
    const [[summary]] = await pool.query('SELECT * FROM v_dashboard_summary');

    const [tiketBulanan] = await pool.query(`
      SELECT DATE_FORMAT(tanggal_lapor, '%Y-%m') AS bulan, COUNT(*) AS jumlah
      FROM list_ticket
      GROUP BY bulan ORDER BY bulan ASC
      LIMIT 12
    `);

    const [aktivitasTerbaru] = await pool.query(`
      SELECT lt.id_ticket, k.nama AS reported, lt.status, lt.tanggal_lapor
      FROM list_ticket lt
      JOIN karyawan k ON k.nik = lt.nik_pelapor
      ORDER BY lt.tanggal_lapor DESC
      LIMIT 10
    `);

    return ok(res, { summary, tiketBulanan, aktivitasTerbaru });
  } catch (err) {
    return fail(res, 'Gagal mengambil data dashboard: ' + err.message, 500);
  }
};

// Fitur 2 (Teknisi): ringkasan tiket yang ditugaskan ke teknisi login
exports.getTeknisiDashboard = async (req, res) => {
  try {
    const [teknisiRow] = await pool.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [req.user.nik]);
    if (teknisiRow.length === 0) return fail(res, 'Data teknisi tidak ditemukan', 404);
    const idTeknisi = teknisiRow[0].id_teknisi;

    const [[summary]] = await pool.query(`
      SELECT
        COUNT(*) AS total_ditugaskan,
        SUM(status_pengerjaan = 'Menunggu Diproses') AS menunggu_diproses,
        SUM(status_pengerjaan = 'Proses') AS proses,
        SUM(status_pengerjaan = 'Selesai') AS selesai
      FROM assignment_ticket WHERE id_teknisi = ?
    `, [idTeknisi]);

    return ok(res, summary);
  } catch (err) {
    return fail(res, 'Gagal mengambil dashboard teknisi: ' + err.message, 500);
  }
};

// Fitur 2 (Users): ringkasan tiket milik user login
exports.getUserDashboard = async (req, res) => {
  try {
    const [[summary]] = await pool.query(`
      SELECT
        COUNT(*) AS total_tiket,
        SUM(status = 'Menunggu Approval') AS menunggu_approval,
        SUM(status = 'On Process') AS on_process,
        SUM(status = 'Solved') AS solved,
        SUM(status = 'Reject') AS reject
      FROM list_ticket WHERE nik_pelapor = ?
    `, [req.user.nik]);

    return ok(res, summary);
  } catch (err) {
    return fail(res, 'Gagal mengambil dashboard user: ' + err.message, 500);
  }
};
