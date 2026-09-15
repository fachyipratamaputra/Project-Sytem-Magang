const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifikasi token JWT, isi req.user = { nik, username, level }
function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan, silakan login' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid atau kadaluarsa' });
    }
    req.user = decoded;
    next();
  });
}

// Batasi akses berdasarkan role: checkRole('Admin'), checkRole('Admin','Teknisi'), dst
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.level)) {
      return res.status(403).json({ success: false, message: 'Anda tidak punya akses ke fitur ini' });
    }
    next();
  };
}

module.exports = { verifyToken, checkRole };