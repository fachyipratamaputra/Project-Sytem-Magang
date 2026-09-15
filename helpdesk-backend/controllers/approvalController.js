const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

// Fitur 4: Approval Ticket
// Saat admin approve/reject, approval_ticket DAN list_ticket.status
// di-update dalam satu transaksi, jadi status di web selalu sinkron
// dengan database.
//
// Status list_ticket setelah Approve = 'Menunggu Assignment'
// (bukan 'On Process'), supaya cocok dengan pengecekan keyword "assign"
// di frontend (list.page.ts -> getFunnelStage()), sehingga ticket
// otomatis pindah ke tab "Assignment Ticket" setelah di-approve.

exports.getApprovalList = async (req, res) => {
  try {
    const { status } = req.query; // default: tampilkan yang masih menunggu
    let sql = `
      SELECT
        at.id_approval, lt.id_ticket, k.nama AS reported,
        d.nama_departemen AS departemen, ka.nama_kategori AS kategori,
        sk.nama_sub_kategori AS sub_kategori, lt.deskripsi, lt.lampiran,
        lt.tanggal_lapor AS tanggal, at.status_approval AS status,
        at.catatan_approval, at.tanggal_approval
      FROM approval_ticket at
      JOIN list_ticket lt ON lt.id_ticket = at.id_ticket
      JOIN karyawan k ON k.nik = lt.nik_pelapor
      JOIN departemen d ON d.id_departemen = lt.id_departemen
      JOIN kategori ka ON ka.id_kategori = lt.id_kategori
      LEFT JOIN sub_kategori sk ON sk.id_sub_kategori = lt.id_sub_kategori
    `;
    const params = [];
    if (status) {
      sql += ' WHERE at.status_approval = ?';
      params.push(status);
    } else {
      sql += " WHERE at.status_approval = 'Menunggu Approval'";
    }
    sql += ' ORDER BY lt.tanggal_lapor ASC';

    const [rows] = await pool.query(sql, params);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil daftar approval: ' + err.message, 500);
  }
};

exports.processApproval = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_ticket } = req.params;
    const { keputusan, catatan } = req.body; // keputusan: 'Approve' | 'Reject'

    if (!['Approve', 'Reject'].includes(keputusan)) {
      return fail(res, "Keputusan harus 'Approve' atau 'Reject'");
    }

    const [existing] = await conn.query('SELECT * FROM approval_ticket WHERE id_ticket = ?', [id_ticket]);
    if (existing.length === 0) return fail(res, 'Data approval untuk tiket ini tidak ditemukan', 404);
    if (existing[0].status_approval !== 'Menunggu Approval') {
      return fail(res, 'Tiket ini sudah diproses sebelumnya (' + existing[0].status_approval + ')');
    }

    await conn.beginTransaction();

    await conn.query(
      `UPDATE approval_ticket
       SET status_approval = ?, nik_admin = ?, tanggal_approval = NOW(), catatan_approval = ?
       WHERE id_ticket = ?`,
      [keputusan, req.user.nik, catatan || null, id_ticket]
    );

    // Sinkronkan status di list_ticket sesuai keputusan approval
    const statusTicketBaru = keputusan === 'Approve' ? 'Menunggu Assignment' : 'Reject';
    await conn.query('UPDATE list_ticket SET status = ? WHERE id_ticket = ?', [statusTicketBaru, id_ticket]);

    await conn.commit();
    return ok(res, { id_ticket, status_approval: keputusan, status_ticket: statusTicketBaru }, 'Approval berhasil diproses');
  } catch (err) {
    await conn.rollback();
    return fail(res, 'Gagal memproses approval: ' + err.message, 500);
  } finally {
    conn.release();
  }
};

// Riwayat approval (Kepala Departemen / Admin bisa lihat histori)
exports.getRiwayatApproval = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT at.*, lt.deskripsi, k.nama AS reported
      FROM approval_ticket at
      JOIN list_ticket lt ON lt.id_ticket = at.id_ticket
      JOIN karyawan k ON k.nik = lt.nik_pelapor
      WHERE at.status_approval != 'Menunggu Approval'
      ORDER BY at.tanggal_approval DESC
    `);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil riwayat approval: ' + err.message, 500);
  }
};