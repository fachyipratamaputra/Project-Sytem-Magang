const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const c = require('../controllers/chatController');

// Dipasang di server.js dengan: app.use('/api/tickets', require('./routes/chat.routes'))
// supaya URL akhirnya jadi persis /api/tickets/:id_ticket/chat (sesuai yang dipanggil chat.service.ts)
router.get('/:id_ticket/chat', verifyToken, c.getChats);
router.post('/:id_ticket/chat', verifyToken, upload.single('foto'), c.sendChat);

module.exports = router;