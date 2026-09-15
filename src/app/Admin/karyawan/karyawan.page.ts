import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  IonContent, IonButton, IonIcon, IonModal, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonInput, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { JabatanService } from '../../services/Jabatan.service';

export interface Karyawan {
  id: number;
  nik: string;
  nama: string;
  alamat: string;
  jenisKelamin: string;
  departemen: string;
  bagian: string;
  jabatan: string;
}

@Component({
  selector: 'app-karyawan',
  templateUrl: './karyawan.page.html',
  styleUrls: ['./karyawan.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonButton, IonIcon, IonModal, IonHeader, IonToolbar,
    IonTitle, IonButtons, IonInput, IonSelect, IonSelectOption
  ],
})
export class KaryawanPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'karyawan';

  private apiUrl = 'http://localhost:5000/api/karyawan';
  private apiDepartemenUrl = 'http://localhost:5000/api/master/departemen';
  private apiBagianUrl = 'http://localhost:5000/api/master/bagian-departemen';

  karyawanList: Karyawan[] = [];

  departemenMasterList: any[] = [];
  bagianMasterList: any[] = [];
  jabatanMasterList: any[] = [];

  get totalKaryawan(): number { return this.karyawanList.length; }
  get totalIT(): number { return this.karyawanList.filter(k => k.departemen === 'IT').length; }
  get totalNonIT(): number { return this.karyawanList.filter(k => k.departemen !== 'IT').length; }

  searchTerm = '';
  filterDepartemen = '';
  filterBagian = '';

  // DEPARTEMEN: Data diambil dari tabel departemen
  get departemenOptions(): string[] {
    const fromMaster = this.departemenMasterList.map(d => d.nama_departemen);
    const fromKaryawan = this.karyawanList.map(k => k.departemen);
    return [...new Set([...fromMaster, ...fromKaryawan])].filter(Boolean);
  }

  // BAGIAN (SEMUA, untuk filter toolbar tabel utama)
  get bagianOptions(): string[] {
    const fromMaster = this.bagianMasterList.map(b => b.nama_bagian);
    const fromKaryawan = this.karyawanList.map(k => k.bagian);
    return [...new Set([...fromMaster, ...fromKaryawan])].filter(Boolean);
  }

  // 🔥 BAGIAN UNTUK MODAL: ter-filter sesuai Departemen yang dipilih di form
  get filteredBagianOptions(): string[] {
    if (!this.formData.departemen) return [];
    return this.bagianMasterList
      .filter(b => b.departemen === this.formData.departemen)
      .map(b => b.nama_bagian);
  }

  // JABATAN: Data diambil dari tabel jabatan
  get jabatanOptions(): string[] {
    const fromMaster = this.jabatanMasterList.map(j => j.nama_jabatan);
    const fromKaryawan = this.karyawanList.map(k => k.jabatan);
    return [...new Set([...fromMaster, ...fromKaryawan])].filter(Boolean);
  }

  currentPage = 1;
  pageSize = 10;

  @ViewChild('modal') modal!: IonModal;
  isModalOpen = false;
  isEditing = false;
  formData: any = {
    id: null,
    nik: '',
    nama: '',
    alamat: '',
    jenisKelamin: 'Laki-laki',
    departemen: '',
    bagian: '',
    jabatan: 'Operator'
  };
  jenisKelaminOptions = ['Laki-laki', 'Perempuan'];

  isLoading = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private jabatanService: JabatanService
  ) {}

  ngOnInit() {
    this.loadDataKaryawan();
    this.loadMasterData();
  }

  loadDataKaryawan() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(this.apiUrl, { headers }).subscribe({
      next: (res) => {
        this.karyawanList = Array.isArray(res) ? res : (res.data || []);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Gagal mengambil data dari database:', err);
        this.isLoading = false;
      }
    });
  }

  loadMasterData() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(this.apiDepartemenUrl, { headers }).subscribe({
      next: (res) => {
        this.departemenMasterList = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => console.error('Gagal memuat master departemen:', err)
    });

    this.http.get<any>(this.apiBagianUrl, { headers }).subscribe({
      next: (res) => {
        this.bagianMasterList = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => console.error('Gagal memuat master bagian departemen:', err)
    });

    this.jabatanService.getAll().subscribe({
      next: (res) => {
        this.jabatanMasterList = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => console.error('Gagal memuat master jabatan:', err)
    });
  }

  get filteredKaryawan(): Karyawan[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.karyawanList.filter(k => {
      const matchSearch = !term ||
        (k.nik && k.nik.toLowerCase().includes(term)) ||
        (k.nama && k.nama.toLowerCase().includes(term)) ||
        (k.alamat && k.alamat.toLowerCase().includes(term));
      const matchDept = !this.filterDepartemen || k.departemen === this.filterDepartemen;
      const matchBagian = !this.filterBagian || k.bagian === this.filterBagian;
      return matchSearch && matchDept && matchBagian;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredKaryawan.length / this.pageSize));
  }
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  get pagedKaryawan(): Karyawan[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredKaryawan.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  openTambahModal() {
    this.isEditing = false;
    this.formData = {
      id: null,
      nik: '',
      nama: '',
      alamat: '',
      jenisKelamin: 'Laki-laki',
      departemen: '',
      bagian: '',
      jabatan: 'Operator'
    };
    this.loadMasterData();
    this.isModalOpen = true;
  }

  openEditModal(karyawan: Karyawan) {
    this.isEditing = true;
    this.formData = { ...karyawan };
    this.loadMasterData();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // 🔥 Reset pilihan Bagian setiap kali Departemen di modal diganti
  onDepartemenModalChange() {
    this.formData.bagian = '';
  }

  simpanKaryawan() {
    if (!this.formData.nama) {
      alert('Nama wajib diisi!');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (this.isEditing) {
      this.http.put(`${this.apiUrl}/${this.formData.id}`, this.formData, { headers }).subscribe({
        next: () => {
          alert('Data karyawan berhasil diperbarui!');
          this.loadDataKaryawan();
          this.closeModal();
        },
        error: (err) => alert('Gagal memperbarui data: ' + (err.error?.message || err.message))
      });
    } else {
      this.http.post(this.apiUrl, this.formData, { headers }).subscribe({
        next: () => {
          alert('Karyawan berhasil ditambahkan!');
          this.loadDataKaryawan();
          this.closeModal();
        },
        error: (err) => alert('Gagal menambah data: ' + (err.error?.message || err.message))
      });
    }
  }

  hapusKaryawan(karyawan: Karyawan) {
    if (confirm(`Apakah Anda yakin ingin menghapus karyawan "${karyawan.nama}"?`)) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`${this.apiUrl}/${karyawan.id}`, { headers }).subscribe({
        next: () => {
          alert('Karyawan berhasil dihapus!');
          this.loadDataKaryawan();
        },
        error: (err) => alert(err.error?.error || err.error?.message || 'Gagal menghapus data.')
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