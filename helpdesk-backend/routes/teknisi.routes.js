const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const c = require('../controllers/teknisiController');

// 🔥 DIUBAH: dibuka juga untuk Teknisi (dipakai untuk resolve nama teknisi
// di rekapan/gantt halaman "Schedule Tersedia" teknisi)
router.get('/', verifyToken, checkRole('Admin', 'Teknisi'), c.getAll);
router.get('/by-kategori/:id_kategori', verifyToken, c.getByKategori);
router.post('/', verifyToken, checkRole('Admin'), c.create);
router.put('/:id', verifyToken, checkRole('Admin'), c.update);
router.delete('/:id', verifyToken, checkRole('Admin'), c.remove);

module.exports = router;