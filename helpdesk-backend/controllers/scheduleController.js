const db = require('../config/db');

// ============================================================
// 🔥 FUNGSI AUTO-CREATE TICKET (UNTUK SATU SCHEDULE)
// 🔥 DITAMBAH: generate ticket_checklist_result sesuai checklist_kategori
// 🔥 DITAMBAH: next_maintenance dihitung dari tanggal_selesai (jika ada),
// fallback ke frekuensi+satuan (untuk data lama sebelum kolom
// tanggal_mulai/tanggal_selesai ditambahkan).
// 🔧 FIXED: id_teknisi di tabel teknisi berformat string (mis. "TKN-0009"),
// bukan angka murni. Sebelumnya ada pengecekan `!isNaN(item)` sebelum
// query by id_teknisi, sehingga match by ID selalu di-skip (karena
// "TKN-0009" dianggap bukan angka) dan berlanjut ke fallback nama/nik
// yang otomatis gagal juga → teknisiIds selalu kosong → function
// return lebih awal tanpa membuat ticket/assignment sama sekali.
// 🔧 FIXED (BARU): INSERT ke list_ticket sekarang menyertakan kolom
// id_schedule, supaya tiket yang dibuat bisa dibedakan dari tiket
// schedule LAIN yang kebetulan memakai aset (kode_asset) yang sama.
// Tanpa ini, subquery status di bawah (SCHEDULE_STATUS_FIELDS) bisa
// salah menghitung tiket lama sebagai milik schedule baru.
// 🔧 FIXED (BARU — bug tiket duplikat saat updateSchedule dipanggil
// berkali-kali): setiap iterasi aset sekarang di-guard, SKIP kalau
// aset itu sudah punya tiket untuk schedule ini. Sebelumnya
// updateSchedule() memanggil autoCreateTicketsForSchedule() lagi
// setiap kali schedule diedit & disimpan (asal is_active=1 &
// id_teknis terisi), sehingga aset yang sudah pernah dapat tiket
// (mis. dari klaim manual) dibuatkan tiket KEDUA yang tidak pernah
// diproses/dikonfirmasi — ini yang menyebabkan bug "user_confirmed
// selalu 0 walau semua aset sudah di-approve user" (lihat komentar
// panjang di SCHEDULE_STATUS_FIELDS di bawah).
// ============================================================
async function autoCreateTicketsForSchedule(scheduleId) {
    try {
        console.log(`🚀 Auto-create tiket untuk schedule ID: ${scheduleId}`);

        const [schedules] = await db.query(`
            SELECT 
                s.id_schedule,
                s.nama_schedule,
                s.id_departemen,
                s.id_kategori,
                s.id_sub_kategori,
                s.id_teknis,
                s.deskripsi,
                s.frekuensi,
                s.satuan,
                s.tanggal_mulai,
                s.tanggal_selesai,
                s.checklist_kategori
            FROM preventive_schedule s
            WHERE s.id_schedule = ?
        `, [scheduleId]);

        if (schedules.length === 0) {
            console.log(`❌ Schedule ${scheduleId} tidak ditemukan`);
            return;
        }

        const schedule = schedules[0];

        let checklistKategoriList = [];
        try {
            if (schedule.checklist_kategori) checklistKategoriList = JSON.parse(schedule.checklist_kategori);
            if (!Array.isArray(checklistKategoriList)) checklistKategoriList = [];
        } catch {
            checklistKategoriList = [];
        }

        const [assets] = await db.query(`
            SELECT kode_asset FROM schedule_asset WHERE id_schedule = ?
        `, [scheduleId]);

        if (assets.length === 0) {
            console.log(`⚠️ Schedule ${scheduleId} tidak memiliki aset`);
            return;
        }

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

        if (teknisList.length === 0) {
            console.log(`⚠️ Schedule ${scheduleId} tidak memiliki teknisi`);
            return;
        }

        const [adminRows] = await db.query(`
            SELECT nik FROM user WHERE level = 'Admin' AND status = 'Aktif' LIMIT 1
        `);
        const adminNik = adminRows.length > 0 ? adminRows[0].nik : null;
        if (!adminNik) {
            console.log(`❌ Tidak ada admin ditemukan, skip auto-create`);
            return;
        }

        const teknisiIds = [];
        for (const item of teknisList) {
            let idTeknisi = null;

            const [byId] = await db.query(
                `SELECT id_teknisi FROM teknisi WHERE id_teknisi = ? AND status = 'Aktif'`,
                [item]
            );
            if (byId.length > 0) idTeknisi = byId[0].id_teknisi;

            if (!idTeknisi) {
                const [byNama] = await db.query(`
                    SELECT t.id_teknisi 
                    FROM teknisi t
                    JOIN karyawan k ON t.nik = k.nik
                    WHERE k.nama = ? AND t.status = 'Aktif'
                    LIMIT 1
                `, [item]);
                if (byNama.length > 0) idTeknisi = byNama[0].id_teknisi;
            }

            if (!idTeknisi) {
                const [byNik] = await db.query(
                    `SELECT id_teknisi FROM teknisi WHERE nik = ? AND status = 'Aktif'`,
                    [item]
                );
                if (byNik.length > 0) idTeknisi = byNik[0].id_teknisi;
            }

            if (idTeknisi) {
                teknisiIds.push(idTeknisi);
            } else {
                console.log(`⚠️ Gagal resolve teknisi untuk item: "${item}" (schedule ${scheduleId})`);
            }
        }

        if (teknisiIds.length === 0) {
            console.log(`⚠️ Tidak ada teknisi valid untuk schedule ${scheduleId}`);
            return;
        }

        let checklistItems = [];
        if (checklistKategoriList.length > 0) {
            const placeholders = checklistKategoriList.map(() => '?').join(',');
            const [items] = await db.query(
                `SELECT id_item FROM checklist_template WHERE kategori_unit IN (${placeholders})`,
                checklistKategoriList
            );
            checklistItems = items;
        }

        const now = new Date();

        let nextMaintenanceStr;
        if (schedule.tanggal_selesai) {
            nextMaintenanceStr = new Date(schedule.tanggal_selesai).toISOString().split('T')[0];
        } else {
            const nextDate = new Date(now);
            const { frekuensi, satuan } = schedule;
            if (satuan === 'hari') nextDate.setDate(nextDate.getDate() + frekuensi);
            else if (satuan === 'minggu') nextDate.setDate(nextDate.getDate() + (frekuensi * 7));
            else if (satuan === 'bulan') nextDate.setMonth(nextDate.getMonth() + frekuensi);
            else if (satuan === 'tahun') nextDate.setFullYear(nextDate.getFullYear() + frekuensi);
            nextMaintenanceStr = nextDate.toISOString().split('T')[0];
        }

        for (const asset of assets) {
            // 🔥 GUARD BARU: skip kalau aset ini sudah punya tiket untuk
            // schedule yang sama — mencegah tiket duplikat saat function
            // ini terpanggil ulang (mis. dari updateSchedule / toggleActive).
            const [existing] = await db.query(
                `SELECT 1 FROM list_ticket WHERE id_schedule = ? AND kode_asset = ? LIMIT 1`,
                [scheduleId, asset.kode_asset]
            );
            if (existing.length > 0) {
                console.log(`⏭️ Skip ${asset.kode_asset}, tiket untuk schedule ${scheduleId} sudah ada`);
                continue;
            }

            const idTicket = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;

            await db.query(`
                INSERT INTO list_ticket 
                (id_ticket, nik_pelapor, id_departemen, id_kategori, id_sub_kategori, kode_asset, deskripsi, lampiran, tanggal_lapor, status, id_schedule)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                idTicket,
                adminNik,
                schedule.id_departemen,
                schedule.id_kategori || null,
                schedule.id_sub_kategori || null,
                asset.kode_asset,
                `[PREVENTIVE] ${schedule.nama_schedule}${schedule.deskripsi ? ' - ' + schedule.deskripsi : ''}`,
                null,
                now,
                'On Process',
                scheduleId
            ]);

            const idTeknisi = teknisiIds[0];
            await db.query(`
                INSERT INTO assignment_ticket (id_ticket, id_teknisi, tanggal_assign, progress, status_pengerjaan)
                VALUES (?, ?, ?, 0, 'Menunggu Diproses')
            `, [idTicket, idTeknisi, now]);

            if (checklistItems.length > 0) {
                for (const item of checklistItems) {
                    await db.query(
                        `INSERT INTO ticket_checklist_result (id_ticket, id_item) VALUES (?, ?)`,
                        [idTicket, item.id_item]
                    );
                }
            }

            await db.query(`
                UPDATE inventory 
                SET id_preventive_schedule = COALESCE(id_preventive_schedule, ?),
                    next_maintenance = ?
                WHERE kode_asset = ?
            `, [scheduleId, nextMaintenanceStr, asset.kode_asset]);

            console.log(`✅ Tiket ${idTicket} dibuat untuk aset ${asset.kode_asset} -> teknisi ${idTeknisi} (checklist: ${checklistItems.length} item)`);
        }

        console.log(`🎯 Auto-create selesai untuk schedule ${scheduleId}`);

    } catch (error) {
        console.error(`❌ Gagal auto-create ticket untuk schedule ${scheduleId}:`, error);
    }
}

// ============================================================
// 🔥 BARU — buat ticket untuk SATU asset saja (dipakai saat teknisi
// klik & ambil 1 asset spesifik dari modal detail, bukan seluruh schedule)
// status_pengerjaan langsung 'Proses' (BUKAN 'Menunggu Diproses') supaya
// ticket ini langsung lolos filter di proses.page.ts dan Check Sheet
// bisa langsung auto-terbuka begitu teknisi diarahkan ke /teknisi/proses.
// 🔧 FIXED: INSERT ke list_ticket sekarang menyertakan id_schedule juga
// (sama seperti autoCreateTicketsForSchedule di atas).
//
// ⚠️ CATATAN (progress default = 0): dengan skema BARU (lihat
// SCHEDULE_STATUS_FIELDS di bawah), "started_aset" sekarang dihitung
// dari tabel schedule_asset_claim (klaim), BUKAN dari progress > 0.
// Jadi progress = 0 di sini tidak lagi masalah untuk status Gantt —
// klaim tetap dianggap "started" begitu ADA aset di schedule yang sudah
// diklaim (lihat attachStatus di bawah). progress tetap dipakai terpisah
// untuk hal lain (mis. kolom "progress" rata-rata di
// getDepartmentsWithSchedules), jadi jangan diubah jadi > 0 di sini
// tanpa alasan lain.
// ============================================================
async function createTicketForSingleAsset(scheduleId, kodeAsset, idTeknisi) {
    const [schedules] = await db.query(
        `SELECT * FROM preventive_schedule WHERE id_schedule = ?`, [scheduleId]
    );
    if (schedules.length === 0) throw new Error('Schedule tidak ditemukan');
    const schedule = schedules[0];

    let checklistKategoriList = [];
    try {
        if (schedule.checklist_kategori) checklistKategoriList = JSON.parse(schedule.checklist_kategori);
        if (!Array.isArray(checklistKategoriList)) checklistKategoriList = [];
    } catch {
        checklistKategoriList = [];
    }

    const [adminRows] = await db.query(
        `SELECT nik FROM user WHERE level = 'Admin' AND status = 'Aktif' LIMIT 1`
    );
    if (adminRows.length === 0) throw new Error('Tidak ada admin ditemukan');
    const adminNik = adminRows[0].nik;

    const now = new Date();
    const idTicket = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;

    await db.query(`
        INSERT INTO list_ticket
        (id_ticket, nik_pelapor, id_departemen, id_kategori, id_sub_kategori, kode_asset, deskripsi, lampiran, tanggal_lapor, status, id_schedule)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        idTicket, adminNik, schedule.id_departemen,
        schedule.id_kategori || null, schedule.id_sub_kategori || null,
        kodeAsset,
        `[PREVENTIVE] ${schedule.nama_schedule}${schedule.deskripsi ? ' - ' + schedule.deskripsi : ''}`,
        null, now, 'On Process',
        scheduleId
    ]);

    await db.query(`
        INSERT INTO assignment_ticket (id_ticket, id_teknisi, tanggal_assign, progress, status_pengerjaan)
        VALUES (?, ?, ?, 0, 'Proses')
    `, [idTicket, idTeknisi, now]);

    if (checklistKategoriList.length > 0) {
        const placeholders = checklistKategoriList.map(() => '?').join(',');
        const [items] = await db.query(
            `SELECT id_item FROM checklist_template WHERE kategori_unit IN (${placeholders})`,
            checklistKategoriList
        );
        for (const item of items) {
            await db.query(
                `INSERT INTO ticket_checklist_result (id_ticket, id_item) VALUES (?, ?)`,
                [idTicket, item.id_item]
            );
        }
    }

    const nextMaintenanceStr = schedule.tanggal_selesai
        ? new Date(schedule.tanggal_selesai).toISOString().split('T')[0]
        : null;
    await db.query(`
        UPDATE inventory
        SET id_preventive_schedule = COALESCE(id_preventive_schedule, ?), next_maintenance = ?
        WHERE kode_asset = ?
    `, [scheduleId, nextMaintenanceStr, kodeAsset]);

    return idTicket;
}

// ============================================================
// 🔥 hitung status agregat 1 schedule berdasarkan klaim & progress
// aset-asetnya secara nyata. Dipasang ke tiap row hasil query schedules
// sebelum dikirim ke frontend.
//   - completed_aset === total_aset (dan total > 0) -> 'approve' / 'userapprove'
//   - started_aset  >= 1 (dan total > 0)             -> 'progress' (oranye)
//   - selain itu (belum ada aset yang diklaim)        -> 'plan' (abu-abu)
//
// 🔧 FIXED (BARU — permintaan user: begitu MINIMAL 1 asset dalam
// schedule sedang dikerjakan/diklaim teknisi, SELURUH bar schedule
// langsung berubah oranye, TIDAK perlu menunggu semua aset diklaim
// dulu):
// Kondisi sebelumnya `started >= total` (SEMUA aset harus diklaim dulu
// baru oranye) sengaja diganti balik jadi `started >= 1` (ADA aset yang
// diklaim/dikerjakan, langsung oranye) sesuai permintaan terbaru.
// Kondisi hijau (completed >= total, SEMUA aset selesai) TIDAK diubah —
// tetap butuh semua aset selesai baru jadi hijau.
// `started_aset` sendiri tetap dihitung dari schedule_asset_claim
// (jumlah aset yang sudah diklaim SIAPAPUN) — lihat SCHEDULE_STATUS_FIELDS
// di bawah, bukan dari progress assignment_ticket.
// ============================================================
function attachStatus(schedule) {
    const total = Number(schedule.total_aset) || 0;
    const started = Number(schedule.started_aset) || 0;
    const completed = Number(schedule.completed_aset) || 0;

    if (total > 0 && completed >= total) {
        schedule.status = (schedule.user_confirmed === 1 || schedule.user_confirmed === true)
            ? 'userapprove'
            : 'approve';
    } else if (total > 0 && started >= 1) {
        // 🔧 BARU: dulu `started >= total`, sekarang `started >= 1`
        // (MINIMAL 1 aset di schedule ini sudah diklaim/dikerjakan,
        // langsung dianggap 'progress' / oranye)
        schedule.status = 'progress';
    } else {
        schedule.status = 'plan';
    }

    // 🔥 hitung "siapa ngerjain berapa aset" dari daftar nama mentah
    // (teknisi_klaim_raw: "Bagas,Bagas,Putra"), lalu format jadi
    // "Bagas:2||Putra:1" untuk dikonsumsi frontend. Dihitung di sini
    // (bukan di SQL) untuk menghindari limitasi derived table MySQL.
    if (schedule.teknisi_klaim_raw) {
        const names = schedule.teknisi_klaim_raw
            .split(',')
            .map((n) => n.trim())
            .filter(Boolean);
        const counts = {};
        names.forEach((n) => {
            counts[n] = (counts[n] || 0) + 1;
        });
        schedule.teknisi_klaim = Object.entries(counts)
            .map(([nama, jumlah]) => `${nama}:${jumlah}`)
            .join('||');
    } else {
        schedule.teknisi_klaim = null;
    }
    delete schedule.teknisi_klaim_raw;

    return schedule;
}

// SQL fragment dipakai bersama di getDepartmentsWithSchedules & getSchedulesByDepartment.
//
// 🔧 FIXED (ROOT CAUSE BUG "bar langsung hijau saat schedule baru dibuat"):
// Semua subquery yang join ke list_ticket menyertakan "AND ltX.id_schedule
// = s.id_schedule", supaya tidak nyasar menghitung tiket lama dari
// schedule LAIN yang kebetulan memakai aset yang sama.
//
// started_aset dihitung LANGSUNG dari schedule_asset_claim (tabel klaim
// per-asset), BUKAN dari keberadaan assignment_ticket dengan progress > 0:
//     started_aset = jumlah aset UNIK yang SUDAH diklaim (siapapun teknisinya)
// Nilai ini dipakai attachStatus() di atas untuk menentukan status
// 'progress' (lihat komentar attachStatus).
const SCHEDULE_STATUS_FIELDS = `
    (SELECT COUNT(*) FROM schedule_asset WHERE id_schedule = s.id_schedule) AS total_aset,

    -- data mentah klaim per-asset (schedule_asset_claim) — nama teknisi
    -- muncul 1x per aset yang dia klaim (bukan di-GROUP di SQL).
    -- pakai correlated subquery langsung (bukan derived table di FROM),
    -- karena MySQL tidak mengizinkan derived table merujuk kolom query luar.
    -- Hasilnya di-GROUP & dihitung jumlahnya di JS lewat attachStatus().
    (SELECT GROUP_CONCAT(kar.nama SEPARATOR ',')
     FROM schedule_asset_claim sac
     JOIN teknisi tk ON tk.id_teknisi = sac.id_teknisi
     JOIN karyawan kar ON kar.nik = tk.nik
     WHERE sac.id_schedule = s.id_schedule
    ) AS teknisi_klaim_raw,

    -- started_aset = jumlah aset UNIK yang sudah punya baris klaim di
    -- schedule_asset_claim untuk schedule ini — TIDAK bergantung pada
    -- progress assignment_ticket.
    (SELECT COUNT(DISTINCT sac2.kode_asset)
     FROM schedule_asset_claim sac2
     WHERE sac2.id_schedule = s.id_schedule) AS started_aset,

    -- completed_aset: aset yang tiketnya (milik schedule INI) sudah
    -- selesai / progress 100.
    (SELECT COUNT(DISTINCT lt3.kode_asset)
     FROM schedule_asset sa3 
     JOIN inventory i3 ON sa3.kode_asset = i3.kode_asset
     JOIN list_ticket lt3 ON lt3.kode_asset = i3.kode_asset AND lt3.id_schedule = s.id_schedule
     JOIN assignment_ticket asg2 ON asg2.id_ticket = lt3.id_ticket
     WHERE sa3.id_schedule = s.id_schedule
       AND (asg2.progress = 100 OR asg2.status_pengerjaan = 'Selesai')) AS completed_aset,

    -- 🔧 FIXED (BARU — bug "semua asset sudah di-approve user tapi bar
    -- tetap tidak berubah biru"): sebelumnya query ini menghitung PER
    -- BARIS TIKET (COUNT(*) / SUM(...)), bukan per asset. Kalau ada 1
    -- asset saja yang kebetulan punya LEBIH DARI 1 baris tiket untuk
    -- schedule yang sama (mis. karena autoCreateTicketsForSchedule
    -- sempat terpanggil ulang lewat updateSchedule/toggleActive dan
    -- membuat tiket duplikat untuk asset yang sudah punya tiket dari
    -- klaim manual), maka COUNT(*) ikut menghitung tiket duplikat yang
    -- tidak pernah selesai/dikonfirmasi, sehingga SUM(...) < COUNT(*)
    -- SELAMANYA -> user_confirmed selalu 0 walau secara nyata semua
    -- asset sudah di-approve user. FIX: hitung berdasarkan
    -- COUNT(DISTINCT kode_asset) per asset (sama seperti completed_aset
    -- di atas) — cukup SALAH SATU tiket per asset yang Selesai +
    -- user_konfirmasi = 1, asset itu dianggap sudah dikonfirmasi.
    -- (Guard anti-duplikat baru di autoCreateTicketsForSchedule juga
    -- mencegah penyebab akarnya supaya tidak muncul lagi ke depan.)
    (SELECT 
        CASE 
            WHEN COUNT(DISTINCT sa7.kode_asset) = 0 THEN 0
            WHEN COUNT(DISTINCT CASE 
                    WHEN asg7.status_pengerjaan = 'Selesai' AND asg7.user_konfirmasi = 1 
                    THEN sa7.kode_asset 
                 END) = COUNT(DISTINCT sa7.kode_asset) THEN 1
            ELSE 0
        END
     FROM schedule_asset sa7 
     JOIN inventory i7 ON sa7.kode_asset = i7.kode_asset
     JOIN list_ticket lt7 ON lt7.kode_asset = i7.kode_asset AND lt7.id_schedule = s.id_schedule
     JOIN assignment_ticket asg7 ON asg7.id_ticket = lt7.id_ticket
     WHERE sa7.id_schedule = s.id_schedule) AS user_confirmed,

    (SELECT GROUP_CONCAT(DISTINCT DATE(tpl.created_at) ORDER BY tpl.created_at ASC SEPARATOR ', ')
     FROM schedule_asset sa5 
     JOIN inventory i5 ON sa5.kode_asset = i5.kode_asset
     JOIN list_ticket lt5 ON lt5.kode_asset = i5.kode_asset AND lt5.id_schedule = s.id_schedule
     JOIN assignment_ticket asg5 ON asg5.id_ticket = lt5.id_ticket
     JOIN ticket_progress_log tpl ON tpl.id_assignment = asg5.id_assignment
     WHERE sa5.id_schedule = s.id_schedule) AS progress_dates,

    (SELECT MAX(asg6.progress)
     FROM schedule_asset sa6 
     JOIN inventory i6 ON sa6.kode_asset = i6.kode_asset
     JOIN list_ticket lt6 ON lt6.kode_asset = i6.kode_asset AND lt6.id_schedule = s.id_schedule
     JOIN assignment_ticket asg6 ON asg6.id_ticket = lt6.id_ticket
     WHERE sa6.id_schedule = s.id_schedule) AS max_progress
`;

// ============================================================
// GET semua departemen + schedules (untuk halaman utama)
// ============================================================
exports.getDepartmentsWithSchedules = async (req, res) => {
    try {
        const [departments] = await db.query(`
            SELECT id_departemen, nama_departemen FROM departemen ORDER BY nama_departemen
        `);
        const result = [];
        for (const dept of departments) {
            const [schedules] = await db.query(`
                SELECT 
                    s.id_schedule,
                    s.nama_schedule,
                    s.frekuensi,
                    s.satuan,
                    s.tanggal_mulai,
                    s.tanggal_selesai,
                    s.deskripsi,
                    s.is_active,
                    s.created_at,
                    s.checklist_kategori,
                    k.nama_kategori,
                    sk.nama_sub_kategori,
                    (SELECT GROUP_CONCAT(DISTINCT kar.nama SEPARATOR ', ') 
                     FROM teknisi t 
                     JOIN karyawan kar ON t.nik = kar.nik 
                     WHERE FIND_IN_SET(t.id_teknisi, s.id_teknis) > 0) AS teknisi_list,
                    (SELECT MAX(last_maintenance) FROM inventory WHERE id_preventive_schedule = s.id_schedule) AS last_maintenance,
                    (SELECT MIN(next_maintenance) FROM inventory WHERE id_preventive_schedule = s.id_schedule) AS next_maintenance,

                    (SELECT ROUND(AVG(asg.progress), 0)
                     FROM schedule_asset sa2 
                     JOIN inventory i2 ON sa2.kode_asset = i2.kode_asset
                     JOIN list_ticket lt2 ON lt2.kode_asset = i2.kode_asset AND lt2.id_schedule = s.id_schedule
                     JOIN assignment_ticket asg ON asg.id_ticket = lt2.id_ticket
                     WHERE sa2.id_schedule = s.id_schedule
                       AND asg.status_pengerjaan != 'Selesai') AS progress,

                    ${SCHEDULE_STATUS_FIELDS}

                FROM preventive_schedule s
                LEFT JOIN kategori k ON s.id_kategori = k.id_kategori
                LEFT JOIN sub_kategori sk ON s.id_sub_kategori = sk.id_sub_kategori
                WHERE s.id_departemen = ?
                ORDER BY s.is_active DESC, s.created_at DESC
            `, [dept.id_departemen]);

            schedules.forEach(attachStatus);

            result.push({
                id_departemen: dept.id_departemen,
                nama_departemen: dept.nama_departemen,
                schedules: schedules,
                total_aktif: schedules.filter(s => s.is_active).length
            });
        }
        res.json(result);
    } catch (error) {
        console.error('getDepartmentsWithSchedules error:', error);
        res.status(500).json({ message: 'Gagal mengambil data' });
    }
};

// ============================================================
// GET schedules by department ID
// ============================================================
exports.getSchedulesByDepartment = async (req, res) => {
    try {
        const { deptId } = req.params;
        const [rows] = await db.query(`
            SELECT 
                s.id_schedule,
                s.nama_schedule,
                s.frekuensi,
                s.satuan,
                s.tanggal_mulai,
                s.tanggal_selesai,
                s.deskripsi,
                s.is_active,
                s.created_at,
                s.checklist_kategori,
                k.nama_kategori,
                sk.nama_sub_kategori,
                (SELECT GROUP_CONCAT(DISTINCT kar.nama SEPARATOR ', ') 
                 FROM teknisi t 
                 JOIN karyawan kar ON t.nik = kar.nik 
                 WHERE FIND_IN_SET(t.id_teknisi, s.id_teknis) > 0) AS teknisi_list,
                (SELECT MAX(last_maintenance) FROM inventory WHERE id_preventive_schedule = s.id_schedule) AS last_maintenance,
                (SELECT MIN(next_maintenance) FROM inventory WHERE id_preventive_schedule = s.id_schedule) AS next_maintenance,

                (SELECT ROUND(AVG(asg.progress), 0)
                 FROM schedule_asset sa2 
                 JOIN inventory i2 ON sa2.kode_asset = i2.kode_asset
                 JOIN list_ticket lt2 ON lt2.kode_asset = i2.kode_asset AND lt2.id_schedule = s.id_schedule
                 JOIN assignment_ticket asg ON asg.id_ticket = lt2.id_ticket
                 WHERE sa2.id_schedule = s.id_schedule
                   AND asg.status_pengerjaan != 'Selesai') AS progress,

                ${SCHEDULE_STATUS_FIELDS}

            FROM preventive_schedule s
            LEFT JOIN kategori k ON s.id_kategori = k.id_kategori
            LEFT JOIN sub_kategori sk ON s.id_sub_kategori = sk.id_sub_kategori
            WHERE s.id_departemen = ?
            ORDER BY s.is_active DESC, s.created_at DESC
        `, [deptId]);

        rows.forEach(attachStatus);

        res.json(rows);
    } catch (error) {
        console.error('getSchedulesByDepartment error:', error);
        res.status(500).json({ message: 'Gagal mengambil schedule' });
    }
};

// ============================================================
// GET aset by schedule ID
// 🔥 info klaim per-asset (claimed_by_id_teknisi, claimed_by_nama,
// claimed_ticket_id) dari tabel schedule_asset_claim, dipakai frontend untuk
// menampilkan tombol "Ambil Asset" atau badge "Diklaim: <nama>"
// semua subquery yang join ke list_ticket mensyaratkan lt.id_schedule =
// sa.id_schedule, supaya tidak nyasar ke tiket schedule LAIN untuk aset
// yang sama.
// field id_ticket ditambahkan (id_ticket milik schedule INI untuk aset
// ini) — dipakai frontend (modal Check Sheet) supaya tidak salah ambil
// tiket dari schedule lain.
// ============================================================
exports.getAssetsBySchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
            SELECT 
                i.kode_asset,
                i.nama_barang,
                i.merk_model,
                i.last_maintenance,
                i.next_maintenance,
                d.nama_departemen,
                kat.nama_kategori,
                kar.nama AS pemegang,

                s.created_at AS tanggal_dibuat,

                (SELECT MIN(asg.tanggal_assign)
                 FROM list_ticket lt
                 JOIN assignment_ticket asg ON asg.id_ticket = lt.id_ticket
                 WHERE lt.kode_asset = i.kode_asset AND lt.id_schedule = sa.id_schedule) AS tanggal_mulai_progress,

                (SELECT MAX(tpl.created_at)
                 FROM list_ticket lt2
                 JOIN assignment_ticket asg2 ON asg2.id_ticket = lt2.id_ticket
                 JOIN ticket_progress_log tpl ON tpl.id_assignment = asg2.id_assignment
                 WHERE lt2.kode_asset = i.kode_asset AND lt2.id_schedule = sa.id_schedule) AS tanggal_selesai_progress,

                (SELECT asg3.status_pengerjaan
                 FROM list_ticket lt3
                 JOIN assignment_ticket asg3 ON asg3.id_ticket = lt3.id_ticket
                 WHERE lt3.kode_asset = i.kode_asset AND lt3.id_schedule = sa.id_schedule
                 ORDER BY asg3.tanggal_assign DESC LIMIT 1) AS status_pengerjaan_asset,

                (SELECT asg4.user_konfirmasi
                 FROM list_ticket lt4
                 JOIN assignment_ticket asg4 ON asg4.id_ticket = lt4.id_ticket
                 WHERE lt4.kode_asset = i.kode_asset AND lt4.id_schedule = sa.id_schedule
                 ORDER BY asg4.tanggal_assign DESC LIMIT 1) AS user_konfirmasi,

                (SELECT asg5.tanggal_konfirmasi_user
                 FROM list_ticket lt5
                 JOIN assignment_ticket asg5 ON asg5.id_ticket = lt5.id_ticket
                 WHERE lt5.kode_asset = i.kode_asset AND lt5.id_schedule = sa.id_schedule
                 ORDER BY asg5.tanggal_assign DESC LIMIT 1) AS tanggal_konfirmasi_user,

                (SELECT asg6.catatan_penyelesaian
                 FROM list_ticket lt6
                 JOIN assignment_ticket asg6 ON asg6.id_ticket = lt6.id_ticket
                 WHERE lt6.kode_asset = i.kode_asset AND lt6.id_schedule = sa.id_schedule
                 ORDER BY asg6.tanggal_assign DESC LIMIT 1) AS catatan_penyelesaian,

                -- id_ticket milik schedule INI untuk aset ini, supaya
                -- Check Sheet / checklist bisa dicari dengan benar
                (SELECT lt7.id_ticket
                 FROM list_ticket lt7
                 WHERE lt7.kode_asset = i.kode_asset AND lt7.id_schedule = sa.id_schedule
                 ORDER BY lt7.tanggal_lapor DESC LIMIT 1) AS id_ticket,

                sac.id_teknisi AS claimed_by_id_teknisi,
                karClaim.nama AS claimed_by_nama,
                sac.id_ticket AS claimed_ticket_id

            FROM schedule_asset sa
            JOIN inventory i ON sa.kode_asset = i.kode_asset
            JOIN preventive_schedule s ON sa.id_schedule = s.id_schedule
            LEFT JOIN departemen d ON i.id_departemen = d.id_departemen
            LEFT JOIN kategori kat ON i.id_kategori = kat.id_kategori
            LEFT JOIN karyawan kar ON i.nik_pemegang = kar.nik
            LEFT JOIN schedule_asset_claim sac ON sac.id_schedule = sa.id_schedule AND sac.kode_asset = i.kode_asset
            LEFT JOIN teknisi tkClaim ON tkClaim.id_teknisi = sac.id_teknisi
            LEFT JOIN karyawan karClaim ON karClaim.nik = tkClaim.nik
            WHERE sa.id_schedule = ?
            ORDER BY i.nama_barang
        `, [id]);
        res.json(rows);
    } catch (error) {
        console.error('getAssetsBySchedule error:', error);
        res.status(500).json({ message: 'Gagal mengambil aset' });
    }
};

// ============================================================
// GET semua aset yang tersedia
// ============================================================
exports.getAvailableAssets = async (req, res) => {
    try {
        const { deptId, kategoriId } = req.query;
        let query = `
            SELECT 
                i.kode_asset, 
                i.nama_barang, 
                i.merk_model, 
                i.id_departemen, 
                i.id_kategori,
                d.nama_departemen,
                kat.nama_kategori
            FROM inventory i
            LEFT JOIN departemen d ON i.id_departemen = d.id_departemen
            LEFT JOIN kategori kat ON i.id_kategori = kat.id_kategori
            WHERE 1=1
        `;
        const params = [];
        if (deptId) {
            query += ` AND i.id_departemen = ?`;
            params.push(deptId);
        }
        if (kategoriId) {
            query += ` AND i.id_kategori = ?`;
            params.push(kategoriId);
        }
        query += ` ORDER BY i.nama_barang`;
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('getAvailableAssets error:', error);
        res.status(500).json({ message: 'Gagal mengambil aset' });
    }
};

// ============================================================
// CREATE schedule + AUTO-CREATE TICKET
// ============================================================
exports.createSchedule = async (req, res) => {
    try {
        const { 
            nama_schedule, 
            id_departemen, 
            id_kategori, 
            id_sub_kategori, 
            tanggal_mulai,
            tanggal_selesai,
            id_teknis, 
            deskripsi,
            aset_list,
            checklist_kategori
        } = req.body;

        if (!nama_schedule || !id_departemen || !tanggal_mulai || !tanggal_selesai) {
            return res.status(400).json({ message: 'Field wajib: nama_schedule, id_departemen, tanggal_mulai, tanggal_selesai' });
        }

        const start = new Date(tanggal_mulai);
        const end = new Date(tanggal_selesai);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Format tanggal_mulai / tanggal_selesai tidak valid' });
        }
        if (end < start) {
            return res.status(400).json({ message: 'tanggal_selesai tidak boleh lebih awal dari tanggal_mulai' });
        }

        const frekuensi = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        const satuan = 'hari';

        let idTeknisStr = null;
        if (Array.isArray(id_teknis) && id_teknis.length > 0) {
            idTeknisStr = id_teknis.join(',');
        } else if (typeof id_teknis === 'string' && id_teknis.trim()) {
            idTeknisStr = id_teknis;
        }

        const checklistKategoriStr = JSON.stringify(Array.isArray(checklist_kategori) ? checklist_kategori : []);

        const [result] = await db.query(`
            INSERT INTO preventive_schedule 
            (nama_schedule, id_departemen, id_kategori, id_sub_kategori, frekuensi, satuan, tanggal_mulai, tanggal_selesai, id_teknis, deskripsi, checklist_kategori, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [
            nama_schedule, 
            id_departemen, 
            id_kategori || null, 
            id_sub_kategori || null, 
            frekuensi, 
            satuan,
            tanggal_mulai,
            tanggal_selesai,
            idTeknisStr,
            deskripsi || null,
            checklistKategoriStr
        ]);

        const id_schedule = result.insertId;

        if (aset_list && aset_list.length > 0) {
            for (const kode of aset_list) {
                await db.query(`INSERT INTO schedule_asset (id_schedule, kode_asset) VALUES (?, ?)`, [id_schedule, kode]);
                await db.query(`
                    UPDATE inventory 
                    SET id_preventive_schedule = ?, next_maintenance = ? 
                    WHERE kode_asset = ?
                `, [id_schedule, tanggal_selesai, kode]);
            }
        }

        await autoCreateTicketsForSchedule(id_schedule);

        res.status(201).json({ 
            message: idTeknisStr 
                ? 'Schedule berhasil dibuat & tiket otomatis dibuat' 
                : 'Schedule berhasil dibuat, menunggu diklaim teknisi', 
            id_schedule 
        });
    } catch (error) {
        console.error('createSchedule error:', error);
        res.status(500).json({ message: 'Gagal membuat schedule' });
    }
};

// ============================================================
// UPDATE schedule + AUTO-CREATE TICKET jika aktif
// ============================================================
exports.updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nama_schedule, 
            id_departemen, 
            id_kategori, 
            id_sub_kategori, 
            tanggal_mulai,
            tanggal_selesai,
            id_teknis, 
            deskripsi,
            is_active,
            aset_list,
            checklist_kategori
        } = req.body;

        const [check] = await db.query(`SELECT * FROM preventive_schedule WHERE id_schedule = ?`, [id]);
        if (check.length === 0) {
            return res.status(404).json({ message: 'Schedule tidak ditemukan' });
        }

        let idTeknisStr = null;
        if (Array.isArray(id_teknis) && id_teknis.length > 0) {
            idTeknisStr = id_teknis.join(',');
        } else if (typeof id_teknis === 'string' && id_teknis.trim()) {
            idTeknisStr = id_teknis;
        }

        let checklistKategoriStr = check[0].checklist_kategori;
        if (checklist_kategori !== undefined) {
            checklistKategoriStr = JSON.stringify(Array.isArray(checklist_kategori) ? checklist_kategori : []);
        }

        let frekuensi = check[0].frekuensi;
        let satuan = check[0].satuan;
        let tanggalMulaiFinal = check[0].tanggal_mulai;
        let tanggalSelesaiFinal = check[0].tanggal_selesai;

        if (tanggal_mulai && tanggal_selesai) {
            const start = new Date(tanggal_mulai);
            const end = new Date(tanggal_selesai);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ message: 'Format tanggal_mulai / tanggal_selesai tidak valid' });
            }
            if (end < start) {
                return res.status(400).json({ message: 'tanggal_selesai tidak boleh lebih awal dari tanggal_mulai' });
            }
            frekuensi = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            satuan = 'hari';
            tanggalMulaiFinal = tanggal_mulai;
            tanggalSelesaiFinal = tanggal_selesai;
        }

        await db.query(`
            UPDATE preventive_schedule SET
                nama_schedule = COALESCE(?, nama_schedule),
                id_departemen = COALESCE(?, id_departemen),
                id_kategori = ?,
                id_sub_kategori = ?,
                frekuensi = ?,
                satuan = ?,
                tanggal_mulai = ?,
                tanggal_selesai = ?,
                id_teknis = COALESCE(?, id_teknis),
                deskripsi = ?,
                checklist_kategori = ?,
                is_active = ?
            WHERE id_schedule = ?
        `, [
            nama_schedule || null,
            id_departemen || null,
            id_kategori || null,
            id_sub_kategori || null,
            frekuensi,
            satuan,
            tanggalMulaiFinal,
            tanggalSelesaiFinal,
            idTeknisStr,
            deskripsi !== undefined ? deskripsi : check[0].deskripsi,
            checklistKategoriStr,
            is_active !== undefined ? is_active : check[0].is_active,
            id
        ]);

        if (aset_list !== undefined) {
            await db.query(`DELETE FROM schedule_asset WHERE id_schedule = ?`, [id]);
            await db.query(`
                UPDATE inventory 
                SET id_preventive_schedule = NULL, next_maintenance = NULL 
                WHERE id_preventive_schedule = ?
            `, [id]);
            if (aset_list.length > 0) {
                const nextMaintenanceFinal = tanggalSelesaiFinal
                    ? new Date(tanggalSelesaiFinal).toISOString().split('T')[0]
                    : null;
                for (const kode of aset_list) {
                    await db.query(`INSERT INTO schedule_asset (id_schedule, kode_asset) VALUES (?, ?)`, [id, kode]);
                    await db.query(`
                        UPDATE inventory 
                        SET id_preventive_schedule = ?, next_maintenance = ? 
                        WHERE kode_asset = ?
                    `, [id, nextMaintenanceFinal, kode]);
                }
            }
        }

        const isActive = is_active !== undefined ? is_active : check[0].is_active;
        const finalIdTeknis = idTeknisStr || check[0].id_teknis;
        if ((isActive === 1 || isActive === true) && finalIdTeknis) {
            await autoCreateTicketsForSchedule(id);
        }

        res.json({ message: 'Schedule berhasil diupdate' });
    } catch (error) {
        console.error('updateSchedule error:', error);
        res.status(500).json({ message: 'Gagal update schedule' });
    }
};

// ============================================================
// DELETE schedule
// 🔧 FIXED (TOTAL REWRITE): sebelumnya hanya menghapus baris
// preventive_schedule dan meng-NULL-kan referensi di inventory —
// baris di schedule_asset, schedule_asset_claim, list_ticket,
// assignment_ticket, ticket_checklist_result, ticket_progress_log
// milik schedule ini ditinggal jadi data yatim (atau bisa error 500
// kalau ada FK constraint). Sekarang dihapus bersih & berurutan dalam
// SATU transaction (db diasumsikan pool mysql2/promise — kalau db.js
// kamu bukan pool, kabari saya supaya disesuaikan tanpa transaction
// manual).
// ============================================================
exports.deleteSchedule = async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [check] = await conn.query(
            `SELECT id_schedule FROM preventive_schedule WHERE id_schedule = ?`, [id]
        );
        if (check.length === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ message: 'Schedule tidak ditemukan' });
        }

        const [tickets] = await conn.query(
            `SELECT id_ticket FROM list_ticket WHERE id_schedule = ?`, [id]
        );
        const ticketIds = tickets.map(t => t.id_ticket);

        if (ticketIds.length > 0) {
            const ph = ticketIds.map(() => '?').join(',');

            await conn.query(`
                DELETE tpl FROM ticket_progress_log tpl
                JOIN assignment_ticket a ON a.id_assignment = tpl.id_assignment
                WHERE a.id_ticket IN (${ph})
            `, ticketIds);

            // hapus juga checklist_approval kalau tabelnya sudah dipakai
            // di environment ini (abaikan error kalau tabel belum ada)
            try {
                await conn.query(`DELETE FROM checklist_approval WHERE id_ticket IN (${ph})`, ticketIds);
            } catch (e) {
                console.log('Lewati checklist_approval (tabel mungkin belum ada):', e.message);
            }

            await conn.query(`DELETE FROM ticket_checklist_result WHERE id_ticket IN (${ph})`, ticketIds);
            await conn.query(`DELETE FROM assignment_ticket WHERE id_ticket IN (${ph})`, ticketIds);
            await conn.query(`DELETE FROM list_ticket WHERE id_ticket IN (${ph})`, ticketIds);
        }

        await conn.query(`DELETE FROM schedule_asset_claim WHERE id_schedule = ?`, [id]);
        await conn.query(`DELETE FROM schedule_asset WHERE id_schedule = ?`, [id]);

        await conn.query(`
            UPDATE inventory
            SET id_preventive_schedule = NULL, next_maintenance = NULL
            WHERE id_preventive_schedule = ?
        `, [id]);

        await conn.query(`DELETE FROM preventive_schedule WHERE id_schedule = ?`, [id]);

        await conn.commit();
        res.json({ message: 'Schedule & seluruh tiket terkait berhasil dihapus' });
    } catch (error) {
        await conn.rollback();
        console.error('deleteSchedule error:', error);
        res.status(500).json({ message: 'Gagal hapus schedule' });
    } finally {
        conn.release();
    }
};

// ============================================================
// TOGGLE active / inactive + AUTO-CREATE jika diaktifkan (dan sudah ada teknisi)
// ============================================================
exports.toggleActive = async (req, res) => {
    try {
        const { id } = req.params;
        const [row] = await db.query(`SELECT is_active, id_teknis FROM preventive_schedule WHERE id_schedule = ?`, [id]);
        if (row.length === 0) {
            return res.status(404).json({ message: 'Schedule tidak ditemukan' });
        }
        const newStatus = !row[0].is_active;
        await db.query(`UPDATE preventive_schedule SET is_active = ? WHERE id_schedule = ?`, [newStatus, id]);
        
        if (newStatus && row[0].id_teknis) {
            await autoCreateTicketsForSchedule(id);
        }
        
        res.json({ message: `Schedule ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}` });
    } catch (error) {
        console.error('toggleActive error:', error);
        res.status(500).json({ message: 'Gagal toggle status' });
    }
};

// ============================================================
// GET schedule by ID (untuk edit)
// ============================================================
exports.getScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
            SELECT 
                s.*,
                k.nama_kategori,
                sk.nama_sub_kategori,
                (SELECT GROUP_CONCAT(DISTINCT kar.nama SEPARATOR ', ') 
                 FROM teknisi t 
                 JOIN karyawan kar ON t.nik = kar.nik 
                 WHERE FIND_IN_SET(t.id_teknisi, s.id_teknis) > 0) AS teknisi_list,
                (SELECT GROUP_CONCAT(DISTINCT DATE(tpl.created_at) ORDER BY tpl.created_at ASC SEPARATOR ', ')
                 FROM schedule_asset sa5 
                 JOIN inventory i5 ON sa5.kode_asset = i5.kode_asset
                 JOIN list_ticket lt5 ON lt5.kode_asset = i5.kode_asset AND lt5.id_schedule = s.id_schedule
                 JOIN assignment_ticket asg5 ON asg5.id_ticket = lt5.id_ticket
                 JOIN ticket_progress_log tpl ON tpl.id_assignment = asg5.id_assignment
                 WHERE sa5.id_schedule = s.id_schedule) AS progress_dates,
                (SELECT MAX(asg6.progress)
                 FROM schedule_asset sa6 
                 JOIN inventory i6 ON sa6.kode_asset = i6.kode_asset
                 JOIN list_ticket lt6 ON lt6.kode_asset = i6.kode_asset AND lt6.id_schedule = s.id_schedule
                 JOIN assignment_ticket asg6 ON asg6.id_ticket = lt6.id_ticket
                 WHERE sa6.id_schedule = s.id_schedule) AS max_progress
            FROM preventive_schedule s
            LEFT JOIN kategori k ON s.id_kategori = k.id_kategori
            LEFT JOIN sub_kategori sk ON s.id_sub_kategori = sk.id_sub_kategori
            WHERE s.id_schedule = ?
        `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Schedule tidak ditemukan' });
        }
        const [assets] = await db.query(`
            SELECT kode_asset FROM schedule_asset WHERE id_schedule = ?
        `, [id]);
        rows[0].aset_list = assets.map(a => a.kode_asset);

        if (rows[0].id_teknis) {
            rows[0].id_teknis = rows[0].id_teknis.split(',').map(s => s.trim()).filter(Boolean);
        } else {
            rows[0].id_teknis = [];
        }

        if (rows[0].progress_dates) {
            rows[0].progress_dates = rows[0].progress_dates.split(',');
        } else {
            rows[0].progress_dates = [];
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('getScheduleById error:', error);
        res.status(500).json({ message: 'Gagal mengambil schedule' });
    }
};

// ============================================================
// TEKNISI: GET schedule yang belum diklaim teknisi manapun
// GET /api/schedule/available
// ============================================================
exports.getAvailableSchedules = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                s.id_schedule,
                s.nama_schedule,
                s.deskripsi,
                s.tanggal_mulai,
                s.tanggal_selesai,
                d.nama_departemen AS departemen,
                (SELECT COUNT(*) FROM schedule_asset WHERE id_schedule = s.id_schedule) AS total_aset
            FROM preventive_schedule s
            JOIN departemen d ON d.id_departemen = s.id_departemen
            WHERE s.is_active = 1
              AND (s.id_teknis IS NULL OR s.id_teknis = '')
            ORDER BY s.tanggal_mulai ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('getAvailableSchedules error:', error);
        res.status(500).json({ message: 'Gagal mengambil schedule tersedia' });
    }
};

// ============================================================
// TEKNISI: Klaim schedule (self-assign, level SATU SCHEDULE)
// PATCH /api/schedule/:id/claim
// ============================================================
exports.claimSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const [teknisiRow] = await db.query(
            `SELECT id_teknisi FROM teknisi WHERE nik = ? AND status = 'Aktif'`,
            [req.user.nik]
        );
        if (teknisiRow.length === 0) {
            return res.status(403).json({ message: 'Anda tidak terdaftar sebagai teknisi aktif' });
        }
        const idTeknisi = teknisiRow[0].id_teknisi;

        const [result] = await db.query(`
            UPDATE preventive_schedule
            SET id_teknis = ?
            WHERE id_schedule = ?
              AND is_active = 1
              AND (id_teknis IS NULL OR id_teknis = '')
        `, [idTeknisi, id]);

        if (result.affectedRows === 0) {
            const [check] = await db.query(
                `SELECT id_teknis, is_active FROM preventive_schedule WHERE id_schedule = ?`, [id]
            );
            if (check.length === 0) return res.status(404).json({ message: 'Schedule tidak ditemukan' });
            if (!check[0].is_active) return res.status(400).json({ message: 'Schedule ini sudah nonaktif' });
            return res.status(409).json({ message: 'Schedule ini baru saja diklaim teknisi lain' });
        }

        await autoCreateTicketsForSchedule(id);

        res.json({ message: 'Schedule berhasil diklaim, tiket sudah dibuat' });
    } catch (error) {
        console.error('claimSchedule error:', error);
        res.status(500).json({ message: 'Gagal mengklaim schedule' });
    }
};

// ============================================================
// 🔥 TEKNISI: klaim SATU asset dalam schedule
// PATCH /api/schedule/:id/claim-asset   body: { kode_asset }
// 🔒 UNIQUE KEY (id_schedule, kode_asset) di schedule_asset_claim mencegah
// race condition kalau 2 teknisi klik asset yang sama bersamaan.
// ============================================================
exports.claimAssetToMe = async (req, res) => {
    try {
        const { id } = req.params;
        const { kode_asset } = req.body;
        if (!kode_asset) {
            return res.status(400).json({ message: 'kode_asset wajib diisi' });
        }

        const [teknisiRow] = await db.query(
            `SELECT id_teknisi FROM teknisi WHERE nik = ? AND status = 'Aktif'`,
            [req.user.nik]
        );
        if (teknisiRow.length === 0) {
            return res.status(403).json({ message: 'Anda tidak terdaftar sebagai teknisi aktif' });
        }
        const idTeknisi = teknisiRow[0].id_teknisi;

        const [scheduleCheck] = await db.query(
            `SELECT is_active FROM preventive_schedule WHERE id_schedule = ?`, [id]
        );
        if (scheduleCheck.length === 0) {
            return res.status(404).json({ message: 'Schedule tidak ditemukan' });
        }
        if (!scheduleCheck[0].is_active) {
            return res.status(400).json({ message: 'Schedule ini sudah nonaktif' });
        }

        const [assetCheck] = await db.query(
            `SELECT 1 FROM schedule_asset WHERE id_schedule = ? AND kode_asset = ?`,
            [id, kode_asset]
        );
        if (assetCheck.length === 0) {
            return res.status(404).json({ message: 'Asset tidak ditemukan di schedule ini' });
        }

        const idTicket = await createTicketForSingleAsset(id, kode_asset, idTeknisi);

        try {
            await db.query(
                `INSERT INTO schedule_asset_claim (id_schedule, kode_asset, id_teknisi, id_ticket) VALUES (?, ?, ?, ?)`,
                [id, kode_asset, idTeknisi, idTicket]
            );
        } catch (dupErr) {
            if (dupErr.code === 'ER_DUP_ENTRY') {
                await db.query(`DELETE FROM ticket_checklist_result WHERE id_ticket = ?`, [idTicket]);
                await db.query(`DELETE FROM assignment_ticket WHERE id_ticket = ?`, [idTicket]);
                await db.query(`DELETE FROM list_ticket WHERE id_ticket = ?`, [idTicket]);
                return res.status(409).json({ message: 'Asset ini baru saja diklaim teknisi lain' });
            }
            throw dupErr;
        }

        res.json({ message: 'Asset berhasil diklaim, tiket sudah dibuat', id_ticket: idTicket });
    } catch (error) {
        console.error('claimAssetToMe error:', error);
        res.status(500).json({ message: error.message || 'Gagal mengklaim asset' });
    }
};

// ============================================================
// ADMIN: Batalkan klaim teknisi (kembalikan ke "tersedia")
// PATCH /api/schedule/:id/unclaim
// ============================================================
exports.unclaimSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`UPDATE preventive_schedule SET id_teknis = NULL WHERE id_schedule = ?`, [id]);
        res.json({ message: 'Klaim teknisi berhasil dibatalkan' });
    } catch (error) {
        console.error('unclaimSchedule error:', error);
        res.status(500).json({ message: 'Gagal membatalkan klaim' });
    }
};