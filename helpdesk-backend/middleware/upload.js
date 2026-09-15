const multer = require('multer');
const path = require('path');

// 🔥 Simpan file ke folder 'uploads/lampiran/' agar sesuai dengan konfigurasi server.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Path relatif dari folder middleware ke folder root backend + 'uploads/lampiran'
    cb(null, path.join(__dirname, '..', 'uploads', 'lampiran'));
  },
  filename: (req, file, cb) => {
    // Nama file unik: timestamp + random + ekstensi
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

// Filter file: hanya gambar
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ok) cb(null, true);
  else cb(new Error('Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan'));
};

// Batas ukuran file 5MB
const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

module.exports = upload;