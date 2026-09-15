const pool = require('../config/db');
const { ok, created, fail } = require('../utils/response');

// ==========================================
// Query dasar list_ticket dengan JOIN lengkap
// ==========================================
const BASE_SELECT = `
  SELECT
    lt.id_ticket, lt.nik_pelapor, k.nama AS reported,
    lt.id_departemen, d.nama_departemen AS dept,
    lt.id_kategori, ka.nama_kategori AS nama_kategori,
    lt.id_sub_kategori, sk.nama_sub_kategori AS nama_sub_kategori,
    lt.kode_asset,
    CASE WHEN inv.kode_asset IS NOT NULL THEN CONCAT(inv.kode_asset, ' - ', inv.nama_barang) ELSE NULL END AS aset,
    inv.nik_pemegang,
    lt.deskripsi, lt.lampiran, lt.tanggal_lapor AS tanggal, lt.status,
    lt.prioritas, lt.deadline,
    at.status_approval, at.catatan_approval,
    asg.id_teknisi, tk.nik AS nik_teknisi, kt.nama AS teknisi,
    asg.progress, asg.status_pengerjaan,
    asg.is_paused, asg.tanggal_selesai,
    asg.catatan_penyelesaian, asg.user_konfirmasi, asg.tanggal_konfirmasi_user,
    asg.admin_approve, asg.admin_approve_by, asg.admin_approve_at,
    ps.created_at AS tanggal_dibuat_schedule
  FROM list_ticket lt
  JOIN karyawan k ON k.nik = lt.nik_pelapor
  JOIN departemen d ON d.id_departemen = lt.id_departemen
  LEFT JOIN kategori ka ON ka.id_kategori = lt.id_kategori
  LEFT JOIN sub_kategori sk ON sk.id_sub_kategori = lt.id_sub_kategori
  LEFT JOIN inventory inv ON inv.kode_asset = lt.kode_asset
  LEFT JOIN preventive_schedule ps ON ps.id_schedule = inv.id_preventive_schedule
  LEFT JOIN approval_ticket at ON at.id_ticket = lt.id_ticket
  LEFT JOIN assignment_ticket asg ON asg.id_ticket = lt.id_ticket
  LEFT JOIN teknisi tk ON tk.id_teknisi = asg.id_teknisi
  LEFT JOIN karyawan kt ON kt.nik = tk.nik
`;

// ==========================================
// ADMIN: Ambil semua tiket
// ==========================================
exports.getAllTickets = async (req, res) => {
  try {
    const { status, id_kategori, id_departemen } = req.query;
    let sql = BASE_SELECT + ' WHERE 1=1';
    const params = [];

    if (status) { sql += ' AND lt.status = ?'; params.push(status); }
    if (id_kategori) { sql += ' AND lt.id_kategori = ?'; params.push(id_kategori); }
    if (id_departemen) { sql += ' AND lt.id_departemen = ?'; params.push(id_departemen); }
    sql += ' ORDER BY lt.tanggal_lapor DESC';

    const [rows] = await pool.query(sql, params);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil daftar tiket: ' + err.message, 500);
  }
};

// ==========================================
// ADMIN: Approve atau Reject Tiket Masuk
// 🔧 FIX: nik_admin dan tanggal_approval sekarang ikut diisi
// (sebelumnya selalu NULL karena tidak pernah di-set di query
// UPDATE approval_ticket), supaya ada audit trail siapa & kapan
// approval dilakukan -- sama seperti yang sudah ada di
// approvalController.js versi lama.
// ==========================================
exports.approveTicket = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { status_approval, catatan_approval } = req.body;
    const id_ticket = req.params.id;

    if (!['Approve', 'Reject'].includes(status_approval)) {
      return fail(res, "Status approval harus 'Approve' atau 'Reject'", 400);
    }

    const [ticketRow] = await conn.query('SELECT id_ticket FROM list_ticket WHERE id_ticket = ?', [id_ticket]);
    if (ticketRow.length === 0) {
      return fail(res, 'Tiket tidak ditemukan', 404);
    }

    const [approvalRow] = await conn.query('SELECT status_approval FROM approval_ticket WHERE id_ticket = ?', [id_ticket]);
    if (approvalRow.length === 0) {
      return fail(res, 'Data approval untuk tiket ini tidak ditemukan', 404);
    }
    if (approvalRow[0].status_approval !== 'Menunggu Approval') {
      return fail(res, 'Tiket ini sudah diproses sebelumnya (' + approvalRow[0].status_approval + ')', 400);
    }

    await conn.beginTransaction();

    await conn.query(
      `UPDATE approval_ticket
       SET status_approval = ?, nik_admin = ?, tanggal_approval = NOW(), catatan_approval = ?
       WHERE id_ticket = ?`,
      [status_approval, req.user.nik, catatan_approval || null, id_ticket]
    );

    const newStatus = status_approval === 'Approve' ? 'Menunggu Assign' : 'Rejected';
    await conn.query(
      `UPDATE list_ticket SET status = ? WHERE id_ticket = ?`,
      [newStatus, id_ticket]
    );

    await conn.commit();
    return ok(res, null, `Tiket berhasil di-${status_approval.toLowerCase()}`);
  } catch (err) {
    await conn.rollback();
    return fail(res, 'Gagal memproses approval tiket: ' + err.message, 500);
  } finally {
    conn.release();
  }
};

// ==========================================
// SEMUA ROLE: Detail tiket
// ==========================================
exports.getTicketById = async (req, res) => {
  try {
    const [rows] = await pool.query(BASE_SELECT + ' WHERE lt.id_ticket = ?', [req.params.id]);
    if (rows.length === 0) return fail(res, 'Tiket tidak ditemukan', 404);
    return ok(res, rows[0]);
  } catch (err) {
    return fail(res, 'Gagal mengambil detail tiket: ' + err.message, 500);
  }
};

// ==========================================
// USERS: My Ticket
// ==========================================
exports.getMyTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(
      BASE_SELECT + ' WHERE (lt.nik_pelapor = ? OR inv.nik_pemegang = ?) ORDER BY lt.tanggal_lapor DESC',
      [req.user.nik, req.user.nik]
    );
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil tiket saya: ' + err.message, 500);
  }
};

// ==========================================
// USERS: New Ticket (Dengan Prioritas & Deadline NULL)
// ==========================================
exports.createTicket = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_kategori, id_sub_kategori, kode_asset, deskripsi, prioritas } = req.body;

    if (!id_kategori || !deskripsi || !prioritas) {
      return fail(res, 'Kategori, deskripsi, dan prioritas wajib diisi');
    }

    const [karyawanRow] = await conn.query(
      'SELECT id_departemen FROM karyawan WHERE nik = ?',
      [req.user.nik]
    );
    if (karyawanRow.length === 0) {
      return fail(res, 'Data karyawan untuk akun ini tidak ditemukan', 404);
    }
    const id_departemen = karyawanRow[0].id_departemen;

    const idTicket = 'T' + Date.now();
    const lampiran = req.file ? `/uploads/lampiran/${req.file.filename}` : null;

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO list_ticket (id_ticket, nik_pelapor, id_departemen, id_kategori, id_sub_kategori, kode_asset, deskripsi, lampiran, tanggal_lapor, status, prioritas, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Menunggu Approval', ?, NULL)`,
      [idTicket, req.user.nik, id_departemen, id_kategori, id_sub_kategori || null, kode_asset || null, deskripsi, lampiran, prioritas]
    );

    await conn.query(
      `INSERT INTO approval_ticket (id_ticket, status_approval) VALUES (?, 'Menunggu Approval')`,
      [idTicket]
    );

    await conn.commit();
    return created(res, { id_ticket: idTicket }, 'Tiket berhasil disubmit, menunggu approval admin');
  } catch (err) {
    await conn.rollback();
    return fail(res, 'Gagal membuat tiket: ' + err.message, 500);
  } finally {
    conn.release();
  }
};

// ==========================================
// ADMIN: Assign Tiket + Hitung Deadline (SLA)
// ==========================================
exports.assignTicket = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_ticket } = req.params;
    const { id_teknisi } = req.body;

    if (!id_teknisi) return fail(res, 'id_teknisi wajib diisi');

    const [approvalRow] = await conn.query(
      'SELECT status_approval FROM approval_ticket WHERE id_ticket = ?',
      [id_ticket]
    );
    if (approvalRow.length === 0 || approvalRow[0].status_approval !== 'Approve') {
      return fail(res, 'Tiket belum disetujui, tidak bisa di-assign', 400);
    }

    const [ticketRow] = await conn.query(
      'SELECT prioritas FROM list_ticket WHERE id_ticket = ?',
      [id_ticket]
    );
    if (ticketRow.length === 0) return fail(res, 'Tiket tidak ditemukan', 404);

    const prioritas = ticketRow[0].prioritas || 'Normal';

    let hoursToAdd = 6;
    if (prioritas === 'Low') hoursToAdd = 12;
    else if (prioritas === 'Urgent') hoursToAdd = 4;

    const deadline = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO assignment_ticket (id_ticket, id_teknisi, tanggal_assign, status_pengerjaan)
       VALUES (?, ?, NOW(), 'Menunggu Diproses')`,
      [id_ticket, id_teknisi]
    );

    await conn.query(
      `UPDATE list_ticket SET deadline = ?, status = 'Belum Diproses Teknisi' WHERE id_ticket = ?`,
      [deadline, id_ticket]
    );

    await conn.commit();
    return ok(res, null, 'Tiket berhasil di-assign dan deadline telah ditentukan');
  } catch (err) {
    await conn.rollback();
    return fail(res, 'Gagal assign tiket: ' + err.message, 500);
  } finally {
    conn.release();
  }
};

// ==========================================
// ADMIN: Hapus Tiket
// ==========================================
exports.deleteTicket = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const [ticketRow] = await conn.query('SELECT id_ticket FROM list_ticket WHERE id_ticket = ?', [id]);
    if (ticketRow.length === 0) return fail(res, 'Tiket tidak ditemukan', 404);

    await conn.beginTransaction();
    await conn.query('DELETE FROM assignment_ticket WHERE id_ticket = ?', [id]);
    await conn.query('DELETE FROM approval_ticket WHERE id_ticket = ?', [id]);
    await conn.query('DELETE FROM list_ticket WHERE id_ticket = ?', [id]);
    await conn.commit();
    return ok(res, null, 'Tiket berhasil dihapus');
  } catch (err) {
    await conn.rollback();
    return fail(res, 'Gagal menghapus tiket: ' + err.message, 500);
  } finally {
    conn.release();
  }
};

// ==========================================
// TEKNISI: Ambil tiket yang di-assign ke saya (Belum Selesai)
// ==========================================
exports.getAssignedToMe = async (req, res) => {
  try {
    const [teknisiRow] = await pool.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [req.user.nik]);
    if (teknisiRow.length === 0) return fail(res, 'Anda tidak terdaftar sebagai teknisi', 403);
    const id_teknisi = teknisiRow[0].id_teknisi;

    const [rows] = await pool.query(`
      SELECT
        asg.id_assignment,
        asg.progress,
        asg.status_pengerjaan,
        asg.is_paused,
        asg.tanggal_assign,
        asg.tanggal_selesai,
        asg.catatan_penyelesaian,
        asg.user_konfirmasi, asg.tanggal_konfirmasi_user,
        asg.admin_approve, asg.admin_approve_by, asg.admin_approve_at,
        lt.id_ticket,
        lt.deskripsi,
        lt.lampiran,
        lt.kode_asset,
        lt.deadline,
        lt.prioritas,
        d.nama_departemen AS departemen,
        CASE WHEN inv.kode_asset IS NOT NULL THEN CONCAT(inv.kode_asset, ' - ', inv.nama_barang) ELSE NULL END AS aset,
        k.nama AS nama_pelapor,
        ka.nama_kategori AS nama_kategori,
        sk.nama_sub_kategori AS nama_sub_kategori,
        ps.created_at AS tanggal_dibuat_schedule
      FROM assignment_ticket asg
      JOIN list_ticket lt ON asg.id_ticket = lt.id_ticket
      JOIN karyawan k ON lt.nik_pelapor = k.nik
      LEFT JOIN departemen d ON d.id_departemen = lt.id_departemen
      LEFT JOIN kategori ka ON lt.id_kategori = ka.id_kategori
      LEFT JOIN sub_kategori sk ON lt.id_sub_kategori = sk.id_sub_kategori
      LEFT JOIN inventory inv ON lt.kode_asset = inv.kode_asset
      LEFT JOIN preventive_schedule ps ON ps.id_schedule = inv.id_preventive_schedule
      WHERE asg.id_teknisi = ?
        AND asg.status_pengerjaan != 'Selesai'
      ORDER BY asg.tanggal_assign DESC
    `, [id_teknisi]);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil tiket yang ditugaskan: ' + err.message, 500);
  }
};

// ==========================================
// TEKNISI: Ambil riwayat tiket yang sudah Selesai
// ==========================================
exports.getRiwayatMe = async (req, res) => {
  try {
    const [teknisiRow] = await pool.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [req.user.nik]);
    if (teknisiRow.length === 0) return fail(res, 'Anda tidak terdaftar sebagai teknisi', 403);
    const id_teknisi = teknisiRow[0].id_teknisi;

    const [rows] = await pool.query(`
      SELECT
        asg.id_assignment,
        asg.progress,
        asg.status_pengerjaan,
        asg.tanggal_assign,
        asg.tanggal_selesai,
        asg.catatan_penyelesaian,
        asg.user_konfirmasi, asg.tanggal_konfirmasi_user,
        asg.admin_approve, asg.admin_approve_by, asg.admin_approve_at,
        lt.id_ticket,
        lt.deskripsi,
        lt.lampiran,
        lt.kode_asset,
        d.nama_departemen AS departemen,
        k.nama AS nama_pelapor,
        ka.nama_kategori AS nama_kategori,
        ps.created_at AS tanggal_dibuat_schedule
      FROM assignment_ticket asg
      JOIN list_ticket lt ON asg.id_ticket = lt.id_ticket
      JOIN karyawan k ON lt.nik_pelapor = k.nik
      LEFT JOIN departemen d ON d.id_departemen = lt.id_departemen
      LEFT JOIN kategori ka ON lt.id_kategori = ka.id_kategori
      LEFT JOIN inventory inv ON lt.kode_asset = inv.kode_asset
      LEFT JOIN preventive_schedule ps ON ps.id_schedule = inv.id_preventive_schedule
      WHERE asg.id_teknisi = ?
        AND asg.status_pengerjaan = 'Selesai'
      ORDER BY asg.tanggal_selesai DESC
    `, [id_teknisi]);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil riwayat tiket: ' + err.message, 500);
  }
};

// ==========================================
// SEMUA ROLE: Ambil Histori Progres
// ==========================================
exports.getProgressHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role ? req.user.role.toLowerCase() : '';
    const userNik = req.user.nik;

    const [ticketRows] = await pool.query(
      `SELECT lt.nik_pelapor, asg.id_assignment
       FROM list_ticket lt
       LEFT JOIN assignment_ticket asg ON lt.id_ticket = asg.id_ticket
       WHERE lt.id_ticket = ?`,
      [id]
    );

    if (ticketRows.length === 0) {
      return fail(res, 'Tiket tidak ditemukan', 404);
    }

    const ticket = ticketRows[0];

    if (userRole === 'users' || userRole === 'user') {
      if (ticket.nik_pelapor !== userNik) {
        return fail(res, 'Anda tidak berhak melihat riwayat tiket ini', 403);
      }
    } else if (userRole === 'teknisi') {
      const [teknisiRow] = await pool.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [userNik]);
      if (teknisiRow.length === 0) return fail(res, 'Anda tidak terdaftar sebagai teknisi', 403);

      const [assignmentCheck] = await pool.query(
        `SELECT id_assignment FROM assignment_ticket WHERE id_ticket = ? AND id_teknisi = ?`,
        [id, teknisiRow[0].id_teknisi]
      );
      if (assignmentCheck.length === 0) {
        return fail(res, 'Tiket ini bukan tugas Anda', 404);
      }
    }

    if (!ticket.id_assignment) {
      return ok(res, [], 'Belum ada riwayat progres karena tiket belum di-assign');
    }

    const [history] = await pool.query(
      `SELECT * FROM ticket_progress_log WHERE id_assignment = ? ORDER BY created_at DESC`,
      [ticket.id_assignment]
    );

    return ok(res, history);
  } catch (err) {
    return fail(res, 'Gagal mengambil histori progres: ' + err.message, 500);
  }
};

// ==========================================
// TEKNISI: Toggle Pause / Resume Timer
// ==========================================
exports.togglePause = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const id_ticket = req.params.id;
    const { progress, catatan_penyelesaian, status_pengerjaan } = req.body;

    const [teknisiRow] = await conn.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [req.user.nik]);
    if (teknisiRow.length === 0) {
      await conn.rollback();
      return fail(res, 'Anda tidak terdaftar sebagai teknisi', 403);
    }
    const id_teknisi = teknisiRow[0].id_teknisi;

    const [assignment] = await conn.query(
      `SELECT id_assignment, is_paused, progress, paused_at FROM assignment_ticket WHERE id_ticket = ? AND id_teknisi = ?`,
      [id_ticket, id_teknisi]
    );

    if (assignment.length === 0) {
      await conn.rollback();
      return fail(res, 'Assignment tiket tidak ditemukan atau bukan tugas Anda', 404);
    }

    const id_assignment = assignment[0].id_assignment;
    const currentPaused = assignment[0].is_paused;
    const newPausedStatus = currentPaused ? 0 : 1;
    const currentProgress = progress !== undefined ? progress : assignment[0].progress;
    const finalStatusPengerjaan = status_pengerjaan || 'Proses';

    if (newPausedStatus === 1) {
      await conn.query(
        `UPDATE assignment_ticket
         SET is_paused = 1, paused_at = NOW(), progress = ?, catatan_penyelesaian = ?
         WHERE id_assignment = ?`,
        [currentProgress, catatan_penyelesaian || null, id_assignment]
      );
    } else {
      const pausedAt = assignment[0].paused_at;
      if (pausedAt) {
        const pausedSeconds = Math.max(0, Math.floor((Date.now() - new Date(pausedAt).getTime()) / 1000));
        await conn.query(
          `UPDATE list_ticket SET deadline = DATE_ADD(deadline, INTERVAL ? SECOND) WHERE id_ticket = ?`,
          [pausedSeconds, id_ticket]
        );
      }
      await conn.query(
        `UPDATE assignment_ticket
         SET is_paused = 0, paused_at = NULL, progress = ?, catatan_penyelesaian = ?
         WHERE id_assignment = ?`,
        [currentProgress, catatan_penyelesaian || null, id_assignment]
      );
    }

    const logCatatan = catatan_penyelesaian || (newPausedStatus ? 'Tiket Dijeda' : 'Tiket Dilanjutkan');
    await conn.query(
      `INSERT INTO ticket_progress_log (id_assignment, progress, catatan, status_pengerjaan)
       VALUES (?, ?, ?, ?)`,
      [id_assignment, currentProgress, logCatatan, finalStatusPengerjaan]
    );

    await conn.commit();
    return ok(res, { is_paused: newPausedStatus === 1 }, 'Status pause dan progress berhasil diperbarui');
  } catch (error) {
    await conn.rollback();
    console.error('Error toggle pause:', error);
    return fail(res, 'Terjadi kesalahan pada server: ' + error.message, 500);
  } finally {
    conn.release();
  }
};

// ============================================================
// TEKNISI: Update Progres + Simpan ke Histori + Update Inventory
// 🔧 FIX: status list_ticket saat sedang dikerjakan diubah dari
// 'On Process' menjadi 'Sedang Dikerjakan', supaya konsisten
// dengan label tab di frontend dan tidak tumpang tindih makna
// dengan status lama 'On Process' (bekas bug approval).
// ============================================================
exports.updateProgress = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { progress, catatan_penyelesaian, status_pengerjaan } = req.body;
    const id_ticket = req.params.id;

    const [teknisiRow] = await conn.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [req.user.nik]);
    if (teknisiRow.length === 0) {
      await conn.rollback();
      return fail(res, 'Anda tidak terdaftar sebagai teknisi', 403);
    }
    const id_teknisi = teknisiRow[0].id_teknisi;

    const [assignment] = await conn.query(
      `SELECT id_assignment, is_paused FROM assignment_ticket WHERE id_ticket = ? AND id_teknisi = ?`,
      [id_ticket, id_teknisi]
    );
    if (assignment.length === 0) {
      await conn.rollback();
      return fail(res, 'Tiket ini bukan tugas Anda', 404);
    }

    const id_assignment = assignment[0].id_assignment;
    const isPaused = assignment[0].is_paused;

    if (isPaused && status_pengerjaan !== 'Selesai') {
      await conn.rollback();
      return fail(res, 'Tiket sedang di-pause. Lanjutkan terlebih dahulu untuk update progres.', 400);
    }

    await conn.query(
      `INSERT INTO ticket_progress_log (id_assignment, progress, catatan, status_pengerjaan)
       VALUES (?, ?, ?, ?)`,
      [id_assignment, progress, catatan_penyelesaian || null, status_pengerjaan]
    );

    await conn.query(
      `UPDATE assignment_ticket
       SET progress = ?,
           catatan_penyelesaian = ?,
           status_pengerjaan = ?,
           tanggal_selesai = CASE WHEN ? = 'Selesai' THEN NOW() ELSE NULL END
       WHERE id_assignment = ?`,
      [progress, catatan_penyelesaian || null, status_pengerjaan, status_pengerjaan, id_assignment]
    );

    if (status_pengerjaan === 'Selesai') {
      await conn.query('UPDATE list_ticket SET status = ? WHERE id_ticket = ?', ['Solved', id_ticket]);

      const [ticketInfo] = await conn.query(`
        SELECT kode_asset, deskripsi FROM list_ticket WHERE id_ticket = ?
      `, [id_ticket]);

      if (ticketInfo.length > 0 && ticketInfo[0].kode_asset) {
        const isPreventive = ticketInfo[0].deskripsi && ticketInfo[0].deskripsi.includes('[PREVENTIVE]');
        if (isPreventive) {
          await conn.query(`
            UPDATE inventory 
            SET last_maintenance = CURDATE() 
            WHERE kode_asset = ?
          `, [ticketInfo[0].kode_asset]);

          console.log(`✅ Inventory updated: last_maintenance = ${new Date().toISOString().split('T')[0]} for asset ${ticketInfo[0].kode_asset}`);
        }
      }
    } else {
      await conn.query('UPDATE list_ticket SET status = ? WHERE id_ticket = ?', ['Sedang Dikerjakan', id_ticket]);
    }

    await conn.commit();
    return ok(res, null, 'Progress berhasil disimpan dan dicatat ke histori');
  } catch (err) {
    await conn.rollback();
    return fail(res, 'Gagal memperbarui progres: ' + err.message, 500);
  } finally {
    conn.release();
  }
};

// ==========================================
// TEKNISI: Request Return Tiket ke Admin
// ==========================================
exports.requestReturnTicket = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { return_reason } = req.body;
    const id_ticket = req.params.id;

    if (!return_reason || return_reason.trim() === '') {
      return fail(res, 'Alasan pengembalian wajib diisi', 400);
    }

    const [teknisiRow] = await conn.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [req.user.nik]);
    if (teknisiRow.length === 0) {
      return fail(res, 'Anda tidak terdaftar sebagai teknisi', 403);
    }
    const id_teknisi = teknisiRow[0].id_teknisi;

    const [assignment] = await conn.query(
      `SELECT id_assignment, return_status FROM assignment_ticket WHERE id_ticket = ? AND id_teknisi = ?`,
      [id_ticket, id_teknisi]
    );
    if (assignment.length === 0) {
      return fail(res, 'Tiket ini bukan tugas Anda', 404);
    }

    if (assignment[0].return_status === 'Pending') {
      return fail(res, 'Tiket ini sudah dalam proses pengembalian', 400);
    }

    await conn.beginTransaction();
    await conn.query(
      `UPDATE assignment_ticket SET return_reason = ?, return_status = 'Pending' WHERE id_assignment = ?`,
      [return_reason, assignment[0].id_assignment]
    );
    await conn.commit();

    return ok(res, null, 'Permintaan pengembalian telah dikirim ke Admin');
  } catch (err) {
    await conn.rollback();
    return fail(res, 'Gagal mengirim permintaan pengembalian: ' + err.message, 500);
  } finally {
    conn.release();
  }
};

// ==========================================
// ADMIN: Ambil list tiket yang dikembalikan (Pending)
// ==========================================
exports.getReturnedTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        lt.id_ticket, lt.nik_pelapor, k.nama AS reported,
        lt.id_departemen, d.nama_departemen AS dept,
        lt.id_kategori, ka.nama_kategori AS kategori,
        lt.id_sub_kategori, sk.nama_sub_kategori AS sub_kategori,
        lt.kode_asset, lt.deskripsi, lt.lampiran, lt.tanggal_lapor AS tanggal,
        lt.prioritas, asg.return_reason, asg.return_status,
        tk.id_teknisi, kt.nama AS teknisi_nama
      FROM list_ticket lt
      JOIN karyawan k ON k.nik = lt.nik_pelapor
      JOIN departemen d ON d.id_departemen = lt.id_departemen
      LEFT JOIN kategori ka ON ka.id_kategori = lt.id_kategori
      LEFT JOIN sub_kategori sk ON sk.id_sub_kategori = lt.id_sub_kategori
      LEFT JOIN approval_ticket at ON at.id_ticket = lt.id_ticket
      LEFT JOIN assignment_ticket asg ON asg.id_ticket = lt.id_ticket
      LEFT JOIN teknisi tk ON tk.id_teknisi = asg.id_teknisi
      LEFT JOIN karyawan kt ON kt.nik = tk.nik
      WHERE asg.return_status = 'Pending'
      ORDER BY lt.tanggal_lapor DESC
    `);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil tiket yang dikembalikan: ' + err.message, 500);
  }
};

// ==========================================
// ADMIN: Review Return (Approve / Reject)
// 🔧 FIX: status 'On Process' pada branch Reject diganti menjadi
// 'Sedang Dikerjakan', konsisten dengan updateProgress di atas.
// ==========================================
exports.reviewReturnTicket = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { action } = req.body;
    const id_ticket = req.params.id;

    if (!['Approve', 'Reject'].includes(action)) {
      return fail(res, "Action harus 'Approve' atau 'Reject'", 400);
    }

    const [assignment] = await conn.query(
      `SELECT id_assignment, id_teknisi, return_status FROM assignment_ticket WHERE id_ticket = ?`,
      [id_ticket]
    );
    if (assignment.length === 0 || assignment[0].return_status !== 'Pending') {
      return fail(res, 'Tiket tidak ditemukan atau tidak dalam status pengembalian', 404);
    }

    await conn.beginTransaction();

    if (action === 'Approve') {
      await conn.query('DELETE FROM assignment_ticket WHERE id_ticket = ?', [id_ticket]);
      await conn.query(`UPDATE list_ticket SET status = 'Menunggu Assign', deadline = NULL WHERE id_ticket = ?`, [id_ticket]);
    } else {
      await conn.query(`UPDATE assignment_ticket SET return_status = 'None', return_reason = NULL WHERE id_ticket = ?`, [id_ticket]);
      await conn.query(`UPDATE list_ticket SET status = 'Sedang Dikerjakan' WHERE id_ticket = ?`, [id_ticket]);
    }

    await conn.commit();
    return ok(res, null, action === 'Approve' ? 'Pengembalian disetujui, tiket siap di-assign ulang' : 'Pengembalian ditolak, tiket kembali ke teknisi');
  } catch (err) {
    await conn.rollback();
    return fail(res, 'Gagal memproses pengembalian: ' + err.message, 500);
  } finally {
    conn.release();
  }
};

// ============================================================
// USER: Konfirmasi/Approve hasil perbaikan teknisi
// ============================================================
exports.confirmByUser = async (req, res) => {
  try {
    const { idTicket } = req.params;
    const nikUser = req.user?.nik;

    const [rows] = await pool.query(`
      SELECT asg.id_assignment, asg.status_pengerjaan, asg.user_konfirmasi,
             lt.nik_pelapor, lt.deskripsi, lt.kode_asset, inv.nik_pemegang
      FROM assignment_ticket asg
      JOIN list_ticket lt ON lt.id_ticket = asg.id_ticket
      LEFT JOIN inventory inv ON inv.kode_asset = lt.kode_asset
      WHERE asg.id_ticket = ?
      ORDER BY asg.tanggal_assign DESC
      LIMIT 1
    `, [idTicket]);

    if (rows.length === 0) {
      return fail(res, 'Ticket / assignment tidak ditemukan', 404);
    }

    const assignment = rows[0];

    if (assignment.status_pengerjaan !== 'Selesai') {
      return fail(res, 'Ticket belum selesai dikerjakan teknisi, belum bisa dikonfirmasi', 400);
    }

    if (assignment.user_konfirmasi === 1) {
      return fail(res, 'Ticket ini sudah pernah dikonfirmasi', 400);
    }

    const isAuthorized =
      !!nikUser &&
      (nikUser === assignment.nik_pelapor || nikUser === assignment.nik_pemegang);

    if (!isAuthorized) {
      return fail(res, 'Anda tidak berhak melakukan konfirmasi untuk tiket ini', 403);
    }

    await pool.query(`
      UPDATE assignment_ticket
      SET user_konfirmasi = 1, tanggal_konfirmasi_user = NOW()
      WHERE id_assignment = ?
    `, [assignment.id_assignment]);

    return ok(res, null, 'Konfirmasi berhasil, terima kasih!');
  } catch (error) {
    console.error('confirmByUser error:', error);
    return fail(res, 'Gagal melakukan konfirmasi: ' + error.message, 500);
  }
};

// ============================================================
// ADMIN: Approve checklist hasil pekerjaan teknisi (final sign-off)
// ⚠️ CATATAN: endpoint ini sudah tidak dipanggil lagi dari
// frontend. Dibiarkan ada untuk jaga-jaga.
// ============================================================
exports.adminApproveTicket = async (req, res) => {
  try {
    const { idTicket } = req.params;
    const adminNama = req.user?.nama || req.user?.username || 'Admin';

    const [rows] = await pool.query(
      `SELECT id_assignment, status_pengerjaan, admin_approve
       FROM assignment_ticket WHERE id_ticket = ? ORDER BY tanggal_assign DESC LIMIT 1`,
      [idTicket]
    );

    if (rows.length === 0) {
      return fail(res, 'Assignment tiket tidak ditemukan', 404);
    }

    const assignment = rows[0];

    if (assignment.status_pengerjaan !== 'Selesai') {
      return fail(res, 'Tiket belum selesai dikerjakan teknisi, belum bisa disetujui', 400);
    }

    if (assignment.admin_approve === 1) {
      return fail(res, 'Tiket ini sudah pernah disetujui Admin', 400);
    }

    await pool.query(
      `UPDATE assignment_ticket
       SET admin_approve = 1, admin_approve_by = ?, admin_approve_at = NOW()
       WHERE id_assignment = ?`,
      [adminNama, assignment.id_assignment]
    );

    return ok(res, null, 'Checklist berhasil disetujui Admin');
  } catch (err) {
    console.error('adminApproveTicket error:', err);
    return fail(res, 'Gagal menyetujui checklist: ' + err.message, 500);
  }
};