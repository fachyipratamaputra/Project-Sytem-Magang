import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface SubKategori {
  id: number;
  kategori: string;
  namaSubKategori: string;
}

@Component({
  selector: 'app-sub-kategori',
  templateUrl: './sub-kategori.page.html',
  styleUrls: ['./sub-kategori.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class SubKategoriPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'sub-kategori';

  // ===== DATA SUB KATEGORI =====
  subKategoriList: SubKategori[] = [
    { id: 1, kategori: 'Hardware', namaSubKategori: 'Laptop' },
    { id: 2, kategori: 'Hardware', namaSubKategori: 'PC' },
    { id: 3, kategori: 'Software', namaSubKategori: 'Windows' },
    { id: 4, kategori: 'Network', namaSubKategori: 'LAN' },
    { id: 5, kategori: 'Printer', namaSubKategori: 'Tinta Habis' },
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
    kategori: '',
    namaSubKategori: '',
  };

  constructor(private router: Router) {}

  ngOnInit() {}

  // ===== LOGIKA FILTER & PAGINATION =====
  get filteredSubKategori(): SubKategori[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.subKategoriList;
    return this.subKategoriList.filter((s) => 
      s.kategori.toLowerCase().includes(term) ||
      s.namaSubKategori.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSubKategori.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedSubKategori(): SubKategori[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSubKategori.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== FUNGSI MODAL =====
  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.formData = { kategori: '', namaSubKategori: '' };
    this.isModalOpen = true;
  }

  openEditModal(item: SubKategori) {
    this.isEditing = true;
    this.selectedId = item.id;
    this.formData = { ...item };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanSubKategori() {
    if (!this.formData.kategori || !this.formData.namaSubKategori) {
      alert('Kategori dan Nama Sub Kategori wajib diisi!');
      return;
    }

    if (this.isEditing && this.selectedId !== null) {
      // Update data
      const index = this.subKategoriList.findIndex(s => s.id === this.selectedId);
      if (index !== -1) {
        this.subKategoriList[index] = { ...this.formData, id: this.selectedId };
      }
    } else {
      // Tambah data baru
      const newId = Math.max(...this.subKategoriList.map(s => s.id), 0) + 1;
      this.subKategoriList.push({ ...this.formData, id: newId });
    }

    this.closeModal();
    alert(this.isEditing ? 'Data sub kategori berhasil diperbarui!' : 'Sub kategori berhasil ditambahkan!');
  }

  hapusSubKategori(item: SubKategori) {
    if (confirm(`Apakah Anda yakin ingin menghapus sub kategori "${item.namaSubKategori}" dari kategori "${item.kategori}"?`)) {
      this.subKategoriList = this.subKategoriList.filter(s => s.id !== item.id);
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
  goToKategori() { this.router.navigate(['/kategori']); }
  goToSubKategori() { this.activeMenu = 'sub-kategori'; this.router.navigate(['/sub-kategori']); }
  goToTeknisi() { this.router.navigate(['/teknisi']); }
  goToInventory() { this.router.navigate(['/inventory']); }
  
  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/laporan-feedback']); 
  }
  goToStatistikTicket() { this.activeMenu = 'statistik-ticket'; }
  goToProfile() { this.activeMenu = 'profile'; }
}