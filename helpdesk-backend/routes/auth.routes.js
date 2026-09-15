const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/login', c.login);
router.post('/change-password', verifyToken, c.changePassword);

module.exports = router;
