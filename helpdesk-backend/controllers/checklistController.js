const db = require('../config/db');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// 🔥 NIK akun IT Service default yang tanda tangannya otomatis dipakai
// begitu Teknisi mengajukan Check Sheet ke User (tidak perlu approve manual lagi).
// Ganti dengan NIK akun IT Service yang sudah upload tanda tangan di profilnya,
// atau isi lewat .env sebagai DEFAULT_IT_SERVICE_NIK=xxxxx
const DEFAULT_IT_SERVICE_NIK = process.env.DEFAULT_IT_SERVICE_NIK || 'GANTI_DENGAN_NIK_IT_SERVICE';

// 🔥 Urutan kategori dipakai bersama oleh getKategoriList, getByTicket, dan
// downloadPdf, supaya ketiganya selalu konsisten tanpa bergantung pada nilai
// kolom `urutan` di checklist_template yang bisa saja tidak unik secara
// global antar kategori.
const KATEGORI_ORDER = ['CPU', 'Monitor', 'Software', 'Printer/Scanner', 'Network Equipment'];
const kategoriOrderSql = (col) => {
    const cases = KATEGORI_ORDER.map((k, i) => `WHEN '${k}' THEN ${i + 1}`).join(' ');
    return `CASE ${col} ${cases} ELSE 99 END`;
};

// ============================================================
// GET daftar kategori unit yang tersedia (buat checkbox di modal Buat Schedule)
// 🔧 FIXED: sebelumnya ORDER BY MIN(urutan), yang bisa salah urutan kalau
// kolom urutan di checklist_template tidak unik secara global antar kategori.
// Sekarang pakai urutan kategori eksplisit yang sama dengan getByTicket &
// downloadPdf.
// ============================================================
exports.getKategoriList = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT kategori_unit
            FROM checklist_template
            GROUP BY kategori_unit
            ORDER BY ${kategoriOrderSql('kategori_unit')}
        `);
        res.json(rows.map(r => r.kategori_unit));
    } catch (error) {
        console.error('getKategoriList error:', error);
        res.status(500).json({ message: 'Gagal mengambil kategori checklist' });
    }
};

// ============================================================
// GET checklist result untuk satu ticket (dipakai halaman Proses Tiket teknisi)
// ============================================================
exports.getByTicket = async (req, res) => {
    try {
        const { idTicket } = req.params;
        const [rows] = await db.query(`
            SELECT r.id_result, r.id_item, r.kondisi, r.kondisi_huruf, r.catatan, r.checked_at,
                   t.kategori_unit, t.uraian_pekerjaan, t.alat_yang_digunakan,
                   t.penerimaan_default, t.urutan
            FROM ticket_checklist_result r
            JOIN checklist_template t ON t.id_item = r.id_item
            WHERE r.id_ticket = ?
            ORDER BY FIELD(t.kategori_unit, 'CPU', 'Monitor', 'Software', 'Printer/Scanner', 'Network Equipment'),
                     t.urutan
        `, [idTicket]);
        res.json(rows);
    } catch (error) {
        console.error('getByTicket error:', error);
        res.status(500).json({ message: 'Gagal mengambil checklist ticket' });
    }
};

// ============================================================
// PATCH update satu item checklist (centang OK/NC + sub-kode B/C/D + catatan)
// ============================================================
exports.updateItem = async (req, res) => {
    try {
        const { idResult } = req.params;
        let { kondisi, kondisi_huruf, catatan } = req.body;

        if (kondisi !== null && kondisi !== undefined && !['OK', 'NC'].includes(kondisi)) {
            return res.status(400).json({ message: 'kondisi harus OK, NC, atau null' });
        }

        if (kondisi === 'NC') {
            if (!['B', 'C', 'D'].includes(kondisi_huruf)) {
                return res.status(400).json({ message: 'Untuk kondisi NC, kondisi_huruf wajib diisi salah satu dari B/C/D' });
            }
        } else {
            kondisi_huruf = null;
        }

        await db.query(`
            UPDATE ticket_checklist_result
            SET kondisi = ?, kondisi_huruf = ?, catatan = ?, checked_at = NOW()
            WHERE id_result = ?
        `, [kondisi || null, kondisi_huruf || null, catatan || null, idResult]);

        res.json({ message: 'Checklist berhasil diupdate' });
    } catch (error) {
        console.error('updateItem error:', error);
        res.status(500).json({ message: 'Gagal update checklist' });
    }
};

// ============================================================
// 🔥 APPROVAL — sekarang cuma 2 pihak yang benar-benar approve manual:
// Teknisi (Dibuat Oleh) -> User (Diketahui).
// TTD IT Service (Disetujui) otomatis terisi bersamaan dengan TTD Teknisi
// saat "Ajukan ke User", pakai akun default DEFAULT_IT_SERVICE_NIK.
// ============================================================

// pastikan baris checklist_approval untuk ticket ini sudah ada
async function ensureApprovalRow(idTicket) {
    await db.query(`INSERT IGNORE INTO checklist_approval (id_ticket) VALUES (?)`, [idTicket]);
}

// GET status approval untuk satu ticket
exports.getApprovalStatus = async (req, res) => {
    try {
        const { idTicket } = req.params;
        await ensureApprovalRow(idTicket);
        const [rows] = await db.query(`
            SELECT ca.*,
                   karD.nama AS nama_dibuat_oleh, karD.tanda_tangan AS ttd_dibuat_oleh,
                   karK.nama AS nama_diketahui_oleh, karK.tanda_tangan AS ttd_diketahui_oleh,
                   karS.nama AS nama_disetujui_oleh, karS.tanda_tangan AS ttd_disetujui_oleh
            FROM checklist_approval ca
            LEFT JOIN karyawan karD ON karD.nik = ca.dibuat_oleh_nik
            LEFT JOIN karyawan karK ON karK.nik = ca.diketahui_oleh_nik
            LEFT JOIN karyawan karS ON karS.nik = ca.disetujui_oleh_nik
            WHERE ca.id_ticket = ?
        `, [idTicket]);
        res.json(rows[0]);
    } catch (error) {
        console.error('getApprovalStatus error:', error);
        res.status(500).json({ message: 'Gagal mengambil status approval' });
    }
};

// TAHAP 1 — Teknisi mengajukan Check Sheet yang sudah diisi lengkap ke User
// 🔥 TTD Teknisi (dibuat_oleh) dan TTD IT Service (disetujui) otomatis
// terisi bersamaan di sini. TTD IT Service pakai akun default
// (DEFAULT_IT_SERVICE_NIK). Yang masih perlu approval manual cuma User (diketahui).
exports.ajukanApproval = async (req, res) => {
    try {
        const { idTicket } = req.params;

        const [asgRows] = await db.query(`
            SELECT status_pengerjaan FROM assignment_ticket
            WHERE id_ticket = ? ORDER BY tanggal_assign DESC LIMIT 1
        `, [idTicket]);
        if (asgRows.length === 0) {
            return res.status(404).json({ message: 'Assignment ticket tidak ditemukan' });
        }
        if (asgRows[0].status_pengerjaan !== 'Selesai') {
            return res.status(400).json({ message: 'Ticket harus berstatus Selesai sebelum diajukan approval' });
        }

        const [belumIsi] = await db.query(`
            SELECT COUNT(*) AS jumlah FROM ticket_checklist_result
            WHERE id_ticket = ? AND kondisi IS NULL
        `, [idTicket]);
        if (belumIsi[0].jumlah > 0) {
            return res.status(400).json({ message: `Masih ada ${belumIsi[0].jumlah} item checklist yang belum diisi (OK/NC)` });
        }

        // pastikan akun IT Service default memang ada di tabel karyawan,
        // biar tidak menyimpan NIK yang salah/kosong ke checklist_approval
        const [itServiceRows] = await db.query(`SELECT nik FROM karyawan WHERE nik = ?`, [DEFAULT_IT_SERVICE_NIK]);
        if (itServiceRows.length === 0) {
            console.warn('DEFAULT_IT_SERVICE_NIK tidak ditemukan di tabel karyawan:', DEFAULT_IT_SERVICE_NIK);
        }

        await ensureApprovalRow(idTicket);
        await db.query(`
            UPDATE checklist_approval
            SET dibuat_oleh_nik = ?, tanggal_dibuat = NOW(),
                status_diketahui = 'Menunggu', diketahui_oleh_nik = NULL, tanggal_diketahui = NULL, catatan_diketahui = NULL,
                disetujui_oleh_nik = ?, tanggal_disetujui = NOW(),
                status_disetujui = 'Approve', catatan_disetujui = NULL
            WHERE id_ticket = ?
        `, [req.user.nik, DEFAULT_IT_SERVICE_NIK, idTicket]);

        res.json({ message: 'Check Sheet berhasil diajukan. Tanda tangan Teknisi & IT Service otomatis terisi, menunggu approval User.' });
    } catch (error) {
        console.error('ajukanApproval error:', error);
        res.status(500).json({ message: 'Gagal mengajukan approval' });
    }
};

// TAHAP 2 — User approve / reject (Diketahui) — INI GERBANG UTAMA SEKARANG
// 🔥 FIXED (SINKRONISASI): sebelumnya fungsi ini HANYA update tabel
// checklist_approval (status_diketahui), tapi TIDAK PERNAH menyentuh
// assignment_ticket.user_konfirmasi. Akibatnya:
//   - Check Sheet sudah menampilkan "Status: Disetujui" dan PDF sudah
//     bisa didownload (karena downloadPdf cuma cek status_diketahui)
//   - TAPI warna bar Gantt chart di halaman Schedule Preventive
//     (attachStatus() di scheduleController.js) tetap HIJAU, bukan BIRU,
//     karena logic itu membaca user_konfirmasi dari assignment_ticket,
//     yang cuma pernah di-set oleh confirmByUser() di ticketController.js
//     — endpoint yang berbeda dan tidak pernah dipanggil dari alur
//     Check Sheet ini.
// FIX: begitu User approve ('Approve') di sini, sekalian set
// assignment_ticket.user_konfirmasi = 1 untuk id_ticket yang sama, supaya
// kedua sistem approval ini konsisten dan warna bar Gantt chart ikut
// berubah biru begitu SEMUA aset dalam schedule sudah di-approve User.
// Kalau action = 'Reject', user_konfirmasi TIDAK diubah (tetap seperti
// sebelumnya / tetap 0), supaya reject tidak keliru dianggap approved.
// ============================================================
exports.approveByUser = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { idTicket } = req.params;
        const { action, catatan } = req.body; // action: 'Approve' | 'Reject'

        if (!['Approve', 'Reject'].includes(action)) {
            conn.release();
            return res.status(400).json({ message: 'action harus Approve atau Reject' });
        }

        const [rows] = await conn.query(`SELECT * FROM checklist_approval WHERE id_ticket = ?`, [idTicket]);
        if (rows.length === 0 || !rows[0].dibuat_oleh_nik) {
            conn.release();
            return res.status(400).json({ message: 'Check Sheet belum diajukan Teknisi' });
        }

        await conn.beginTransaction();

        await conn.query(`
            UPDATE checklist_approval
            SET diketahui_oleh_nik = ?, tanggal_diketahui = NOW(),
                status_diketahui = ?, catatan_diketahui = ?
            WHERE id_ticket = ?
        `, [req.user.nik, action, catatan || null, idTicket]);

        // 🔥 SINKRONISASI: kalau User approve, ikut set user_konfirmasi
        // di assignment_ticket supaya warna bar Gantt chart Schedule
        // Preventive (attachStatus di scheduleController.js) ikut update
        // jadi biru begitu SEMUA aset schedule sudah di-approve User.
        if (action === 'Approve') {
            await conn.query(`
                UPDATE assignment_ticket
                SET user_konfirmasi = 1, tanggal_konfirmasi_user = NOW()
                WHERE id_ticket = ?
            `, [idTicket]);
        }

        await conn.commit();
        res.json({ message: `Check Sheet berhasil di-${action === 'Approve' ? 'setujui' : 'tolak'} User` });
    } catch (error) {
        await conn.rollback();
        console.error('approveByUser error:', error);
        res.status(500).json({ message: 'Gagal approve User' });
    } finally {
        conn.release();
    }
};

// TAHAP 3 (LEGACY) — IT Service approve / reject manual.
// Sudah tidak dipakai di alur normal karena TTD IT Service kini otomatis
// terisi di ajukanApproval(). Dibiarkan ada untuk jaga-jaga/keperluan lain.
exports.approveByItService = async (req, res) => {
    try {
        const { idTicket } = req.params;
        const { action, catatan } = req.body;

        if (!['Approve', 'Reject'].includes(action)) {
            return res.status(400).json({ message: 'action harus Approve atau Reject' });
        }

        const [rows] = await db.query(`SELECT * FROM checklist_approval WHERE id_ticket = ?`, [idTicket]);
        if (rows.length === 0 || rows[0].status_diketahui !== 'Approve') {
            return res.status(400).json({ message: 'Check Sheet harus di-approve User terlebih dahulu' });
        }

        await db.query(`
            UPDATE checklist_approval
            SET disetujui_oleh_nik = ?, tanggal_disetujui = NOW(),
                status_disetujui = ?, catatan_disetujui = ?
            WHERE id_ticket = ?
        `, [req.user.nik, action, catatan || null, idTicket]);

        res.json({ message: `Check Sheet berhasil di-${action === 'Approve' ? 'setujui' : 'tolak'} IT Service` });
    } catch (error) {
        console.error('approveByItService error:', error);
        res.status(500).json({ message: 'Gagal approve IT Service' });
    }
};

// ============================================================
// helper: gambar tanda tangan PNG ke PDF kalau file-nya memang ada di disk
// 🔧 FIXED: ukuran default diperbesar dari 70x30 (kekecilan, sulit dibaca)
// jadi 95x45, sepadan dengan tampilan HTML (.signature-img: max-height
// 100px / max-width 200px). Baris pemanggilnya juga disesuaikan spasinya
// (lihat bagian STATUS/DIBUAT OLEH/DIKETAHUI/DISETUJUI di bawah).
// ============================================================
function drawSignatureIfExists(doc, ttdPath, x, yPos, width = 95, height = 45) {
    if (!ttdPath) return;
    const fullPath = path.join(__dirname, '..', ttdPath);
    if (fs.existsSync(fullPath)) {
        try {
            doc.image(fullPath, x, yPos, { width, height });
        } catch (e) {
            console.warn('Gagal render tanda tangan ke PDF:', e.message);
        }
    }
}

// ============================================================
// 🔥 cari file logo perusahaan di beberapa lokasi umum di disk.
// Aman kalau tidak ketemu di manapun (kembalikan null, kotak logo
// di PDF cuma dikosongkan, tidak bikin error).
// Kalau logo kamu ada di lokasi lain, tambahkan path-nya di array ini.
// ============================================================
function findLogoPath() {
    const candidates = [
        path.join(__dirname, '..', 'assets', 'logo bakrie.png'),
        path.join(__dirname, '..', 'assets', 'logo-bakrie.png'),
        path.join(__dirname, '..', 'public', 'assets', 'logo bakrie.png'),
        path.join(__dirname, '..', 'public', 'logo bakrie.png'),
        path.join(__dirname, '..', 'uploads', 'logo bakrie.png'),
    ];
    return candidates.find(p => fs.existsSync(p)) || null;
}

// ============================================================
// 🔥 Urutan kelompok "Kode Assets" pada Check Sheet.
// Kelompok pertama TIDAK punya header "Kode Assets" (langsung CPU/Monitor/Software,
// nomor NO lanjut 1,2,3). Kelompok berikutnya masing-masing punya header sendiri
// dan nomor NO reset ke 1.
// Kalau nanti ada kategori baru di checklist_template yang belum terdaftar di sini,
// otomatis dibuatkan kelompok sendiri (fallback) supaya tidak hilang dari PDF.
// ============================================================
const CHECKSHEET_GROUPS = [
    { header: null, categories: ['CPU', 'Monitor', 'Software'] },
    { header: 'Kode Assets (Printer / Scanner *)', categories: ['Printer/Scanner'] },
    { header: 'Kode Assets (Network *)', categories: ['Network Equipment'] }
];

// normalisasi buat pencocokan saja (trim + lowercase), label asli dari DB tetap dipakai buat ditampilkan
const normalizeKategori = (s) => String(s || '').trim().toLowerCase();

function buildGroupedChecklist(checklist) {
    // key pakai versi ternormalisasi, tapi simpan label asli dari data (byKategori[key].label)
    const byKategori = {};
    checklist.forEach(item => {
        const key = normalizeKategori(item.kategori_unit);
        if (!byKategori[key]) byKategori[key] = { label: item.kategori_unit, items: [] };
        byKategori[key].items.push(item);
    });

    const groupDefs = CHECKSHEET_GROUPS.map(g => ({
        header: g.header,
        categories: g.categories.map(normalizeKategori)
    }));

    // kategori di data yang tidak match ke salah satu grup di atas -> fallback, tetap di urutan paling akhir
    const knownKeys = groupDefs.flatMap(g => g.categories);
    Object.keys(byKategori).forEach(key => {
        if (!knownKeys.includes(key)) {
            groupDefs.push({ header: `Kode Assets (${byKategori[key].label} *)`, categories: [key] });
        }
    });

    return groupDefs
        .map(g => ({
            header: g.header,
            categoryBlocks: g.categories
                .filter(key => byKategori[key])
                .map(key => ({ kategori_unit: byKategori[key].label, items: byKategori[key].items }))
        }))
        .filter(g => g.categoryBlocks.length > 0);
}

// ============================================================
// 🔥 DOWNLOAD PDF CHECK SHEET (server-side, pakai pdfkit)
// Sekarang gerbangnya cuma status_diketahui (User) karena
// status_disetujui (IT Service) otomatis Approve sejak diajukan.
// Header (logo + judul + No.Form) dan info (Tanggal Pelaksanaan, IT
// Propertis, Department, Sub Department) digambar dengan bingkai
// tabel, sama seperti kotak legenda Catatan/Kondisi NC dan tampilan
// modal Teknisi/User.
// ============================================================
exports.downloadPdf = async (req, res) => {
    try {
        const { idTicket } = req.params;

        const [ticketRows] = await db.query(`
            SELECT
                lt.id_ticket, lt.deskripsi, lt.tanggal_lapor, lt.kode_asset,
                d.nama_departemen,
                sk.nama_sub_kategori,
                i.nama_barang, i.merk_model,
                asg.status_pengerjaan,
                karTeknisi.nama AS nama_teknisi
            FROM list_ticket lt
            JOIN assignment_ticket asg ON asg.id_ticket = lt.id_ticket
            LEFT JOIN inventory i ON i.kode_asset = lt.kode_asset
            LEFT JOIN departemen d ON lt.id_departemen = d.id_departemen
            LEFT JOIN sub_kategori sk ON lt.id_sub_kategori = sk.id_sub_kategori
            LEFT JOIN teknisi t ON t.id_teknisi = asg.id_teknisi
            LEFT JOIN karyawan karTeknisi ON karTeknisi.nik = t.nik
            WHERE lt.id_ticket = ?
            ORDER BY asg.tanggal_assign DESC LIMIT 1
        `, [idTicket]);

        if (ticketRows.length === 0) {
            return res.status(404).json({ message: 'Ticket tidak ditemukan' });
        }
        const ticket = ticketRows[0];

        const [approvalRows] = await db.query(`
            SELECT ca.*,
                   karD.nama AS nama_dibuat_oleh, karD.tanda_tangan AS ttd_dibuat_oleh,
                   karK.nama AS nama_diketahui_oleh, karK.tanda_tangan AS ttd_diketahui_oleh,
                   karS.nama AS nama_disetujui_oleh, karS.tanda_tangan AS ttd_disetujui_oleh
            FROM checklist_approval ca
            LEFT JOIN karyawan karD ON karD.nik = ca.dibuat_oleh_nik
            LEFT JOIN karyawan karK ON karK.nik = ca.diketahui_oleh_nik
            LEFT JOIN karyawan karS ON karS.nik = ca.disetujui_oleh_nik
            WHERE ca.id_ticket = ?
        `, [idTicket]);

        const approval = approvalRows[0];
        if (!approval || approval.status_diketahui !== 'Approve') {
            return res.status(400).json({ message: 'PDF hanya bisa didownload setelah disetujui User' });
        }

        const [checklist] = await db.query(`
            SELECT t.kategori_unit, t.uraian_pekerjaan, t.alat_yang_digunakan, t.penerimaan_default,
                   r.kondisi, r.kondisi_huruf, r.catatan
            FROM ticket_checklist_result r
            JOIN checklist_template t ON t.id_item = r.id_item
            WHERE r.id_ticket = ?
            ORDER BY FIELD(t.kategori_unit, 'CPU', 'Monitor', 'Software', 'Printer/Scanner', 'Network Equipment'),
                     t.urutan
        `, [idTicket]);

        // ===== GENERATE PDF =====
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CheckSheet_${idTicket}.pdf`);
        doc.pipe(res);

        const startX = 40;
        let y = 40;

        // ============================================================
        // 🔥 HEADER TABLE (logo | judul | no.form) — dengan bingkai
        // ============================================================
        const headerBoxHeight = 55;
        const headerLogoWidth = 70;
        const headerFormNoWidth = 160;
        const headerTitleWidth = 515 - headerLogoWidth - headerFormNoWidth; // total lebar tabel = 515 (A4 - margin kiri-kanan)

        doc.rect(startX, y, headerLogoWidth, headerBoxHeight).stroke();
        doc.rect(startX + headerLogoWidth, y, headerTitleWidth, headerBoxHeight).stroke();
        doc.rect(startX + headerLogoWidth + headerTitleWidth, y, headerFormNoWidth, headerBoxHeight).stroke();

        const logoPath = findLogoPath();
        if (logoPath) {
            try {
                doc.image(logoPath, startX + 8, y + 8, { fit: [headerLogoWidth - 16, headerBoxHeight - 16] });
            } catch (e) {
                console.warn('Gagal render logo ke PDF:', e.message);
            }
        }

        doc.font('Helvetica-Bold').fontSize(14)
            .text('CHECK SHEET', startX + headerLogoWidth, y + 12, { width: headerTitleWidth, align: 'center' });
        doc.font('Helvetica').fontSize(8)
            .text('PERSONAL COMPUTER,SOFTWARE\nPRINTER,SCANNER & NETWORK', startX + headerLogoWidth, y + 30, { width: headerTitleWidth, align: 'center' });

        const formNoX = startX + headerLogoWidth + headerTitleWidth + 6;
        doc.font('Helvetica').fontSize(8);
        doc.text('No.Form : FRM/IT/CS/001', formNoX, y + 8, { width: headerFormNoWidth - 12 });
        doc.text('No.Rev : 00', formNoX, y + 20, { width: headerFormNoWidth - 12 });
        doc.text(`Tanggal : ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, formNoX, y + 32, { width: headerFormNoWidth - 12 });

        y += headerBoxHeight;

        // ============================================================
        // 🔥 INFO TABLE (Tanggal Pelaksanaan / IT Propertis / Department / Sub Department) — dengan bingkai
        // ============================================================
        const infoBoxHeight = 60;
        const infoBoxWidth = headerLogoWidth + headerTitleWidth + headerFormNoWidth;
        const infoLabelWidth = 160;

        doc.rect(startX, y, infoBoxWidth, infoBoxHeight).stroke();
        // garis pemisah antar baris (3 garis horizontal di dalam kotak)
        for (let i = 1; i <= 3; i++) {
            const lineY = y + (infoBoxHeight / 4) * i;
            doc.moveTo(startX, lineY).lineTo(startX + infoBoxWidth, lineY).stroke();
        }
        // garis pemisah label vs value
        doc.moveTo(startX + infoLabelWidth, y).lineTo(startX + infoLabelWidth, y + infoBoxHeight).stroke();

        const infoRows = [
            ['Tanggal Pelaksanaan', new Date(ticket.tanggal_lapor).toLocaleDateString('id-ID')],
            ['IT Propertis', `${ticket.kode_asset || '-'} - ${ticket.nama_barang || ''}`],
            ['Department', ticket.nama_departemen || '-'],
            ['Sub Department', ticket.nama_sub_kategori || '-'],
        ];

        doc.font('Helvetica').fontSize(9);
        infoRows.forEach(([label, value], idx) => {
            const rowY = y + (infoBoxHeight / 4) * idx;
            const textY = rowY + (infoBoxHeight / 4 / 2) - 5;
            doc.text(label, startX + 8, textY, { width: infoLabelWidth - 16 });
            doc.text(`: ${value}`, startX + infoLabelWidth + 8, textY, { width: infoBoxWidth - infoLabelWidth - 16 });
        });

        y += infoBoxHeight + 10;

        const rowHeight = 18;
        const colWidths = { no: 20, unit: 75, uraian: 140, alat: 65, penerimaan: 65, ok: 25, nc: 25, catatan: 97 };
        const fullTableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);

        const ensureSpace = (needed = rowHeight) => {
            if (y + needed > 730) {
                doc.addPage();
                y = 40;
            }
        };

        const drawHeaderRow = () => {
            ensureSpace();
            const headers = [
                ['NO', colWidths.no], ['UNIT', colWidths.unit], ['URAIAN PEKERJAAN', colWidths.uraian],
                ['ALAT YANG\nDIGUNAKAN', colWidths.alat], ['PENERIMAAN', colWidths.penerimaan],
                ['OK', colWidths.ok], ['NC', colWidths.nc], ['CATATAN', colWidths.catatan]
            ];
            let x = startX;
            doc.font('Helvetica-Bold').fontSize(8);
            headers.forEach(([label, w]) => {
                doc.rect(x, y, w, rowHeight).stroke();
                doc.text(label, x + 2, y + 4, { width: w - 4, height: rowHeight - 4 });
                x += w;
            });
            y += rowHeight;
        };

        // baris "Kode Assets (...)" — teks polos, cuma garis atas+bawah full width (tanpa shading)
        const drawGroupHeader = (label) => {
            ensureSpace();
            doc.moveTo(startX, y).lineTo(startX + fullTableWidth, y).stroke();
            doc.font('Helvetica-Bold').fontSize(8)
                .text(label, startX + 4, y + 4, { width: fullTableWidth - 8 });
            y += rowHeight;
            doc.moveTo(startX, y).lineTo(startX + fullTableWidth, y).stroke();
        };

        // Menggambar satu blok kategori (misal "CPU" dgn 7 item) sebagai baris-baris,
        // dengan kolom NO + UNIT digambar sebagai SATU sel gabungan (merge) yang
        // membentang setinggi jumlah item di kategori itu, teks di-tengah vertikal.
        const drawCategoryBlock = (no, unitLabel, items) => {
            // pastikan seluruh blok muat di halaman yang sama (biar merge cell tidak terpotong halaman)
            const blockHeight = items.length * rowHeight;
            if (y + blockHeight > 730) {
                doc.addPage();
                y = 40;
            }
            const blockTopY = y;

            // baris per item: kolom uraian, alat, penerimaan, ok, nc, catatan
            let colX;
            items.forEach(item => {
                colX = startX + colWidths.no + colWidths.unit;
                const rowCells = [
                    [item.uraian_pekerjaan, colWidths.uraian],
                    [item.alat_yang_digunakan || '-', colWidths.alat],
                    [item.penerimaan_default || '-', colWidths.penerimaan],
                    [item.kondisi === 'OK' ? 'v' : '', colWidths.ok],
                    [item.kondisi === 'NC' ? (item.kondisi_huruf || 'v') : '', colWidths.nc],
                    [item.catatan || '', colWidths.catatan]
                ];
                doc.font('Helvetica').fontSize(8);
                rowCells.forEach(([text, w]) => {
                    doc.rect(colX, y, w, rowHeight).stroke();
                    doc.text(String(text), colX + 2, y + 4, { width: w - 4, height: rowHeight - 4 });
                    colX += w;
                });
                y += rowHeight;
            });

            // sel gabungan NO + UNIT, digambar terakhir supaya border-nya di atas garis-garis baris item
            doc.rect(startX, blockTopY, colWidths.no, blockHeight).stroke();
            doc.rect(startX + colWidths.no, blockTopY, colWidths.unit, blockHeight).stroke();
            const centerY = blockTopY + (blockHeight / 2) - 4;
            doc.font('Helvetica').fontSize(8);
            doc.text(String(no), startX + 2, centerY, { width: colWidths.no - 4, align: 'center' });
            doc.text(unitLabel, startX + colWidths.no + 2, centerY, { width: colWidths.unit - 4, align: 'center' });
        };

        const grouped = buildGroupedChecklist(checklist);
        drawHeaderRow();
        grouped.forEach(group => {
            if (group.header) drawGroupHeader(group.header);
            group.categoryBlocks.forEach((block, idx) => {
                const no = idx + 1; // reset ke 1 di tiap kelompok "Kode Assets"
                drawCategoryBlock(no, block.kategori_unit, block.items);
            });
        });

        y += 15;
        if (y > 680) { doc.addPage(); y = 40; }

        // 🔥 Kotak legenda Catatan & Kondisi NC — bingkai kotak luar + garis pemisah tengah
        const legendBoxTop = y;
        const legendBoxHeight = 42;
        const legendColWidth = 360;
        const legendBoxWidth = legendColWidth + 150;

        doc.rect(startX, legendBoxTop, legendBoxWidth, legendBoxHeight).stroke();
        doc.moveTo(startX + legendColWidth, legendBoxTop)
           .lineTo(startX + legendColWidth, legendBoxTop + legendBoxHeight)
           .stroke();

        doc.font('Helvetica-Bold').fontSize(7).text('Catatan:', startX + 4, y + 3);
        doc.font('Helvetica').fontSize(7);
        doc.text('B : Masih dapat beroperasi, dan masih bisa dipertahankan, sampai waktu disiapkan dan persiapan sparepart', startX + 4, y + 12, { width: legendColWidth - 8 });
        doc.text('C : Segera diperbaiki atau harus segera diperbaiki dan waktu perbaikan ditentukan ITS', startX + 4, y + 22, { width: legendColWidth - 8 });
        doc.text('D : Harus berhenti / tidak mampu berkerja', startX + 4, y + 32, { width: legendColWidth - 8 });

        doc.font('Helvetica-Bold').fontSize(7).text('Kondisi NC :', startX + legendColWidth + 4, y + 3);
        doc.font('Helvetica').fontSize(7);
        doc.text('B : Masih Baik', startX + legendColWidth + 4, y + 12);
        doc.text('C : Segera Diperbaiki', startX + legendColWidth + 4, y + 22);
        doc.text('D : Harus diganti', startX + legendColWidth + 4, y + 32);

        y += legendBoxHeight + 15;
        // 🔧 FIX: batas cek halaman dinaikkan (dari 700 jadi 640) karena
        // baris tanda tangan sekarang lebih tinggi (signature 45px + nama +
        // tanggal), supaya tidak kepotong di akhir halaman.
        if (y > 640) { doc.addPage(); y = 40; }

        doc.font('Helvetica-Bold').fontSize(9);
        doc.text('STATUS', startX, y, { width: 120 });
        doc.text('DIBUAT OLEH', startX + 120, y, { width: 120 });
        doc.text('DIKETAHUI (USER)', startX + 240, y, { width: 130 });
        doc.text('DISETUJUI (IT SERVICE)', startX + 370, y, { width: 130 });

        const yVal = y + 15;

        // 🔧 FIX: tanda tangan digambar lebih besar (lihat drawSignatureIfExists),
        // jadi jarak sebelum teks nama/tanggal di bawahnya ikut ditambah dari
        // +28 jadi +55, supaya tidak saling tumpuk.
        drawSignatureIfExists(doc, approval.ttd_dibuat_oleh, startX + 120, yVal);
        drawSignatureIfExists(doc, approval.ttd_diketahui_oleh, startX + 240, yVal);
        drawSignatureIfExists(doc, approval.ttd_disetujui_oleh, startX + 370, yVal);

        doc.font('Helvetica').fontSize(9);
        doc.text(ticket.status_pengerjaan || '-', startX, yVal + 55, { width: 120 });
        doc.text(
            `${approval.nama_dibuat_oleh || ticket.nama_teknisi || '-'}\n(${approval.tanggal_dibuat ? new Date(approval.tanggal_dibuat).toLocaleDateString('id-ID') : '-'})`,
            startX + 120, yVal + 55, { width: 120 }
        );
        doc.text(
            `${approval.nama_diketahui_oleh || '-'}\n(${approval.tanggal_diketahui ? new Date(approval.tanggal_diketahui).toLocaleDateString('id-ID') : '-'})`,
            startX + 240, yVal + 55, { width: 130 }
        );
        doc.text(
            `${approval.nama_disetujui_oleh || '-'}\n(${approval.tanggal_disetujui ? new Date(approval.tanggal_disetujui).toLocaleDateString('id-ID') : '-'})`,
            startX + 370, yVal + 55, { width: 130 }
        );

        doc.end();
    } catch (error) {
        console.error('downloadPdf error:', error);
        res.status(500).json({ message: 'Gagal generate PDF' });
    }
};