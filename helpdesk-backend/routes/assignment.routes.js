const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const assignmentController = require('../controllers/assignmentController');

// Routes Admin
router.get('/assignable', verifyToken, checkRole('Admin'), assignmentController.getAssignableTickets);
router.get('/teknisi/:id_kategori', verifyToken, checkRole('Admin'), assignmentController.getTeknisiByKategori);
router.post('/:id_ticket', verifyToken, checkRole('Admin'), assignmentController.assignTicket);

// Routes Teknisi
router.get('/my', verifyToken, checkRole('Teknisi'), assignmentController.getMyAssignments);
router.get('/riwayat', verifyToken, checkRole('Teknisi'), assignmentController.getRiwayatTeknisi);
router.put('/progress/:id_ticket', verifyToken, checkRole('Teknisi'), assignmentController.updateProgress);

module.exports = router;