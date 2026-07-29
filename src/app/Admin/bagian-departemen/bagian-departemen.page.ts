import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export interface BagianDepartemen {
  id: number;
  departemen: string;
  bagian: string;
}

@Component({
  selector: 'app-bagian-departemen',
  templateUrl: './bagian-departemen.page.html',
  styleUrls: ['./bagian-departemen.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class BagianDepartemenPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'bagian-departemen';

  // ===== DATA BAGIAN DEPARTEMEN =====
  bagianList: BagianDepartemen[] = [
    { id: 1, departemen: 'IT', bagian: 'Infrastruktur' },
    { id: 2, departemen: 'Finance', bagian: 'Accounting' },
    { id: 3, departemen: 'IT', bagian: 'Infrastruktur' },
  ];

  // ==== FILTER ====
  searchTerm = '';
  filterDepartemen = '';
  departemenOptions: string[] = [];

  // ==== PAGINATION ====
  currentPage = 1;
  pageSize = 10;

  // ==== STATE MODAL ====
  isModalOpen = false;
  isEditing = false;
  selectedId: number | null = null;
  formData: any = {
    departemen: '',
    bagian: '',
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.buildFilterOptions();
  }

  private buildFilterOptions() {
    this.departemenOptions = [...new Set(this.bagianList.map((b) => b.departemen))];
  }

  // ===== LOGIKA FILTER & PAGINATION =====
  get filteredBagian(): BagianDepartemen[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.bagianList.filter((b) => {
      const matchSearch =
        !term ||
        b.departemen.toLowerCase().includes(term) ||
        b.bagian.toLowerCase().includes(term);
      const matchDept = !this.filterDepartemen || b.departemen === this.filterDepartemen;
      return matchSearch && matchDept;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBagian.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedBagian(): BagianDepartemen[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBagian.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ===== FUNGSI MODAL =====
  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.formData = { departemen: '', bagian: '' };
    this.isModalOpen = true;
  }

  openEditModal(item: BagianDepartemen) {
    this.isEditing = true;
    this.selectedId = item.id;
    this.formData = { ...item };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanBagian() {
    if (!this.formData.departemen || !this.formData.bagian) {
      alert('Departemen dan Bagian wajib diisi!');
      return;
    }

    if (this.isEditing && this.selectedId !== null) {
      // Update data
      const index = this.bagianList.findIndex(b => b.id === this.selectedId);
      if (index !== -1) {
        this.bagianList[index] = { ...this.formData, id: this.selectedId };
      }
    } else {
      // Tambah data baru
      const newId = Math.max(...this.bagianList.map(b => b.id), 0) + 1;
      this.bagianList.push({ ...this.formData, id: newId });
    }

    this.buildFilterOptions();
    this.closeModal();
    alert(this.isEditing ? 'Data berhasil diperbarui!' : 'Bagian berhasil ditambahkan!');
  }

  hapusBagian(item: BagianDepartemen) {
    if (confirm(`Apakah Anda yakin ingin menghapus bagian "${item.bagian}" dari departemen "${item.departemen}"?`)) {
      this.bagianList = this.bagianList.filter(b => b.id !== item.id);
      this.buildFilterOptions();
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
  goToBagianDepartemen() { this.activeMenu = 'bagian-departemen'; this.router.navigate(['/bagian-departemen']); }
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