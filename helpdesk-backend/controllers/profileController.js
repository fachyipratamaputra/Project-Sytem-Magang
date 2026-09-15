const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// folder penyimpanan file tanda tangan
const uploadDir = path.join(__dirname, '..', 'uploads', 'signatures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `ttd_${req.user.nik}_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File harus berupa gambar (PNG/JPG)'), false);
    }
};

exports.uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // maks 2MB
}).single('signature');

// ============================================================
// POST /profile/signature — upload/ganti tanda tangan milik user login
// ============================================================
exports.uploadSignature = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File tanda tangan wajib diupload' });
        }

        const nik = req.user.nik;

        // hapus file tanda tangan lama (kalau ada) biar tidak numpuk di disk
        const [rows] = await db.query(`SELECT tanda_tangan FROM karyawan WHERE nik = ?`, [nik]);
        const oldPath = rows[0]?.tanda_tangan;
        if (oldPath) {
            const oldFullPath = path.join(__dirname, '..', oldPath);
            if (fs.existsSync(oldFullPath)) {
                fs.unlink(oldFullPath, () => {});
            }
        }

        const relativePath = `/uploads/signatures/${req.file.filename}`;
        await db.query(`UPDATE karyawan SET tanda_tangan = ? WHERE nik = ?`, [relativePath, nik]);

        res.json({ message: 'Tanda tangan berhasil disimpan', tanda_tangan: relativePath });
    } catch (error) {
        console.error('uploadSignature error:', error);
        res.status(500).json({ message: 'Gagal menyimpan tanda tangan' });
    }
};

// ============================================================
// GET /profile/signature — cek tanda tangan milik user login (buat preview)
// ============================================================
exports.getSignature = async (req, res) => {
    try {
        const nik = req.user.nik;
        const [rows] = await db.query(`SELECT tanda_tangan FROM karyawan WHERE nik = ?`, [nik]);
        res.json({ tanda_tangan: rows[0]?.tanda_tangan || null });
    } catch (error) {
        console.error('getSignature error:', error);
        res.status(500).json({ message: 'Gagal mengambil tanda tangan' });
    }
};