const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Memetakan folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads/lampiran')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =========================================================
// Routes
// =========================================================
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/tickets', require('./routes/ticket.routes'));
app.use('/api/approval', require('./routes/approval.routes'));
app.use('/api/assignment', require('./routes/assignment.routes'));
app.use('/api/karyawan', require('./routes/karyawan.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/master', require('./routes/master.routes'));
app.use('/api/teknisi', require('./routes/teknisi.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/feedback', require('./routes/feedback.routes'));
app.use('/api/schedule', require('./routes/schedule.routes'));
app.use('/api/checklist', require('./routes/checklist.routes'));
app.use('/api/profile', require('./routes/profile.routes'));

const chatRoutes = require('./routes/chat.routes');
app.use('/api/tickets', chatRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Helpdesk Ticketing System API - PT Bakrie Pipe Industries' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Terjadi kesalahan server' });
});

const PORT = process.env.PORT || 5000;
const pool = require('./config/db');

app.listen(PORT, async () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log('✅ Berhasil terhubung ke database MySQL (XAMPP)');

    // 🔥 JALANKAN CRON JOB SETELAH KONEKSI DATABASE BERHASIL
    require('./cron');
    console.log('🕒 Cron job schedule preventive diaktifkan');

  } catch (err) {
    console.error('❌ GAGAL terhubung ke database:', err.message);
    console.error('   Cek: XAMPP MySQL sudah Start? File .env sudah benar? Database sudah di-import?');
  }
});