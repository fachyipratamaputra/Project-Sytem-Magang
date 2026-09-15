const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const c = require('../controllers/karyawanController');

// --- Route untuk Admin (semua dilindungi) ---
router.use(verifyToken, checkRole('Admin'));

router.get('/', c.getAll);
router.get('/available', c.getAvailable);   // 🔥 Tambahkan ini!
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;