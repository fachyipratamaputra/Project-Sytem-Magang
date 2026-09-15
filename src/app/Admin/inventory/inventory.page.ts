import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { forkJoin } from 'rxjs';
import { DepartemenService } from 'src/app/services/departemen.services';
import { KaryawanService } from 'src/app/services/karyawan.service';
import {
  InventoryService,
  InventoryStat,
  AssetHardware,
  AssetHardwareDetail,
  AssetSoftware,
  AssetSoftwareDetail,
  AssetTicketHistory,
  AssetHolderHistory,
  AssetHolderTicketGroup,
  AssetDepartmentHistory,
  AssetDetail,
} from 'src/app/services/inventory.service';

export interface Inventory {
  kodeAsset: string;
  namaBarang: string;
  merkModel: string;
  dept: string;
  kategori: string;
  pemegang: string;
  idDepartemen?: number;
  idKategori?: number;
  nikPemegang?: string;
  statusAset?: string;
}

type DetailTab = 'profile' | 'hardware' | 'software' | 'ip' | 'history';
type HistorySubTab = 'tiket' | 'pemegang' | 'departemen';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class InventoryPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'inventory';

  inventoryList: Inventory[] = [];

  departemenList: any[] = [];
  karyawanList: any[] = [];
  kategoriList: any[] = [];

  searchTerm = '';
  filterDept = '';
  filterKategori = '';
  deptOptions: string[] = [];
  kategoriOptions: string[] = [];

  statsData: InventoryStat[] = [];
  jenisOptions: string[] = [];
  filterJenisStats = '';

  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  isEditing = false;
  selectedKode: string | null = null;

  selectedDepartemenNama: string = '';

  isExporting = false;

  formData: any = {
    nama_barang: '',
    merk_model: '',
    id_departemen: null,
    id_kategori: null,
    nik_pemegang: null,
    computer_name: '',
    it_priority: '',
    tahun_perolehan: null,
    user_pemakai: '',
    email: '',
    extension: '',
    divisi: '',
    gedung: '',
    ip_address: '',
    status_aset: 'Aktif',
    keterangan_pindah: '',
    keterangan_pindah_departemen: '',
  };

  activeDetailTab: DetailTab = 'profile';
  historySubTab: HistorySubTab = 'tiket';
  isDetailLoading = false;

  hardwareList: AssetHardware[] = [];
  hardwareDetail: AssetHardwareDetail = this.emptyHardwareDetail();

  softwareList: AssetSoftware[] = [];
  softwareDetail: AssetSoftwareDetail = this.emptySoftwareDetail();

  osOptions = [
    'Windows 7 Professional 32-bit',
    'Windows 7 Professional 64-bit',
    'Windows 10 Home',
    'Windows 10 Pro',
    'Windows 11 Home',
    'Windows 11 Pro',
    'Linux',
    'macOS',
    'Lainnya',
  ];

  msOfficeOptions = [
    'Tidak Ada',
    'Ms Office 365',
    'Ms Office Business',
    'Ms Office Prof 2016',
    'Ms Office Std. 2007',
    'Ms Office Std. 2010',
    'Ms Office Std. 2013',
    'Ms Office Std. 2016',
    'Ms Office Std. 2019',
  ];

  historyList: AssetTicketHistory[] = [];
  historyByHolder: AssetHolderTicketGroup[] = [];
  expandedHolderIndex: number | null = 0;
  pemegangHistoryList: AssetHolderHistory[] = [];
  departmentHistoryList: AssetDepartmentHistory[] = [];

  private pendingAssetFromQuery: string | null = null;
  private pendingTabFromQuery: DetailTab | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private departemenService: DepartemenService,
    private karyawanService: KaryawanService,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const assetParam = params['asset'];
      const tabParam = params['tab'] as DetailTab;

      if (assetParam) {
        this.pendingAssetFromQuery = assetParam;
        this.pendingTabFromQuery = tabParam || 'history';
        this.tryOpenAssetFromQuery();
      }
    });

    this.loadInventory();
    this.loadDepartemenList();
    this.loadKaryawanList();
    this.loadKategoriList();

    this.loadStats();
    this.loadJenisOptions();
  }

  private emptyHardwareDetail(): AssetHardwareDetail {
    return {
      serial_no_pc: '',
      mobo_type: '',
      kelas: '',
      processor: '',
      hdd_size: '',
      hdd_model: '',
      hdd_serial_no: '',
      memory_size: '',
      memory_type: '',
      display: '',
    };
  }

  private emptySoftwareDetail(): AssetSoftwareDetail {
    return {
      operating_system: '',
      serial_no_os: '',
      ms_office: '',
      ms_office_sn: '',
      erp: 'TIDAK',
      wms: 'TIDAK',
      eris: 'TIDAK',
      cmms: 'TIDAK',
      visio: 'TIDAK',
      autocad: 'TIDAK',
      kaspersky: 'TIDAK',
      ms_project: 'TIDAK',
      acrobat: 'TIDAK',
    };
  }

  loadInventory() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:5000/api/inventory', { headers }).subscribe({
      next: (res) => {
        const rawData = res.data || res;
        if (Array.isArray(rawData)) {
          this.inventoryList = rawData.map((item: any) => ({
            kodeAsset: item.kode_asset || item.kodeAsset,
            namaBarang: item.nama_barang || item.namaBarang,
            merkModel: item.merk_model || item.merkModel,
            dept: item.dept || item.nama_departemen,
            kategori: item.kategori,
            pemegang: item.pemegang || item.nama_pemegang,
            idDepartemen: item.id_departemen,
            idKategori: item.id_kategori,
            nikPemegang: item.nik_pemegang,
            statusAset: item.status_aset || 'Aktif',
          }));
          this.buildFilterOptions();
          this.tryOpenAssetFromQuery();
        }
      },
      error: (err) => console.error('Gagal memuat data inventory:', err)
    });
  }

  loadStats() {
    this.inventoryService.getStats(this.filterJenisStats).subscribe({
      next: (data) => (this.statsData = data),
      error: (err) => console.error('Gagal memuat statistik:', err),
    });
  }

  loadJenisOptions() {
    this.inventoryService.getJenisOptions().subscribe({
      next: (data) => (this.jenisOptions = data),
      error: (err) => console.error('Gagal memuat jenis asset:', err),
    });
  }

  get maxStatsValue(): number {
    return Math.max(1, ...this.statsData.map((s) => s.jumlah));
  }

  filterByDepartemen(departemen: string) {
    this.filterDept = this.filterDept === departemen ? '' : departemen;
    this.onFilterChange();

    setTimeout(() => {
      document.querySelector('.table-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  private tryOpenAssetFromQuery() {
    if (!this.pendingAssetFromQuery || this.inventoryList.length === 0) return;

    const kode = this.pendingAssetFromQuery;
    const tab = this.pendingTabFromQuery || 'history';
    const item = this.inventoryList.find((i) => i.kodeAsset === kode);

    this.pendingAssetFromQuery = null;
    this.pendingTabFromQuery = null;

    if (!item) {
      console.warn(`Asset dengan kode "${kode}" tidak ditemukan di inventory.`);
      return;
    }

    this.openEditModal(item);

    const maxWaitMs = 5000;
    let waited = 0;
    const checkInterval = setInterval(() => {
      waited += 100;
      if (!this.isDetailLoading) {
        this.setDetailTab(tab);
        clearInterval(checkInterval);
      } else if (waited >= maxWaitMs) {
        clearInterval(checkInterval);
      }
    }, 100);
  }

  private loadDepartemenList() {
    this.departemenService.getAll().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res ?? [];
        this.departemenList = rows.map((d: any) => ({
          idDepartemen: d.id_departemen ?? d.idDepartemen,
          namaDepartemen: d.nama_departemen ?? d.namaDepartemen,
        }));
      },
      error: (err) => console.error('Gagal memuat departemen:', err)
    });
  }

  private loadKaryawanList() {
    this.karyawanService.getAll().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res ?? [];
        this.karyawanList = rows.map((k: any) => ({
          nik: k.nik ?? k.NIK ?? k.id_karyawan,
          namaKaryawan: k.nama_karyawan ?? k.namaKaryawan ?? k.nama,
          departemen: k.departemen ?? k.nama_departemen ?? '',
        }));
      },
      error: (err) => console.error('Gagal memuat karyawan:', err)
    });
  }

  private loadKategoriList() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:5000/api/master/kategori', { headers }).subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res ?? [];
        this.kategoriList = rows.map((k: any) => ({
          idKategori: k.id_kategori ?? k.idKategori,
          namaKategori: k.nama_kategori ?? k.namaKategori,
        }));
      },
      error: (err) => console.error('Gagal memuat kategori:', err)
    });
  }

  private buildFilterOptions() {
    this.deptOptions = [...new Set(this.inventoryList.map((i) => i.dept).filter(Boolean))];
    this.kategoriOptions = [...new Set(this.inventoryList.map((i) => i.kategori).filter(Boolean))];
  }

  // =========================================================
  // 🔥 EXPORT EXCEL — 1 sheet gabungan, ambil detail lengkap
  // tiap asset (Profile, Hardware, Software, IP, History) dulu
  // =========================================================
  exportToExcel() {
    if (this.filteredInventory.length === 0) {
      alert('Tidak ada data untuk diexport.');
      return;
    }

    this.isExporting = true;

    const detailRequests = this.filteredInventory.map((item) =>
      this.inventoryService.getDetail(item.kodeAsset)
    );

    forkJoin(detailRequests).subscribe({
      next: (details) => {
        this.buildAndDownloadExcel(details);
        this.isExporting = false;
      },
      error: (err) => {
        console.error('Gagal mengambil detail untuk export:', err);
        alert('Gagal mengambil sebagian detail asset untuk export.');
        this.isExporting = false;
      },
    });
  }

  private buildAndDownloadExcel(details: AssetDetail[]) {
    const rows = details.map((d, i) => {
      const p = d.profile;
      const hw = d.hardwareDetail;
      const sw = d.softwareDetail;

      const riwayatTiket = d.history
        .map((h) => `${h.id_ticket} (${h.status}, ${this.formatTanggal(h.tanggal)})`)
        .join('; ') || '-';

      const riwayatPemegang = d.pemegangHistory
        .map((ph) => `${ph.nama_lama || 'Belum ada'} -> ${ph.nama_baru || 'Dilepas'} (${this.formatTanggal(ph.tanggal_pindah)})`)
        .join('; ') || '-';

      const riwayatDept = d.departmentHistory
        .map((dh) => `${dh.nama_departemen_lama || 'Belum ada'} -> ${dh.nama_departemen_baru || 'Tidak ada'} (${this.formatTanggal(dh.tanggal_pindah)})`)
        .join('; ') || '-';

      return {
        No: i + 1,
        'Kode Asset': p.kode_asset,
        'Nama Barang': p.nama_barang,
        'Merk/Model': p.merk_model,
        Departemen: p.dept,
        Kategori: p.kategori,
        Pemegang: p.pemegang || '-',
        'Status Asset': p.status_aset,
        'Computer Name': p.computer_name || '-',
        'IT Priority/No': p.it_priority || '-',
        'Tahun Perolehan': p.tahun_perolehan || '-',
        'User/Pemakai': p.user_pemakai || '-',
        Email: p.email || '-',
        Extension: p.extension || '-',
        Divisi: p.divisi || '-',
        'Gedung/Lokasi': p.gedung || '-',
        'IP Address': p.ip_address || '-',
        'Serial No PC': hw?.serial_no_pc || '-',
        'Mobo Type': hw?.mobo_type || '-',
        Kelas: hw?.kelas || '-',
        Processor: hw?.processor || '-',
        'HDD Size': hw?.hdd_size || '-',
        'HDD Model': hw?.hdd_model || '-',
        'HDD Serial No': hw?.hdd_serial_no || '-',
        'Memory Size': hw?.memory_size || '-',
        'Memory Type': hw?.memory_type || '-',
        Display: hw?.display || '-',
        'Operating System': sw?.operating_system || '-',
        'Serial No OS': sw?.serial_no_os || '-',
        'MS Office': sw?.ms_office || '-',
        'MS Office SN': sw?.ms_office_sn || '-',
        ERP: sw?.erp || 'TIDAK',
        WMS: sw?.wms || 'TIDAK',
        ERIS: sw?.eris || 'TIDAK',
        CMMS: sw?.cmms || 'TIDAK',
        Visio: sw?.visio || 'TIDAK',
        AutoCAD: sw?.autocad || 'TIDAK',
        Kaspersky: sw?.kaspersky || 'TIDAK',
        'Ms Project': sw?.ms_project || 'TIDAK',
        Acrobat: sw?.acrobat || 'TIDAK',
        'Jumlah Tiket': d.history.length,
        'Riwayat Tiket': riwayatTiket,
        'Riwayat Pemegang': riwayatPemegang,
        'Riwayat Departemen': riwayatDept,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet['!cols'] = Object.keys(rows[0] || {}).map((key) => {
      if (['Riwayat Tiket', 'Riwayat Pemegang', 'Riwayat Departemen'].includes(key)) {
        return { wch: 50 };
      }
      if (key === 'Nama Barang' || key === 'Processor') return { wch: 26 };
      return { wch: 16 };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Inventory Lengkap');

    const tanggal = new Date().toISOString().slice(0, 10);
    const namaFileFilter = this.filterDept ? `_${this.filterDept.replace(/\s+/g, '-')}` : '';
    XLSX.writeFile(workbook, `Data_Inventory_Lengkap${namaFileFilter}_${tanggal}.xlsx`);
  }

  private formatTanggal(tgl: string): string {
    if (!tgl) return '-';
    const d = new Date(tgl);
    if (isNaN(d.getTime())) return tgl;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  get filteredInventory(): Inventory[] {
    const term = this.searchTerm.trim().toLowerCase();
    const jenisAktif = this.filterJenisStats.trim().toLowerCase();
    return this.inventoryList.filter((i) => {
      const matchSearch =
        !term ||
        (i.kodeAsset && i.kodeAsset.toLowerCase().includes(term)) ||
        (i.namaBarang && i.namaBarang.toLowerCase().includes(term)) ||
        (i.pemegang && i.pemegang.toLowerCase().includes(term));
      const matchDept = !this.filterDept || i.dept === this.filterDept;
      const matchKategori = !this.filterKategori || i.kategori === this.filterKategori;
      const matchJenis = !jenisAktif || (i.namaBarang && i.namaBarang.trim().toLowerCase() === jenisAktif);
      return matchSearch && matchDept && matchKategori && matchJenis;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredInventory.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedInventory(): Inventory[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredInventory.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  private resetFormData() {
    this.formData = {
      nama_barang: '',
      merk_model: '',
      id_departemen: null,
      id_kategori: null,
      nik_pemegang: null,
      computer_name: '',
      it_priority: '',
      tahun_perolehan: null,
      user_pemakai: '',
      email: '',
      extension: '',
      divisi: '',
      gedung: '',
      ip_address: '',
      status_aset: 'Aktif',
      keterangan_pindah: '',
      keterangan_pindah_departemen: '',
    };
  }

  private resetDetailState() {
    this.activeDetailTab = 'profile';
    this.historySubTab = 'tiket';
    this.hardwareList = [];
    this.hardwareDetail = this.emptyHardwareDetail();
    this.softwareList = [];
    this.softwareDetail = this.emptySoftwareDetail();
    this.historyList = [];
    this.historyByHolder = [];
    this.expandedHolderIndex = 0;
    this.pemegangHistoryList = [];
    this.departmentHistoryList = [];
  }

  openTambahModal() {
    this.isEditing = false;
    this.selectedKode = null;
    this.resetFormData();
    this.resetDetailState();
    this.selectedDepartemenNama = '';
    this.loadKategoriList();
    this.isModalOpen = true;
  }

  openEditModal(item: Inventory) {
    this.isEditing = true;
    this.selectedKode = item.kodeAsset;
    this.resetDetailState();
    this.selectedDepartemenNama = item.dept || '';
    this.loadKategoriList();
    this.isModalOpen = true;
    this.isDetailLoading = true;

    this.inventoryService.getDetail(item.kodeAsset).subscribe({
      next: (detail) => {
        const p = detail.profile;
        this.formData = {
          nama_barang: p.nama_barang,
          merk_model: p.merk_model,
          id_departemen: p.id_departemen,
          id_kategori: p.id_kategori,
          nik_pemegang: p.nik_pemegang,
          computer_name: p.computer_name || '',
          it_priority: p.it_priority || '',
          tahun_perolehan: p.tahun_perolehan || null,
          user_pemakai: p.user_pemakai || '',
          email: p.email || '',
          extension: p.extension || '',
          divisi: p.divisi || '',
          gedung: p.gedung || '',
          ip_address: p.ip_address || '',
          status_aset: p.status_aset || 'Aktif',
          keterangan_pindah: '',
          keterangan_pindah_departemen: '',
        };
        this.selectedDepartemenNama = p.dept || '';
        this.hardwareList = detail.hardware || [];
        this.hardwareDetail = detail.hardwareDetail || this.emptyHardwareDetail();
        this.softwareList = detail.software || [];
        this.softwareDetail = detail.softwareDetail || this.emptySoftwareDetail();
        this.historyList = detail.history || [];
        this.historyByHolder = detail.historyByHolder || [];
        this.pemegangHistoryList = detail.pemegangHistory || [];
        this.departmentHistoryList = detail.departmentHistory || [];
        this.isDetailLoading = false;
      },
      error: (err) => {
        console.error('Gagal memuat detail aset:', err);
        alert('Gagal memuat detail aset');
        this.isDetailLoading = false;
      },
    });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  setDetailTab(tab: DetailTab) {
    this.activeDetailTab = tab;
  }

  setHistorySubTab(tab: HistorySubTab) {
    this.historySubTab = tab;
  }

  toggleHolderGroup(index: number) {
    this.expandedHolderIndex = this.expandedHolderIndex === index ? null : index;
  }

  onPemegangChange() {
    const selectedNik = this.formData.nik_pemegang;
    if (!selectedNik) {
      return;
    }

    const karyawan = this.karyawanList.find((k: any) => k.nik === selectedNik);
    if (!karyawan || !karyawan.departemen) {
      return;
    }

    const matchedDept = this.departemenList.find(
      (d: any) => d.namaDepartemen === karyawan.departemen
    );

    if (matchedDept) {
      this.formData.id_departemen = matchedDept.idDepartemen;
      this.selectedDepartemenNama = matchedDept.namaDepartemen;
    }
  }

  onDepartemenChange() {
    const dept = this.departemenList.find(
      (d: any) => d.idDepartemen === this.formData.id_departemen
    );
    this.selectedDepartemenNama = dept ? dept.namaDepartemen : '';
  }

  simpanInventory() {
    if (!this.formData.nama_barang || !this.formData.id_departemen || !this.formData.id_kategori) {
      alert('Nama Barang, Departemen, dan Kategori wajib diisi!');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (this.isEditing && this.selectedKode !== null) {
      this.http.put(`http://localhost:5000/api/inventory/${this.selectedKode}`, this.formData, { headers }).subscribe({
        next: () => {
          alert('Data asset berhasil diperbarui!');
          this.closeModal();
          this.loadInventory();
          this.loadStats();
        },
        error: (err) => alert('Gagal memperbarui: ' + (err.error?.message || err.message))
      });
    } else {
      this.http.post('http://localhost:5000/api/inventory', this.formData, { headers }).subscribe({
        next: () => {
          alert('Asset berhasil ditambahkan!');
          this.closeModal();
          this.loadInventory();
          this.loadStats();
          this.loadJenisOptions();
        },
        error: (err) => alert('Gagal menambah asset: ' + (err.error?.message || err.message))
      });
    }
  }

  hapusInventory(item: Inventory) {
    if (confirm(`Apakah Anda yakin ingin menghapus asset "${item.kodeAsset}" (${item.namaBarang})?`)) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`http://localhost:5000/api/inventory/${item.kodeAsset}`, { headers }).subscribe({
        next: () => {
          alert('Asset berhasil dihapus!');
          this.loadInventory();
          this.loadStats();
        },
        error: (err) => alert('Gagal menghapus: ' + (err.error?.message || err.message))
      });
    }
  }

  submitHardwareDetail() {
    if (!this.selectedKode) return;
    this.inventoryService.saveHardwareDetail(this.selectedKode, this.hardwareDetail).subscribe({
      next: () => alert('Detail hardware berhasil disimpan!'),
      error: (err) => alert('Gagal menyimpan hardware: ' + (err.error?.message || err.message)),
    });
  }

  submitSoftwareDetail() {
    if (!this.selectedKode) return;
    this.inventoryService.saveSoftwareDetail(this.selectedKode, this.softwareDetail).subscribe({
      next: () => alert('Detail software berhasil disimpan!'),
      error: (err) => alert('Gagal menyimpan software: ' + (err.error?.message || err.message)),
    });
  }

  getTicketStatusColor(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'solved') return 'success';
    if (s === 'on process') return 'warning';
    if (s === 'rejected') return 'danger';
    if (s.includes('menunggu')) return 'medium';
    return 'medium';
  }

  toggleSidebar() { 
    this.isSidebarOpen = !this.isSidebarOpen; 
  }

  setActiveMenu(menu: string) { 
    this.activeMenu = menu; 
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

  goToDashboard() { this.setActiveMenu('dashboard'); this.router.navigate(['/dashboard']); }
  goToListTicket() { this.setActiveMenu('list-ticket'); this.router.navigate(['/list']); }
  goToApprovalTicket() { this.setActiveMenu('approval-ticket'); this.router.navigate(['/approval']); }
  goToAssignmentTicket() { this.setActiveMenu('assignment-ticket'); this.router.navigate(['/assignment']); }
  goToKaryawan() { this.setActiveMenu('karyawan'); this.router.navigate(['/karyawan']); }
  goToUser() { this.setActiveMenu('user'); this.router.navigate(['/users']); }
  goToJabatan() { this.setActiveMenu('jabatan'); this.router.navigate(['/jabatan']); }
  goToDepartemen() { this.setActiveMenu('departemen'); this.router.navigate(['/departemen']); }
  goToBagianDepartemen() { this.setActiveMenu('bagian-departemen'); this.router.navigate(['/bagian-departemen']); }
  goToKategori() { this.setActiveMenu('kategori'); this.router.navigate(['/kategori']); }
  goToSubKategori() { this.setActiveMenu('sub-kategori'); this.router.navigate(['/sub-kategori']); }
  goToTeknisi() { this.setActiveMenu('teknisi'); this.router.navigate(['/teknisi']); }
  goToInventory() { this.setActiveMenu('inventory'); this.router.navigate(['/inventory']); }
  goToSchedule() { this.setActiveMenu('schedule'); this.router.navigate(['/schedule']); }
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/laporan-feedback']); }
  goToStatistikTicket() { this.setActiveMenu('statistik-ticket'); this.router.navigate(['/statistik-ticket']); }
  goToProfile() { this.setActiveMenu('profile'); this.router.navigate(['/profile']); }
  goToNotifikasi() { this.setActiveMenu('notifikasi'); }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}