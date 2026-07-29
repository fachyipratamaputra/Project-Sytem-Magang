import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonButton, IonIcon, IonModal, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonInput, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';

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
  // ===== SIDEBAR =====
  isSidebarOpen = false;
  activeMenu = 'karyawan';

  // ===== DATA KARYAWAN =====
  karyawanList: Karyawan[] = [
    { id: 1, nik: 'KRY-001', nama: 'DESI', alamat: 'Tanggerang', jenisKelamin: 'Perempuan', departemen: 'IT', bagian: 'Software', jabatan: 'Kepala Departemen' },
    { id: 2, nik: 'KRY-002', nama: 'Dewi', alamat: 'Jakarta', jenisKelamin: 'Perempuan', departemen: 'IT', bagian: 'Software', jabatan: 'Operator' },
    { id: 3, nik: 'KRY-003', nama: 'Yulita', alamat: 'Bogor', jenisKelamin: 'Perempuan', departemen: 'PPIC', bagian: 'Lab', jabatan: 'Kepala Departemen' },
    // Data dummy tambahan agar statistik dan filter terlihat
    { id: 4, nik: 'KRY-004', nama: 'Andi', alamat: 'Bandung', jenisKelamin: 'Laki-laki', departemen: 'IT', bagian: 'Jaringan', jabatan: 'Operator' },
    { id: 5, nik: 'KRY-005', nama: 'Sari', alamat: 'Surabaya', jenisKelamin: 'Perempuan', departemen: 'HR', bagian: 'Recruitment', jabatan: 'Kepala Regu' },
  ];

  // ===== STATISTIK =====
  get totalKaryawan(): number { return this.karyawanList.length; }
  get totalIT(): number { return this.karyawanList.filter(k => k.departemen === 'IT').length; }
  get totalNonIT(): number { return this.karyawanList.filter(k => k.departemen !== 'IT').length; }

  // ===== FILTER =====
  searchTerm = '';
  filterDepartemen = '';
  filterBagian = '';

  get departemenOptions(): string[] {
    return [...new Set(this.karyawanList.map(k => k.departemen))];
  }
  get bagianOptions(): string[] {
    return [...new Set(this.karyawanList.map(k => k.bagian))];
  }

  // ===== PAGINATION =====
  currentPage = 1;
  pageSize = 10;

  // ===== MODAL =====
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
  jabatanOptions = ['Kepala Departemen', 'Operator', 'Kepala Regu'];

  // ===== LOADING =====
  isLoading = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Bisa panggil API di sini
  }

  // ===== LOGIKA FILTER & PAGINATION =====
  get filteredKaryawan(): Karyawan[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.karyawanList.filter(k => {
      const matchSearch = !term || 
        k.nik.toLowerCase().includes(term) ||
        k.nama.toLowerCase().includes(term) ||
        k.alamat.toLowerCase().includes(term);
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

  // ===== MODAL FUNCTIONS =====
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
    this.isModalOpen = true;
  }

  openEditModal(karyawan: Karyawan) {
    this.isEditing = true;
    this.formData = { ...karyawan };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanKaryawan() {
    // Validasi
    if (!this.formData.nik || !this.formData.nama) {
      alert('NIK dan Nama wajib diisi!');
      return;
    }

    if (this.isEditing) {
      // Edit data yang sudah ada
      const index = this.karyawanList.findIndex(k => k.id === this.formData.id);
      if (index !== -1) {
        this.karyawanList[index] = { ...this.formData };
      }
    } else {
      // Tambah data baru (generate ID baru)
      const newId = Math.max(...this.karyawanList.map(k => k.id), 0) + 1;
      this.karyawanList.push({ ...this.formData, id: newId });
    }

    this.closeModal();
    this.onFilterChange(); // Reset pagination
  }

  hapusKaryawan(karyawan: Karyawan) {
    if (confirm(`Apakah Anda yakin ingin menghapus karyawan "${karyawan.nama}"?`)) {
      this.karyawanList = this.karyawanList.filter(k => k.id !== karyawan.id);
      this.onFilterChange();
    }
  }

  // ===== SIDEBAR NAVIGATION =====
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }
  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToListTicket() { this.router.navigate(['/list']); }
  goToApprovalTicket() { this.router.navigate(['/approval']); }
  goToAssignmentTicket() { this.router.navigate(['/assignment']); }
  goToKaryawan() { this.activeMenu = 'karyawan'; this.router.navigate(['/karyawan']); }
  goToUser() { this.router.navigate(['/users']); }
  goToJabatan() { this.router.navigate(['/jabatan']); }
  goToDepartemen() { this.router.navigate(['/departemen']); }
  goToBagianDepartemen() { this.router.navigate(['/bagian-departemen']); }
  goToKategori() { this.router.navigate(['/kategori']); }
  goToSubKategori() { this.router.navigate(['/sub-kategori']); }
  goToTeknisi() { this.router.navigate(['/teknisi']); }
  goToInventory() { this.router.navigate(['/inventory']); }
  
  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/laporan-feedback']); 
  }
  goToStatistikTicket() { this.activeMenu = 'statistik-ticket'; }
  goToProfile() { this.activeMenu = 'profile'; }
}