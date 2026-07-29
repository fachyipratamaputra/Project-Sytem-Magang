import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface Teknisi {
  idTeknisi: string;
  nama: string;
  kategoriSpesialis: string;
  status: string;
  jumlahTiket: number; // Dihitung otomatis sistem, bukan input manual
}

@Component({
  selector: 'app-teknisi',
  templateUrl: './teknisi.page.html',
  styleUrls: ['./teknisi.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TeknisiPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'teknisi';

  // ===== DATA TEKNISI =====
  teknisiList: Teknisi[] = [
    { idTeknisi: 'T202612020001', nama: 'Desi', kategoriSpesialis: 'Hardware', status: 'Aktif', jumlahTiket: 5 },
    { idTeknisi: 'T202612020002', nama: 'Rian', kategoriSpesialis: 'Jaringan', status: 'Aktif', jumlahTiket: 12 },
    { idTeknisi: 'T202612020003', nama: 'Budi', kategoriSpesialis: 'Software', status: 'Non-Aktif', jumlahTiket: 0 },
    { idTeknisi: 'T202612020004', nama: 'Citra', kategoriSpesialis: 'Hardware', status: 'Aktif', jumlahTiket: 8 },
  ];

  // ==== FILTER ====
  searchTerm = '';
  filterKategori = '';
  filterStatus = '';
  kategoriOptions: string[] = [];
  statusOptions: string[] = [];

  // ==== PAGINATION ====
  currentPage = 1;
  pageSize = 10;

  // ==== STATE MODAL ====
  isModalOpen = false;
  isEditing = false;
  selectedId: string | null = null;
  formData: any = {
    nama: '',
    kategoriSpesialis: '',
    status: 'Aktif',
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.buildFilterOptions();
  }

  private buildFilterOptions() {
    this.kategoriOptions = [...new Set(this.teknisiList.map((t) => t.kategoriSpesialis))];
    this.statusOptions = [...new Set(this.teknisiList.map((t) => t.status))];
  }

  // ===== LOGIKA FILTER & PAGINATION =====
  get filteredTeknisi(): Teknisi[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.teknisiList.filter((t) => {
      const matchSearch =
        !term ||
        t.idTeknisi.toLowerCase().includes(term) ||
        t.nama.toLowerCase().includes(term);
      const matchKategori = !this.filterKategori || t.kategoriSpesialis === this.filterKategori;
      const matchStatus = !this.filterStatus || t.status === this.filterStatus;
      return matchSearch && matchKategori && matchStatus;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTeknisi.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedTeknisi(): Teknisi[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTeknisi.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== FUNGSI MODAL =====
  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.formData = { nama: '', kategoriSpesialis: '', status: 'Aktif' };
    this.isModalOpen = true;
  }

  openEditModal(t: Teknisi) {
    this.isEditing = true;
    this.selectedId = t.idTeknisi;
    this.formData = { ...t };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanTeknisi() {
    if (!this.formData.nama || !this.formData.kategoriSpesialis) {
      alert('Nama dan Kategori Spesialis wajib diisi!');
      return;
    }

    if (this.isEditing && this.selectedId !== null) {
      // Update data (jaga agar jumlahTiket tetap sesuai data asli)
      const index = this.teknisiList.findIndex(t => t.idTeknisi === this.selectedId);
      if (index !== -1) {
        this.teknisiList[index].nama = this.formData.nama;
        this.teknisiList[index].kategoriSpesialis = this.formData.kategoriSpesialis;
        this.teknisiList[index].status = this.formData.status;
      }
    } else {
      // Tambah data baru - Generate ID Teknisi Otomatis
      const lastId = this.teknisiList.length > 0 
        ? parseInt(this.teknisiList[this.teknisiList.length - 1].idTeknisi.replace('T', '')) 
        : 202612020000;
      
      const newId = 'T' + (lastId + 1);
      
      const newTeknisi: Teknisi = {
        idTeknisi: newId,
        nama: this.formData.nama,
        kategoriSpesialis: this.formData.kategoriSpesialis,
        status: this.formData.status,
        jumlahTiket: 0, // Default 0
      };
      this.teknisiList.push(newTeknisi);
    }

    this.buildFilterOptions();
    this.closeModal();
    alert(this.isEditing ? 'Data teknisi berhasil diperbarui!' : 'Teknisi berhasil ditambahkan!');
  }

  hapusTeknisi(t: Teknisi) {
    if (confirm(`Apakah Anda yakin ingin menghapus teknisi "${t.nama}"?`)) {
      this.teknisiList = this.teknisiList.filter(item => item.idTeknisi !== t.idTeknisi);
      this.buildFilterOptions();
      this.onFilterChange();
    }
  }

  // ===== HELPER =====
  getStatusClass(status: string): string {
    if (status === 'Aktif') return 'status-aktif';
    if (status === 'Non-Aktif') return 'status-nonaktif';
    return 'status-default';
  }

  // ===== NAVIGASI & SIDEBAR =====
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
  goToTeknisi() { this.activeMenu = 'teknisi'; this.router.navigate(['/teknisi']); }
  goToInventory() { this.router.navigate(['/inventory']); }

  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/laporan-feedback']); 
  }  goToStatistikTicket() { this.activeMenu = 'statistik-ticket'; }
  goToProfile() { this.activeMenu = 'profile'; }
}