const pool = require('../config/db');
const { ok, created, fail } = require('../utils/response');

// Fitur 14: Inventory (aset IT) - Admin lihat semua, Users bisa input aset sendiri
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT inv.kode_asset, inv.nama_barang, inv.merk_model,
             inv.computer_name, inv.it_priority, inv.tahun_perolehan,
             inv.user_pemakai, inv.email, inv.extension, inv.divisi,
             inv.gedung, inv.ip_address, inv.status_aset,
             d.nama_departemen AS dept, ka.nama_kategori AS kategori,
             k.nama AS pemegang
      FROM inventory inv
      JOIN departemen d ON d.id_departemen = inv.id_departemen
      JOIN kategori ka ON ka.id_kategori = inv.id_kategori
      LEFT JOIN karyawan k ON k.nik = inv.nik_pemegang
      ORDER BY inv.kode_asset
    `);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil data inventory: ' + err.message, 500);
  }
};

// Statistik jumlah asset per departemen (bisa difilter per jenis barang)
exports.getStats = async (req, res) => {
  try {
    const jenis = (req.query.jenis || '').trim(); // filter opsional: nama_barang (Laptop, Tablet, dll)
    let query = `
      SELECT d.nama_departemen AS departemen, COUNT(*) AS jumlah
      FROM inventory inv
      JOIN departemen d ON d.id_departemen = inv.id_departemen
    `;
    const params = [];
    if (jenis) {
      // TRIM + LOWER di kedua sisi supaya kecocokan tidak gagal gara-gara
      // spasi ekstra atau beda kapitalisasi antara data di DB dan pilihan dropdown
      query += ' WHERE LOWER(TRIM(inv.nama_barang)) = LOWER(?)';
      params.push(jenis);
    }
    query += ' GROUP BY d.nama_departemen ORDER BY jumlah DESC';

    const [rows] = await pool.query(query, params);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil statistik inventory: ' + err.message, 500);
  }
};

// Daftar jenis barang unik untuk opsi filter (Laptop, Tablet, Printer, dll)
exports.getJenisOptions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT TRIM(nama_barang) AS nama_barang
       FROM inventory
       WHERE nama_barang IS NOT NULL AND TRIM(nama_barang) <> ''
       ORDER BY nama_barang`
    );
    return ok(res, rows.map((r) => r.nama_barang));
  } catch (err) {
    return fail(res, 'Gagal mengambil jenis asset: ' + err.message, 500);
  }
};

// Users: aset yang dipegang sendiri
exports.getMyAssets = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT inv.kode_asset, inv.nama_barang, inv.merk_model, ka.nama_kategori AS kategori, inv.status_aset
      FROM inventory inv
      JOIN kategori ka ON ka.id_kategori = inv.id_kategori
      WHERE inv.nik_pemegang = ?
      ORDER BY inv.kode_asset
    `, [req.user.nik]);
    return ok(res, rows);
  } catch (err) {
    return fail(res, 'Gagal mengambil aset saya: ' + err.message, 500);
  }
};

// Input Aset oleh users sendiri (tanpa approval, hanya rekap data)
exports.create = async (req, res) => {
  try {
    const {
      nama_barang, merk_model, id_departemen, id_kategori,
      computer_name, it_priority, tahun_perolehan, user_pemakai,
      email, extension, divisi, gedung, ip_address, status_aset,
    } = req.body;

    if (!nama_barang || !id_departemen || !id_kategori) {
      return fail(res, 'nama_barang, id_departemen, id_kategori wajib diisi');
    }
    const kodeAsset = 'AST-' + Date.now().toString().slice(-8);
    const nikPemegang = req.user.level === 'Admin' ? (req.body.nik_pemegang || null) : req.user.nik;

    await pool.query(
      `INSERT INTO inventory
        (kode_asset, nama_barang, merk_model, id_departemen, id_kategori, nik_pemegang, status_aset,
         computer_name, it_priority, tahun_perolehan, user_pemakai, email, extension, divisi, gedung, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kodeAsset, nama_barang, merk_model || null, id_departemen, id_kategori, nikPemegang, status_aset || 'Aktif',
        computer_name || null, it_priority || null, tahun_perolehan || null, user_pemakai || null,
        email || null, extension || null, divisi || null, gedung || null, ip_address || null,
      ]
    );

    // Kalau langsung ada pemegang saat pembuatan, catat sebagai baris pertama riwayat pemegang
    if (nikPemegang) {
      const [[baru]] = await pool.query('SELECT nama FROM karyawan WHERE nik = ?', [nikPemegang]);
      await pool.query(
        `INSERT INTO asset_holder_history (kode_asset, nik_lama, nama_lama, nik_baru, nama_baru, keterangan)
         VALUES (?, NULL, NULL, ?, ?, ?)`,
        [kodeAsset, nikPemegang, baru?.nama || null, 'Pemegang awal saat asset didaftarkan']
      );
    }

    // Catat juga sebagai baris pertama riwayat departemen
    if (id_departemen) {
      const [[deptAwal]] = await pool.query('SELECT nama_departemen FROM departemen WHERE id_departemen = ?', [id_departemen]);
      await pool.query(
        `INSERT INTO asset_department_history (kode_asset, id_departemen_lama, nama_departemen_lama, id_departemen_baru, nama_departemen_baru, keterangan)
         VALUES (?, NULL, NULL, ?, ?, ?)`,
        [kodeAsset, id_departemen, deptAwal?.nama_departemen || null, 'Departemen awal saat asset didaftarkan']
      );
    }

    return created(res, { kode_asset: kodeAsset }, 'Aset berhasil didaftarkan');
  } catch (err) {
    return fail(res, 'Gagal menambah aset: ' + err.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { kode } = req.params;
    const {
      nama_barang, merk_model, id_departemen, id_kategori, nik_pemegang,
      computer_name, it_priority, tahun_perolehan, user_pemakai,
      email, extension, divisi, gedung, ip_address, status_aset,
      keterangan_pindah, keterangan_pindah_departemen,
    } = req.body;

    // Ambil juga id_departemen lama, bukan cuma nik_pemegang
    const [[current]] = await pool.query(
      'SELECT nik_pemegang, id_departemen FROM inventory WHERE kode_asset = ?', [kode]
    );
    if (!current) return fail(res, 'Asset tidak ditemukan', 404);

    const nikLama = current.nik_pemegang;
    const nikBaru = nik_pemegang || null;

    const idDeptLama = current.id_departemen;
    const idDeptBaru = id_departemen || null;

    await pool.query(
      `UPDATE inventory SET
        nama_barang=?, merk_model=?, id_departemen=?, id_kategori=?, nik_pemegang=?,
        computer_name=?, it_priority=?, tahun_perolehan=?, user_pemakai=?,
        email=?, extension=?, divisi=?, gedung=?, ip_address=?, status_aset=?
       WHERE kode_asset = ?`,
      [
        nama_barang, merk_model, id_departemen, id_kategori, nikBaru,
        computer_name || null, it_priority || null, tahun_perolehan || null, user_pemakai || null,
        email || null, extension || null, divisi || null, gedung || null, ip_address || null,
        status_aset || 'Aktif',
        kode,
      ]
    );

    // Kalau pemegang berubah (termasuk jadi null / dilepas), catat ke asset_holder_history
    if (nikLama !== nikBaru) {
      const [[lama]] = nikLama
        ? await pool.query('SELECT nama FROM karyawan WHERE nik = ?', [nikLama])
        : [[null]];
      const [[baru]] = nikBaru
        ? await pool.query('SELECT nama FROM karyawan WHERE nik = ?', [nikBaru])
        : [[null]];

      await pool.query(
        `INSERT INTO asset_holder_history (kode_asset, nik_lama, nama_lama, nik_baru, nama_baru, keterangan)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [kode, nikLama || null, lama?.nama || null, nikBaru, baru?.nama || null, keterangan_pindah || null]
      );
    }

    // Kalau id_departemen berubah, catat ke asset_department_history
    // (bisa terjadi langsung, atau tidak langsung lewat perubahan pemegang
    // karena field Departemen di form Profile ikut departemen pemegang)
    if (Number(idDeptLama) !== Number(idDeptBaru)) {
      const [[deptLama]] = idDeptLama
        ? await pool.query('SELECT nama_departemen FROM departemen WHERE id_departemen = ?', [idDeptLama])
        : [[null]];
      const [[deptBaru]] = idDeptBaru
        ? await pool.query('SELECT nama_departemen FROM departemen WHERE id_departemen = ?', [idDeptBaru])
        : [[null]];

      await pool.query(
        `INSERT INTO asset_department_history (kode_asset, id_departemen_lama, nama_departemen_lama, id_departemen_baru, nama_departemen_baru, keterangan)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          kode,
          idDeptLama || null,
          deptLama?.nama_departemen || null,
          idDeptBaru || null,
          deptBaru?.nama_departemen || null,
          keterangan_pindah_departemen || null,
        ]
      );
    }

    return ok(res, null, 'Aset berhasil diperbarui');
  } catch (err) {
    return fail(res, 'Gagal memperbarui aset: ' + err.message, 500);
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE kode_asset = ?', [req.params.kode]);
    return ok(res, null, 'Aset berhasil dihapus');
  } catch (err) {
    return fail(res, 'Gagal menghapus aset: ' + err.message, 500);
  }
};

// =========================================================
// DETAIL ASSET: Profile + Hardware (fixed) + Software (fixed)
//    + Riwayat Tiket (dikelompokkan per periode pemegang)
//    + Riwayat Pemegang + Riwayat Departemen
// =========================================================
exports.getDetail = async (req, res) => {
  try {
    const { kode } = req.params;

    const [profileRows] = await pool.query(`
      SELECT inv.kode_asset, inv.nama_barang, inv.merk_model,
             inv.computer_name, inv.it_priority, inv.tahun_perolehan,
             inv.user_pemakai, inv.email, inv.extension, inv.divisi,
             inv.gedung, inv.ip_address, inv.status_aset,
             inv.id_departemen, inv.id_kategori, inv.nik_pemegang,
             d.nama_departemen AS dept, ka.nama_kategori AS kategori,
             k.nama AS pemegang
      FROM inventory inv
      JOIN departemen d ON d.id_departemen = inv.id_departemen
      JOIN kategori ka ON ka.id_kategori = inv.id_kategori
      LEFT JOIN karyawan k ON k.nik = inv.nik_pemegang
      WHERE inv.kode_asset = ?
    `, [kode]);

    if (profileRows.length === 0) {
      return fail(res, 'Asset tidak ditemukan', 404);
    }

    // Tabel lama (key-value) - dibiarkan tetap ada, tidak dipakai lagi di UI baru
    const [hardware] = await pool.query(
      'SELECT * FROM asset_hardware WHERE kode_asset = ? ORDER BY id DESC',
      [kode]
    );

    // Detail hardware fixed-field (1 baris per asset)
    const [hwDetailRows] = await pool.query(
      'SELECT * FROM asset_hardware_detail WHERE kode_asset = ?',
      [kode]
    );
    const hardwareDetail = hwDetailRows[0] || {
      serial_no_pc: '', mobo_type: '', kelas: '', processor: '',
      hdd_size: '', hdd_model: '', hdd_serial_no: '',
      memory_size: '', memory_type: '', display: '',
    };

    // Tabel lama software (key-value) - dibiarkan tetap ada, tidak dipakai lagi di UI baru
    const [software] = await pool.query(
      'SELECT * FROM asset_software WHERE kode_asset = ? ORDER BY id DESC',
      [kode]
    );

    // Detail software fixed-field (1 baris per asset)
    const [swDetailRows] = await pool.query(
      'SELECT * FROM asset_software_detail WHERE kode_asset = ?',
      [kode]
    );
    const softwareDetail = swDetailRows[0] || {
      operating_system: '', serial_no_os: '', ms_office: '', ms_office_sn: '',
      erp: 'TIDAK', wms: 'TIDAK', eris: 'TIDAK', cmms: 'TIDAK',
      visio: 'TIDAK', autocad: 'TIDAK', kaspersky: 'TIDAK',
      ms_project: 'TIDAK', acrobat: 'TIDAK',
    };

    // History = rekap tiket yang pernah dibuat untuk asset ini (flat list, terbaru dulu)
    const [history] = await pool.query(`
      SELECT
        lt.id_ticket,
        lt.tanggal_lapor AS tanggal,
        lt.deskripsi,
        lt.status,
        lt.prioritas,
        ka.nama_kategori AS kategori,
        sk.nama_sub_kategori AS sub_kategori,
        k.nama AS pelapor,
        kt.nama AS teknisi
      FROM list_ticket lt
      JOIN karyawan k ON k.nik = lt.nik_pelapor
      LEFT JOIN kategori ka ON ka.id_kategori = lt.id_kategori
      LEFT JOIN sub_kategori sk ON sk.id_sub_kategori = lt.id_sub_kategori
      LEFT JOIN assignment_ticket asg ON asg.id_ticket = lt.id_ticket
      LEFT JOIN teknisi tk ON tk.id_teknisi = asg.id_teknisi
      LEFT JOIN karyawan kt ON kt.nik = tk.nik
      WHERE lt.kode_asset = ?
      ORDER BY lt.tanggal_lapor DESC
    `, [kode]);

    // Riwayat perpindahan pemegang, urut lama -> baru buat bikin rentang periode
    const [pemegangHistoryAsc] = await pool.query(
      'SELECT * FROM asset_holder_history WHERE kode_asset = ? ORDER BY tanggal_pindah ASC',
      [kode]
    );

    // Bagi waktu jadi beberapa periode pemegang, lalu kelompokkan tiket
    // berdasarkan tanggal_lapor jatuh di periode siapa.
    const periods = pemegangHistoryAsc.map((row, idx) => ({
      nik: row.nik_baru,
      nama: row.nama_baru,
      mulai: row.tanggal_pindah,
      selesai: idx + 1 < pemegangHistoryAsc.length ? pemegangHistoryAsc[idx + 1].tanggal_pindah : null,
    }));

    const historyByHolder = periods.map((p) => {
      const tickets = history.filter((h) => {
        const t = new Date(h.tanggal).getTime();
        const mulai = new Date(p.mulai).getTime();
        const selesai = p.selesai ? new Date(p.selesai).getTime() : Infinity;
        return t >= mulai && t < selesai;
      });
      return {
        nik_pemegang: p.nik,
        nama_pemegang: p.nama || 'Tidak ada pemegang',
        periode_mulai: p.mulai,
        periode_selesai: p.selesai,
        tickets,
      };
    });

    // Tiket lebih tua dari periode pertama yang tercatat (data lama sebelum
    // fitur ini ada) dikelompokkan terpisah biar tidak hilang/salah kelompok
    const earliestStart = periods.length > 0 ? new Date(periods[0].mulai).getTime() : Infinity;
    const untrackedTickets = history.filter((h) => new Date(h.tanggal).getTime() < earliestStart);
    if (untrackedTickets.length > 0) {
      historyByHolder.push({
        nik_pemegang: null,
        nama_pemegang: 'Sebelum tercatat (data lama)',
        periode_mulai: null,
        periode_selesai: periods.length > 0 ? periods[0].mulai : null,
        tickets: untrackedTickets,
      });
    }

    // Urutkan: periode terbaru (pemegang saat ini) di atas
    historyByHolder.sort((a, b) => {
      const aTime = a.periode_mulai ? new Date(a.periode_mulai).getTime() : -Infinity;
      const bTime = b.periode_mulai ? new Date(b.periode_mulai).getTime() : -Infinity;
      return bTime - aTime;
    });

    const [pemegangHistory] = await pool.query(
      'SELECT * FROM asset_holder_history WHERE kode_asset = ? ORDER BY tanggal_pindah DESC',
      [kode]
    );

    // Riwayat perpindahan departemen, terbaru dulu
    const [departmentHistory] = await pool.query(
      'SELECT * FROM asset_department_history WHERE kode_asset = ? ORDER BY tanggal_pindah DESC',
      [kode]
    );

    return ok(res, {
      profile: profileRows[0],
      hardware,
      hardwareDetail,
      software,
      softwareDetail,
      history,
      historyByHolder,
      pemegangHistory,
      departmentHistory,
    });
  } catch (err) {
    return fail(res, 'Gagal mengambil detail aset: ' + err.message, 500);
  }
};

// =========================================================
// HARDWARE CRUD (lama, key-value) - dibiarkan untuk kompatibilitas
// =========================================================
exports.addHardware = async (req, res) => {
  try {
    const { kode } = req.params;
    const { komponen, spesifikasi, keterangan } = req.body;
    if (!komponen) return fail(res, 'komponen wajib diisi');

    const [result] = await pool.query(
      'INSERT INTO asset_hardware (kode_asset, komponen, spesifikasi, keterangan) VALUES (?, ?, ?, ?)',
      [kode, komponen, spesifikasi || null, keterangan || null]
    );
    return created(res, { id: result.insertId }, 'Hardware berhasil ditambahkan');
  } catch (err) {
    return fail(res, 'Gagal menambah hardware: ' + err.message, 500);
  }
};

exports.updateHardware = async (req, res) => {
  try {
    const { id } = req.params;
    const { komponen, spesifikasi, keterangan } = req.body;
    await pool.query(
      'UPDATE asset_hardware SET komponen=?, spesifikasi=?, keterangan=? WHERE id=?',
      [komponen, spesifikasi || null, keterangan || null, id]
    );
    return ok(res, null, 'Hardware berhasil diperbarui');
  } catch (err) {
    return fail(res, 'Gagal memperbarui hardware: ' + err.message, 500);
  }
};

exports.deleteHardware = async (req, res) => {
  try {
    await pool.query('DELETE FROM asset_hardware WHERE id=?', [req.params.id]);
    return ok(res, null, 'Hardware berhasil dihapus');
  } catch (err) {
    return fail(res, 'Gagal menghapus hardware: ' + err.message, 500);
  }
};

// =========================================================
// HARDWARE DETAIL (baru, fixed fields, 1 baris per asset)
// =========================================================
exports.saveHardwareDetail = async (req, res) => {
  try {
    const { kode } = req.params;
    const {
      serial_no_pc, mobo_type, kelas, processor,
      hdd_size, hdd_model, hdd_serial_no,
      memory_size, memory_type, display,
    } = req.body;

    await pool.query(
      `INSERT INTO asset_hardware_detail
        (kode_asset, serial_no_pc, mobo_type, kelas, processor, hdd_size, hdd_model, hdd_serial_no, memory_size, memory_type, display)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        serial_no_pc=VALUES(serial_no_pc), mobo_type=VALUES(mobo_type), kelas=VALUES(kelas),
        processor=VALUES(processor), hdd_size=VALUES(hdd_size), hdd_model=VALUES(hdd_model),
        hdd_serial_no=VALUES(hdd_serial_no), memory_size=VALUES(memory_size),
        memory_type=VALUES(memory_type), display=VALUES(display)`,
      [
        kode, serial_no_pc || null, mobo_type || null, kelas || null, processor || null,
        hdd_size || null, hdd_model || null, hdd_serial_no || null,
        memory_size || null, memory_type || null, display || null,
      ]
    );
    return ok(res, null, 'Detail hardware berhasil disimpan');
  } catch (err) {
    return fail(res, 'Gagal menyimpan detail hardware: ' + err.message, 500);
  }
};

// =========================================================
// SOFTWARE CRUD (lama, key-value) - dibiarkan untuk kompatibilitas
// =========================================================
exports.addSoftware = async (req, res) => {
  try {
    const { kode } = req.params;
    const { nama_software, versi, lisensi, tanggal_install, keterangan } = req.body;
    if (!nama_software) return fail(res, 'nama_software wajib diisi');

    const [result] = await pool.query(
      `INSERT INTO asset_software (kode_asset, nama_software, versi, lisensi, tanggal_install, keterangan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [kode, nama_software, versi || null, lisensi || null, tanggal_install || null, keterangan || null]
    );
    return created(res, { id: result.insertId }, 'Software berhasil ditambahkan');
  } catch (err) {
    return fail(res, 'Gagal menambah software: ' + err.message, 500);
  }
};

exports.updateSoftware = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_software, versi, lisensi, tanggal_install, keterangan } = req.body;
    await pool.query(
      `UPDATE asset_software SET nama_software=?, versi=?, lisensi=?, tanggal_install=?, keterangan=?
       WHERE id=?`,
      [nama_software, versi || null, lisensi || null, tanggal_install || null, keterangan || null, id]
    );
    return ok(res, null, 'Software berhasil diperbarui');
  } catch (err) {
    return fail(res, 'Gagal memperbarui software: ' + err.message, 500);
  }
};

exports.deleteSoftware = async (req, res) => {
  try {
    await pool.query('DELETE FROM asset_software WHERE id=?', [req.params.id]);
    return ok(res, null, 'Software berhasil dihapus');
  } catch (err) {
    return fail(res, 'Gagal menghapus software: ' + err.message, 500);
  }
};

// =========================================================
// SOFTWARE DETAIL (baru, fixed fields, 1 baris per asset)
// =========================================================
exports.saveSoftwareDetail = async (req, res) => {
  try {
    const { kode } = req.params;
    const {
      operating_system, serial_no_os, ms_office, ms_office_sn,
      erp, wms, eris, cmms, visio, autocad, kaspersky, ms_project, acrobat,
    } = req.body;

    await pool.query(
      `INSERT INTO asset_software_detail
        (kode_asset, operating_system, serial_no_os, ms_office, ms_office_sn,
         erp, wms, eris, cmms, visio, autocad, kaspersky, ms_project, acrobat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        operating_system=VALUES(operating_system), serial_no_os=VALUES(serial_no_os),
        ms_office=VALUES(ms_office), ms_office_sn=VALUES(ms_office_sn),
        erp=VALUES(erp), wms=VALUES(wms), eris=VALUES(eris), cmms=VALUES(cmms),
        visio=VALUES(visio), autocad=VALUES(autocad), kaspersky=VALUES(kaspersky),
        ms_project=VALUES(ms_project), acrobat=VALUES(acrobat)`,
      [
        kode, operating_system || null, serial_no_os || null, ms_office || null, ms_office_sn || null,
        erp || 'TIDAK', wms || 'TIDAK', eris || 'TIDAK', cmms || 'TIDAK',
        visio || 'TIDAK', autocad || 'TIDAK', kaspersky || 'TIDAK',
        ms_project || 'TIDAK', acrobat || 'TIDAK',
      ]
    );
    return ok(res, null, 'Detail software berhasil disimpan');
  } catch (err) {
    return fail(res, 'Gagal menyimpan detail software: ' + err.message, 500);
  }
};