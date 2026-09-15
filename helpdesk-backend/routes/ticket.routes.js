const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const c = require('../controllers/ticketController');

// ==========================================
// ADMIN: Lihat semua tiket
// ==========================================
router.get('/', verifyToken, checkRole('Admin'), c.getAllTickets);

// 🔥 Rute Approval Tiket (Baru ditambahkan)
router.put('/:id/approval', verifyToken, checkRole('Admin'), c.approveTicket);

// Assign tiket ke teknisi (Admin), memicu perhitungan deadline
router.put('/:id/assign', verifyToken, checkRole('Admin'), c.assignTicket);

// Ambil tiket yang dikembalikan
router.get('/returned', verifyToken, checkRole('Admin'), c.getReturnedTickets);

// Review pengembalian (Approve/Reject)
router.put('/:id/return-review', verifyToken, checkRole('Admin'), c.reviewReturnTicket);

// 🔥 BARU: Admin approve/sign-off checklist hasil pekerjaan teknisi
router.put('/:idTicket/admin-approve', verifyToken, checkRole('Admin'), c.adminApproveTicket);

// ==========================================
// USERS: My Ticket & New Ticket
// ==========================================
router.get('/my', verifyToken, checkRole('Users'), c.getMyTickets);
router.post('/', verifyToken, checkRole('Users'), upload.single('lampiran'), c.createTicket);
router.put('/:idTicket/user-konfirmasi', verifyToken, checkRole('Users'), c.confirmByUser);  // 🔵 pindah ke sini

// ==========================================
// TEKNISI: Ticket yang ditugaskan & Riwayat
// ==========================================
router.get('/assigned/me', verifyToken, checkRole('Teknisi'), c.getAssignedToMe);
router.get('/riwayat/me', verifyToken, checkRole('Teknisi'), c.getRiwayatMe);

router.put('/:id/toggle-pause', verifyToken, checkRole('Teknisi'), c.togglePause);

// Request return
router.post('/:id/return', verifyToken, checkRole('Teknisi'), c.requestReturnTicket);

router.get('/:id/progress-history', verifyToken, c.getProgressHistory);
router.put('/:id/proses', verifyToken, checkRole('Teknisi'), c.updateProgress);

// ==========================================
// ADMIN: Hapus tiket
// ==========================================
router.delete('/:id', verifyToken, checkRole('Admin'), c.deleteTicket);
// ==========================================
// SEMUA ROLE: Detail tiket
// ==========================================
router.get('/:id', verifyToken, c.getTicketById);

module.exports = router;