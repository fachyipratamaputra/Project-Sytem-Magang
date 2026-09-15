const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { verifyToken, checkRole } = require('../middleware/auth');

// ========== Schedule Preventive (ADMIN) ==========
router.get('/departments', verifyToken, checkRole('Admin', 'Teknisi'), scheduleController.getDepartmentsWithSchedules);
router.get('/department/:deptId', verifyToken, checkRole('Admin'), scheduleController.getSchedulesByDepartment);
router.get('/assets/available', verifyToken, checkRole('Admin'), scheduleController.getAvailableAssets);

// ========== Schedule Preventive (TEKNISI - self-claim) ==========
router.get('/available', verifyToken, scheduleController.getAvailableSchedules);
router.patch('/:id/claim', verifyToken, scheduleController.claimSchedule);
router.patch('/:id/claim-asset', verifyToken, checkRole('Teknisi'), scheduleController.claimAssetToMe); // 🔥 BARU
router.patch('/:id/unclaim', verifyToken, checkRole('Admin'), scheduleController.unclaimSchedule);

// ========== Schedule Preventive (ADMIN - CRUD, taruh /:id generic PALING BAWAH) ==========
router.get('/:id/assets', verifyToken, checkRole('Admin', 'Teknisi'), scheduleController.getAssetsBySchedule);
router.get('/:id', verifyToken, checkRole('Admin'), scheduleController.getScheduleById);
router.post('/', verifyToken, checkRole('Admin'), scheduleController.createSchedule);
router.put('/:id', verifyToken, checkRole('Admin'), scheduleController.updateSchedule);
router.delete('/:id', verifyToken, checkRole('Admin'), scheduleController.deleteSchedule);
router.patch('/:id/toggle', verifyToken, checkRole('Admin'), scheduleController.toggleActive);

module.exports = router;