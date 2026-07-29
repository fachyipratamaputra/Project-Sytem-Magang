import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface Departemen {
  id: number;
  nama: string;
}

@Component({
  selector: 'app-departemen',
  templateUrl: './departemen.page.html',
  styleUrls: ['./departemen.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class DepartemenPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'departemen';

  // ===== DATA DEPARTEMEN =====
  departemenList: Departemen[] = [
    { id: 1, nama: 'IT' },
    { id: 2, nama: 'HRD' },
    { id: 3, nama: 'Produksi' },
  ];

  // ==== STATISTIK =====
  get totalDepartemen() { return this.departemenList.length; }

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
  get filteredDepartemen(): Departemen[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.departemenList;
    return this.departemenList.filter((d) => 
      d.nama.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredDepartemen.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedDepartemen(): Departemen[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDepartemen.slice(start, start + this.pageSize);
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

  openEditModal(d: Departemen) {
    this.isEditing = true;
    this.selectedId = d.id;
    this.formData = { ...d };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanDepartemen() {
    if (!this.formData.nama) {
      alert('Nama departemen wajib diisi!');
      return;
    }

    if (this.isEditing && this.selectedId !== null) {
      // Update data
      const index = this.departemenList.findIndex(d => d.id === this.selectedId);
      if (index !== -1) {
        this.departemenList[index] = { ...this.formData, id: this.selectedId };
      }
    } else {
      // Tambah data baru
      const newId = Math.max(...this.departemenList.map(d => d.id), 0) + 1;
      this.departemenList.push({ ...this.formData, id: newId });
    }

    this.closeModal();
    alert(this.isEditing ? 'Data departemen berhasil diperbarui!' : 'Departemen berhasil ditambahkan!');
  }

  hapusDepartemen(d: Departemen) {
    if (confirm(`Apakah Anda yakin ingin menghapus departemen "${d.nama}"?`)) {
      this.departemenList = this.departemenList.filter(item => item.id !== d.id);
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
  goToDepartemen() { this.activeMenu = 'departemen'; this.router.navigate(['/departemen']); }
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