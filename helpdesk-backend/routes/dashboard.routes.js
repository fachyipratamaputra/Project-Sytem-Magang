const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const c = require('../controllers/dashboardController');

router.get('/admin', verifyToken, checkRole('Admin'), c.getAdminDashboard);
router.get('/teknisi', verifyToken, checkRole('Teknisi'), c.getTeknisiDashboard);
router.get('/users', verifyToken, checkRole('Users'), c.getUserDashboard);

module.exports = router;
