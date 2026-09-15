const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const c = require('../controllers/inventoryController');

router.get('/', verifyToken, checkRole('Admin'), c.getAll);
router.get('/my', verifyToken, checkRole('Users'), c.getMyAssets);

// Statistik untuk dashboard chart - WAJIB ditaruh sebelum route ':kode' apapun,
// kalau tidak, request ke /stats atau /jenis-options akan "ketangkep" oleh
// route dinamis seperti /:kode/detail dan gagal (Express mencocokkan route
// berdasarkan urutan pendaftaran, bukan spesifisitas).
router.get('/stats', verifyToken, checkRole('Admin'), c.getStats);
router.get('/jenis-options', verifyToken, checkRole('Admin'), c.getJenisOptions);

router.post('/', verifyToken, checkRole('Admin', 'Users'), c.create);
router.put('/:kode', verifyToken, checkRole('Admin'), c.update);
router.delete('/:kode', verifyToken, checkRole('Admin'), c.remove);

// ===== DETAIL ASSET (Profile + Hardware + Software + Riwayat Tiket + Riwayat Pemegang) =====
router.get('/:kode/detail', verifyToken, checkRole('Admin'), c.getDetail);

// ===== HARDWARE (lama, key-value - dibiarkan untuk kompatibilitas) =====
router.post('/:kode/hardware', verifyToken, checkRole('Admin'), c.addHardware);
router.put('/:kode/hardware/:id', verifyToken, checkRole('Admin'), c.updateHardware);
router.delete('/:kode/hardware/:id', verifyToken, checkRole('Admin'), c.deleteHardware);

// ===== HARDWARE DETAIL (baru, fixed fields) =====
router.put('/:kode/hardware-detail', verifyToken, checkRole('Admin'), c.saveHardwareDetail);

// ===== SOFTWARE (lama, key-value - dibiarkan untuk kompatibilitas) =====
router.post('/:kode/software', verifyToken, checkRole('Admin'), c.addSoftware);
router.put('/:kode/software/:id', verifyToken, checkRole('Admin'), c.updateSoftware);
router.delete('/:kode/software/:id', verifyToken, checkRole('Admin'), c.deleteSoftware);

// ===== SOFTWARE DETAIL (baru, fixed fields) =====
router.put('/:kode/software-detail', verifyToken, checkRole('Admin'), c.saveSoftwareDetail);

module.exports = router;