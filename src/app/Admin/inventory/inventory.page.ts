import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DepartemenService } from 'src/app/services/departemen.services';
import { KaryawanService } from 'src/app/services/karyawan.service';

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
}

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

  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  isEditing = false;
  selectedKode: string | null = null;

  // 🔥 Nama departemen untuk ditampilkan sebagai teks read-only di form
  selectedDepartemenNama: string = '';

  formData: any = {
    nama_barang: '',
    merk_model: '',
    id_departemen: null,
    id_kategori: null,
    nik_pemegang: null,
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private departemenService: DepartemenService,
    private karyawanService: KaryawanService
  ) {}

  ngOnInit() {
    this.loadInventory();
    this.loadDepartemenList();
    this.loadKaryawanList();
    this.loadKategoriList();
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
            nikPemegang: item.nik_pemegang
          }));
          this.buildFilterOptions();
        }
      },
      error: (err) => console.error('Gagal memuat data inventory:', err)
    });
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

  get filteredInventory(): Inventory[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.inventoryList.filter((i) => {
      const matchSearch =
        !term ||
        (i.kodeAsset && i.kodeAsset.toLowerCase().includes(term)) ||
        (i.namaBarang && i.namaBarang.toLowerCase().includes(term)) ||
        (i.pemegang && i.pemegang.toLowerCase().includes(term));
      const matchDept = !this.filterDept || i.dept === this.filterDept;
      const matchKategori = !this.filterKategori || i.kategori === this.filterKategori;
      return matchSearch && matchDept && matchKategori;
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

  openTambahModal() {
    this.isEditing = false;
    this.selectedKode = null;
    this.formData = {
      nama_barang: '',
      merk_model: '',
      id_departemen: null,
      id_kategori: null,
      nik_pemegang: null
    };
    this.selectedDepartemenNama = '';
    this.loadKategoriList();
    this.isModalOpen = true;
  }

  openEditModal(item: Inventory) {
    this.isEditing = true;
    this.selectedKode = item.kodeAsset;
    this.formData = {
      nama_barang: item.namaBarang,
      merk_model: item.merkModel,
      id_departemen: item.idDepartemen,
      id_kategori: item.idKategori,
      nik_pemegang: item.nikPemegang
    };
    this.selectedDepartemenNama = item.dept || '';
    this.loadKategoriList();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // 🔥 Auto-isi Departemen (id + nama untuk display) begitu Pemegang Asset dipilih
  onPemegangChange() {
    const selectedNik = this.formData.nik_pemegang;
    if (!selectedNik) {
      this.formData.id_departemen = null;
      this.selectedDepartemenNama = '';
      return;
    }

    const karyawan = this.karyawanList.find((k: any) => k.nik === selectedNik);
    if (!karyawan || !karyawan.departemen) {
      this.formData.id_departemen = null;
      this.selectedDepartemenNama = '';
      return;
    }

    const matchedDept = this.departemenList.find(
      (d: any) => d.namaDepartemen === karyawan.departemen
    );

    if (matchedDept) {
      this.formData.id_departemen = matchedDept.idDepartemen;
      this.selectedDepartemenNama = matchedDept.namaDepartemen;
    } else {
      this.formData.id_departemen = null;
      this.selectedDepartemenNama = '';
    }
  }

  simpanInventory() {
    if (!this.formData.nama_barang || !this.formData.id_departemen || !this.formData.id_kategori) {
      alert('Nama Barang, Pemegang Asset (untuk menentukan Departemen), dan Kategori wajib diisi!');
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
        },
        error: (err) => alert('Gagal memperbarui: ' + (err.error?.message || err.message))
      });
    } else {
      this.http.post('http://localhost:5000/api/inventory', this.formData, { headers }).subscribe({
        next: () => {
          alert('Asset berhasil ditambahkan!');
          this.closeModal();
          this.loadInventory();
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
        },
        error: (err) => alert('Gagal menghapus: ' + (err.error?.message || err.message))
      });
    }
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
  goToSchedule() { this.setActiveMenu('schedule'); this.router.navigate(['/schedule']); } // 🛠️ Ditambahkan untuk mengatasi error TS2339
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