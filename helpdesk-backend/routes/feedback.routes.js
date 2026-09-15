const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const c = require('../controllers/feedbackController');

router.get('/', verifyToken, checkRole('Admin'), c.getAll);
router.post('/', verifyToken, checkRole('Users'), c.create);

module.exports = router;
