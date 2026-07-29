import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface Kategori {
  id: number;
  nama: string;
}

@Component({
  selector: 'app-kategori',
  templateUrl: './kategori.page.html',
  styleUrls: ['./kategori.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class KategoriPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'kategori';

  // ===== DATA KATEGORI =====
  kategoriList: Kategori[] = [
    { id: 1, nama: 'Hardware' },
    { id: 2, nama: 'Software' },
    { id: 3, nama: 'Jaringan' },
  ];

  // ==== FILTER ====
  searchTerm = '';

  // ==== PAGINATION ====
  currentPage = 1;
  pageSize = 10;

  // ==== STATE MODAL ====
  isModalOpen = false;
  isEditing = false;
  selectedId: number | null = null;
  formData: any = {
    nama: '',
  };

  constructor(private router: Router) {}

  ngOnInit() {}

  // ===== LOGIKA FILTER & PAGINATION =====
  get filteredKategori(): Kategori[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.kategoriList;
    return this.kategoriList.filter((k) => 
      k.nama.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredKategori.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedKategori(): Kategori[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredKategori.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== FUNGSI MODAL =====
  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.formData = { nama: '' };
    this.isModalOpen = true;
  }

  openEditModal(k: Kategori) {
    this.isEditing = true;
    this.selectedId = k.id;
    this.formData = { ...k };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanKategori() {
    if (!this.formData.nama) {
      alert('Nama kategori wajib diisi!');
      return;
    }

    if (this.isEditing && this.selectedId !== null) {
      // Update data
      const index = this.kategoriList.findIndex(k => k.id === this.selectedId);
      if (index !== -1) {
        this.kategoriList[index] = { ...this.formData, id: this.selectedId };
      }
    } else {
      // Tambah data baru
      const newId = Math.max(...this.kategoriList.map(k => k.id), 0) + 1;
      this.kategoriList.push({ ...this.formData, id: newId });
    }

    this.closeModal();
    alert(this.isEditing ? 'Data kategori berhasil diperbarui!' : 'Kategori berhasil ditambahkan!');
  }

  hapusKategori(k: Kategori) {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${k.nama}"?`)) {
      this.kategoriList = this.kategoriList.filter(item => item.id !== k.id);
      this.onFilterChange();
    }
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
  goToKategori() { this.activeMenu = 'kategori'; this.router.navigate(['/kategori']); }
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