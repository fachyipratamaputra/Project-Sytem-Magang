const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');

router.get('/signature', verifyToken, profileController.getSignature);
router.post('/signature', verifyToken, profileController.uploadMiddleware, profileController.uploadSignature);

module.exports = router;