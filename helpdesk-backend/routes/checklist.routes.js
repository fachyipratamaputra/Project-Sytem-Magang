const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklistController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Data template & hasil checklist
router.get('/template-kategori', verifyToken, checklistController.getKategoriList);
router.get('/ticket/:idTicket', verifyToken, checklistController.getByTicket);
router.patch('/item/:idResult', verifyToken, checkRole('Teknisi'), checklistController.updateItem);

// ============================================================
// 🔥 APPROVAL 3 TINGKAT
// 🔧 FIXED: role harus 'Users' (plural), bukan 'User' (singular) —
// konsisten dengan seluruh route lain di project (lihat ticketRoutes.js,
// yang selalu memakai checkRole('Users') untuk role user biasa).
// Sebelumnya mismatch ini bikin checkRole selalu menolak user biasa
// dengan pesan "Anda tidak punya akses ke fitur ini" walau role-nya
// sudah benar tersimpan di JWT token (req.user.level === 'Users').
// ============================================================
router.get('/ticket/:idTicket/approval', verifyToken, checklistController.getApprovalStatus);
router.post('/ticket/:idTicket/ajukan', verifyToken, checkRole('Teknisi'), checklistController.ajukanApproval);
router.put('/ticket/:idTicket/user-approve', verifyToken, checkRole('Users'), checklistController.approveByUser);
router.put('/ticket/:idTicket/itservice-approve', verifyToken, checkRole('IT Service'), checklistController.approveByItService);

// Export PDF (hanya bisa setelah disetujui User + IT Service)
router.get('/ticket/:idTicket/pdf', verifyToken, checklistController.downloadPdf);

module.exports = router;