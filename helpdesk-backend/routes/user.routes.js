const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const c = require('../controllers/userController');

router.get('/', verifyToken, checkRole('Admin'), c.getAll);
router.post('/', verifyToken, checkRole('Admin'), c.create);
router.put('/:id', verifyToken, checkRole('Admin'), c.update);
router.delete('/:id', verifyToken, checkRole('Admin'), c.remove);

module.exports = router;
