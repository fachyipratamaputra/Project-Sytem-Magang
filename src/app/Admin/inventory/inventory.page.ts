import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DepartemenService } from 'src/app/services/departemen.services';
import { KaryawanService } from 'src/app/services/karyawan.service';
// Jika Anda punya kategori.service.ts, import di sini:
// import { KategoriService } from 'src/app/services/kategori.service';

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
  
  // ===== DATA MASTER UNTUK DROPDOWN =====
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
    private karyawanService: KaryawanService,
    // private kategoriService: KategoriService // Uncomment jika sudah membuat service Kategori
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
    this.karyawanService.getKaryawan().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res ?? [];
        this.karyawanList = rows.map((k: any) => ({
          nik: k.nik ?? k.NIK ?? k.id_karyawan,
          namaKaryawan: k.nama_karyawan ?? k.namaKaryawan ?? k.nama,
        }));
      },
      error: (err) => console.error('Gagal memuat karyawan:', err)
    });
  }

  private loadKategoriList() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // 🔥 PERBAIKAN: Ubah URL jika backend Anda menggunakan prefix tambahan (misal: /api/master/kategori)
    // Atau jika Anda menggunakan KategoriService, ubah menjadi: this.kategoriService.getAll()...
    this.http.get<any>('http://localhost:5000/api/master/kategori', { headers }).subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res ?? [];
        this.kategoriList = rows.map((k: any) => ({
          idKategori: k.id_kategori ?? k.idKategori,
          namaKategori: k.nama_kategori ?? k.namaKategori,
        }));
        console.log('Kategori berhasil dimuat:', this.kategoriList);
      },
      error: (err) => {
        // Fallback coba endpoint alternatif jika /api/master/kategori gagal
        this.http.get<any>('http://localhost:5000/api/kategori', { headers }).subscribe({
          next: (fallbackRes: any) => {
            const rows = fallbackRes?.data ?? fallbackRes ?? [];
            this.kategoriList = rows.map((k: any) => ({
              idKategori: k.id_kategori ?? k.idKategori,
              namaKategori: k.nama_kategori ?? k.namaKategori,
            }));
          },
          error: (fallbackErr) => console.error('Gagal memuat kategori dari semua endpoint:', fallbackErr)
        });
      }
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
    this.loadKategoriList(); // Pastikan data direfresh saat modal dibuka
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
    this.loadKategoriList(); // Pastikan data direfresh saat modal dibuka
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
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

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) { this.activeMenu = menu; }

  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.router.navigate(['/list']); }
  goToApprovalTicket() { this.router.navigate(['/approval']); }
  goToAssignmentTicket() { this.router.navigate(['/assignment']); }
  goToKaryawan() { this.router.navigate(['/karyawan']); }
  goToUser() { this.router.navigate(['/users']); }
  goToJabatan() { this.router.navigate(['/jabatan']); }
  goToDepartemen() { this.router.navigate(['/departemen']); }
  goToBagianDepartemen() { this.router.navigate(['/bagian-departemen']); }
  goToKategori() { this.router.navigate(['/kategori']); }
  goToSubKategori() { this.router.navigate(['/sub-kategori']); }
  goToTeknisi() { this.router.navigate(['/teknisi']); }
  goToInventory() { this.activeMenu = 'inventory'; this.router.navigate(['/inventory']); }
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/laporan-feedback']); }
  goToStatistikTicket() { this.setActiveMenu('statistik-ticket'); this.router.navigate(['/statistik-ticket']); }
  goToProfile() { this.setActiveMenu('profile'); this.router.navigate(['/profile']); }
}