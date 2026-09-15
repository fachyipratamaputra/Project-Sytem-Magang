const db = require('./config/db');

// ============================================================
// 🔥 AMBIL NIK ADMIN
// ============================================================
async function getAdminNik() {
    const possibleRoleColumns = ['level', 'role', 'role_user', 'user_role', 'roles', 'jabatan'];
    let adminNik = null;
    for (const col of possibleRoleColumns) {
        try {
            const [rows] = await db.query(`
                SELECT nik FROM user WHERE ${col} = 'Admin' AND status = 'Aktif' LIMIT 1
            `);
            if (rows.length > 0) {
                adminNik = rows[0].nik;
                break;
            }
        } catch (err) { continue; }
    }
    if (adminNik) return adminNik;
    const [karyawan] = await db.query(`
        SELECT k.nik FROM karyawan k
        JOIN jabatan j ON k.id_jabatan = j.id_jabatan
        WHERE j.nama_jabatan LIKE '%Kepala%' OR j.nama_jabatan LIKE '%Manager%' OR j.nama_jabatan LIKE '%Supervisor%' LIMIT 1
    `);
    if (karyawan.length > 0) return karyawan[0].nik;
    const [anyKaryawan] = await db.query(`SELECT nik FROM karyawan LIMIT 1`);
    if (anyKaryawan.length > 0) return anyKaryawan[0].nik;
    throw new Error('❌ Tidak ada karyawan ditemukan.');
}

// ============================================================
// 🔥 GET ID TEKNISI (PAKAI TABEL TEKNISI)
// ============================================================
async function getTeknisiId(identifier) {
    if (!identifier) return null;
    // Langsung cari berdasarkan id_teknisi (string)
    const [rows] = await db.query(`SELECT id_teknisi FROM teknisi WHERE id_teknisi = ? AND status = 'Aktif'`, [identifier]);
    if (rows.length > 0) {
        console.log(`   ✅ Ditemukan teknisi: ${identifier}`);
        return rows[0].id_teknisi;
    }
    console.log(`   ⚠️ Teknisi "${identifier}" TIDAK ditemukan di tabel teknisi.`);
    return null;
}

// ============================================================
// 🔥 CEK APAKAH TEKNISI SEDANG BERTUGAS
// ============================================================
async function isTeknisiBusy(idTeknisi) {
    const [rows] = await db.query(`
        SELECT COUNT(*) AS count FROM assignment_ticket 
        WHERE id_teknisi = ? AND status_pengerjaan != 'Selesai'
    `, [idTeknisi]);
    return rows[0].count > 0;
}

// ============================================================
// 🔥 PROSES SCHEDULE PREVENTIVE
// ============================================================
async function processSchedules() {
    try {
        console.log('⏰ Cron job: Memproses schedule preventive...');
        console.log(`📅 Waktu server: ${new Date().toISOString()}`);

        const adminNik = await getAdminNik();
        console.log(`👤 Admin NIK: ${adminNik}`);

        // Ambil semua schedule aktif + aset
        const [schedules] = await db.query(`
            SELECT 
                s.id_schedule,
                s.nama_schedule,
                s.id_departemen,
                s.id_kategori,
                s.id_sub_kategori,
                s.frekuensi,
                s.satuan,
                s.id_teknis,
                s.deskripsi,
                sa.kode_asset
            FROM preventive_schedule s
            JOIN schedule_asset sa ON s.id_schedule = sa.id_schedule
            WHERE s.is_active = 1
        `);

        if (schedules.length === 0) {
            console.log('✅ Tidak ada schedule aktif.');
            return;
        }

        // Kelompokkan berdasarkan id_schedule
        const scheduleMap = new Map();
        for (const row of schedules) {
            if (!scheduleMap.has(row.id_schedule)) {
                scheduleMap.set(row.id_schedule, {
                    id_schedule: row.id_schedule,
                    nama_schedule: row.nama_schedule,
                    id_departemen: row.id_departemen,
                    id_kategori: row.id_kategori,
                    id_sub_kategori: row.id_sub_kategori,
                    frekuensi: row.frekuensi,
                    satuan: row.satuan,
                    id_teknis: row.id_teknis,
                    deskripsi: row.deskripsi,
                    assets: []
                });
            }
            scheduleMap.get(row.id_schedule).assets.push(row.kode_asset);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let anyCreated = false;

        for (const [id_schedule, schedule] of scheduleMap) {
            try {
                console.log(`🔍 Memeriksa schedule ID ${id_schedule}: "${schedule.nama_schedule}"`);

                // Ambil last_maintenance dari inventory
                const [lastMaintenanceRows] = await db.query(`
                    SELECT MAX(last_maintenance) AS last_maintenance
                    FROM inventory WHERE id_preventive_schedule = ?
                `, [id_schedule]);

                let lastMaintenance = lastMaintenanceRows[0]?.last_maintenance;
                let nextDate;

                if (lastMaintenance) {
                    const lastDate = new Date(lastMaintenance);
                    console.log(`   📅 Last maintenance: ${lastDate.toISOString().split('T')[0]}`);
                    nextDate = new Date(lastDate);
                    if (schedule.satuan === 'hari') nextDate.setDate(nextDate.getDate() + schedule.frekuensi);
                    else if (schedule.satuan === 'minggu') nextDate.setDate(nextDate.getDate() + (schedule.frekuensi * 7));
                    else if (schedule.satuan === 'bulan') nextDate.setMonth(nextDate.getMonth() + schedule.frekuensi);
                    else if (schedule.satuan === 'tahun') nextDate.setFullYear(nextDate.getFullYear() + schedule.frekuensi);
                    console.log(`   📅 Next maintenance: ${nextDate.toISOString().split('T')[0]}`);
                } else {
                    nextDate = new Date(today);
                    console.log(`   📅 Belum pernah maintenance, next = hari ini: ${nextDate.toISOString().split('T')[0]}`);
                }

                nextDate.setHours(0, 0, 0, 0);

                if (nextDate.getTime() !== today.getTime()) {
                    console.log(`   ⏭️ Tidak jatuh tempo (next: ${nextDate.toISOString().split('T')[0]})`);
                    continue;
                }

                console.log(`   🔔 JATUH TEMPO HARI INI!`);

                // 🔥 Parse teknisi list
                let teknisList = [];
                if (schedule.id_teknis) {
                    let rawTeknis = schedule.id_teknis;
                    try {
                        const parsed = JSON.parse(rawTeknis);
                        if (Array.isArray(parsed)) teknisList = parsed;
                        else teknisList = [parsed];
                    } catch {
                        teknisList = rawTeknis.split(',').map(s => s.trim()).filter(Boolean);
                    }
                }

                // 🔥 Cari teknisi yang tersedia
                const availableTeknis = [];
                for (const item of teknisList) {
                    const idTeknisi = await getTeknisiId(item);
                    if (idTeknisi) {
                        const isBusy = await isTeknisiBusy(idTeknisi);
                        if (!isBusy) {
                            availableTeknis.push(idTeknisi);
                            console.log(`   ✅ Teknisi ${item} tersedia`);
                        } else {
                            console.log(`   ⚠️ Teknisi ${item} sedang bertugas`);
                        }
                    } else {
                        console.warn(`   ⚠️ Teknisi "${item}" TIDAK ADA di tabel teknisi`);
                    }
                }

                if (availableTeknis.length === 0) {
                    console.warn(`   ⚠️ Tidak ada teknisi tersedia untuk schedule "${schedule.nama_schedule}", skip...`);
                    continue;
                }

                // Buat tiket untuk setiap aset
                for (const kodeAsset of schedule.assets) {
                    const idTicket = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;
                    const now = new Date();

                    // 🔥 INSERT KE LIST_TICKET
                    await db.query(`
                        INSERT INTO list_ticket 
                        (id_ticket, nik_pelapor, id_departemen, id_kategori, id_sub_kategori, kode_asset, deskripsi, lampiran, tanggal_lapor, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        idTicket,
                        adminNik,
                        schedule.id_departemen,
                        schedule.id_kategori || null,
                        schedule.id_sub_kategori || null,
                        kodeAsset,
                        `[PREVENTIVE] ${schedule.nama_schedule}${schedule.deskripsi ? ' - ' + schedule.deskripsi : ''}`,
                        null,
                        now,
                        'On Process'
                    ]);

                    // 🔥 ASSIGN KE TEKNISI PERTAMA
                    const idTeknisi = availableTeknis[0];
                    await db.query(`
                        INSERT INTO assignment_ticket (id_ticket, id_teknisi, tanggal_assign, progress, status_pengerjaan)
                        VALUES (?, ?, ?, 0, 'Menunggu Diproses')
                    `, [idTicket, idTeknisi, now]);
                    console.log(`      ↳ Tiket di-assign ke teknisi ID: ${idTeknisi}`);

                    // Update inventory
                    const nextMaintenanceDate = new Date(now);
                    if (schedule.satuan === 'hari') nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + schedule.frekuensi);
                    else if (schedule.satuan === 'minggu') nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + (schedule.frekuensi * 7));
                    else if (schedule.satuan === 'bulan') nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + schedule.frekuensi);
                    else if (schedule.satuan === 'tahun') nextMaintenanceDate.setFullYear(nextMaintenanceDate.getFullYear() + schedule.frekuensi);
                    const nextMaintenanceStr = nextMaintenanceDate.toISOString().split('T')[0];

                    await db.query(`
                        UPDATE inventory 
                        SET last_maintenance = ?, next_maintenance = ?
                        WHERE kode_asset = ?
                    `, [now.toISOString().split('T')[0], nextMaintenanceStr, kodeAsset]);

                    console.log(`   ✅ Tiket ${idTicket} dibuat untuk aset ${kodeAsset} -> teknisi ${idTeknisi}`);
                    anyCreated = true;
                }

            } catch (err) {
                console.error(`❌ Error pada schedule ID ${id_schedule}:`, err);
                continue;
            }
        }

        if (anyCreated) {
            console.log('✅ Cron job selesai – tiket berhasil dibuat.');
        } else {
            console.log('✅ Cron job selesai – tidak ada tiket yang dibuat hari ini.');
        }

    } catch (error) {
        console.error('❌ Cron job error:', error);
    }
}

// ============================================================
// 🔥 CRON JALAN OTOMATIS SETIAP HARI JAM 08:00 WIB
// ============================================================
const cron = require('node-cron');
cron.schedule('0 8 * * *', () => {
    console.log('🕒 [CRON] Triggered at 08:00 WIB');
    processSchedules();
});

console.log('🕒 Cron job schedule preventive diaktifkan (setiap hari jam 08:00 WIB)');

module.exports = { processSchedules };