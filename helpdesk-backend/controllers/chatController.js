const pool = require('../config/db');
const { ok, created, fail } = require('../utils/response');

// Ambil info nama + id_teknisi (kalau dia teknisi) berdasarkan nik.
// Dibutuhkan karena token JWT cuma nyimpen { id_user, nik, username, level },
// TIDAK nyimpen nama atau id_teknisi langsung.
async function getSenderInfo(nik) {
  const [karyawanRows] = await pool.query('SELECT nama FROM karyawan WHERE nik = ?', [nik]);
  const [teknisiRows] = await pool.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [nik]);
  return {
    nama: karyawanRows.length > 0 ? karyawanRows[0].nama : 'Unknown',
    id_teknisi: teknisiRows.length > 0 ? teknisiRows[0].id_teknisi : null,
  };
}

// Cek apakah orang yang login berhak akses chat tiket ini.
// PENTING: level di sistem ini "Admin" / "Teknisi" / "Users" (huruf besar di awal),
// bukan "admin" / "teknisi" / "users".
async function checkAccess(id_ticket, nik, level) {
  if (level === 'Admin') return true; // Admin boleh lihat semua chat

  if (level === 'Users') {
    const [rows] = await pool.query('SELECT nik_pelapor FROM list_ticket WHERE id_ticket = ?', [id_ticket]);
    return rows.length > 0 && rows[0].nik_pelapor === nik;
  }

  if (level === 'Teknisi') {
    const [teknisiRows] = await pool.query('SELECT id_teknisi FROM teknisi WHERE nik = ?', [nik]);
    if (teknisiRows.length === 0) return false;
    const [rows] = await pool.query('SELECT id_teknisi FROM assignment_ticket WHERE id_ticket = ?', [id_ticket]);
    return rows.length > 0 && rows[0].id_teknisi === teknisiRows[0].id_teknisi;
  }

  return false;
}

// ===== AMBIL CHAT =====
exports.getChats = async (req, res) => {
  try {
    const { id_ticket } = req.params;
    const { nik, level } = req.user;

    const allowed = await checkAccess(id_ticket, nik, level);
    if (!allowed) return fail(res, 'Anda tidak memiliki akses ke chat tiket ini', 403);

    const [chats] = await pool.query(
      `SELECT * FROM ticket_chat WHERE id_ticket = ? ORDER BY created_at ASC`,
      [id_ticket]
    );
    return ok(res, chats);
  } catch (err) {
    return fail(res, 'Gagal mengambil chat: ' + err.message, 500);
  }
};

// ===== KIRIM CHAT (teks dan/atau foto) =====
exports.sendChat = async (req, res) => {
  try {
    const { id_ticket } = req.params;
    const { message } = req.body;
    const { nik, level } = req.user;

    const hasFile = !!req.file;
    if ((!message || message.trim() === '') && !hasFile) {
      return fail(res, 'Pesan atau foto wajib diisi', 400);
    }

    const allowed = await checkAccess(id_ticket, nik, level);
    if (!allowed) return fail(res, 'Anda tidak berhak mengirim chat ke tiket ini', 403);

    const info = await getSenderInfo(nik);
    const senderId = level === 'Teknisi' ? (info.id_teknisi || nik) : nik;
    const attachmentUrl = hasFile ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO ticket_chat (id_ticket, sender_id, sender_role, sender_name, message, attachment_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_ticket, senderId, level, info.nama, message || '', attachmentUrl]
    );

    const [newChat] = await pool.query('SELECT * FROM ticket_chat WHERE id_chat = ?', [result.insertId]);
    return created(res, newChat[0], 'Pesan berhasil dikirim');
  } catch (err) {
    return fail(res, 'Gagal mengirim chat: ' + err.message, 500);
  }
};