const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const c = require('../controllers/approvalController');

router.get('/', verifyToken, checkRole('Admin'), c.getApprovalList);
router.get('/riwayat', verifyToken, checkRole('Admin'), c.getRiwayatApproval);
router.put('/:id_ticket', verifyToken, checkRole('Admin'), c.processApproval);

module.exports = router;
