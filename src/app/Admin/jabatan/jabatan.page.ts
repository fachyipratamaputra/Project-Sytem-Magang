import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';

export interface Jabatan {
  id: number;
  nama: string;
}

@Component({
  selector: 'app-jabatan',
  templateUrl: './jabatan.page.html',
  styleUrls: ['./jabatan.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonIcon],
})
export class JabatanPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'jabatan';

  // ==== DATA JABATAN (Dummy sesuai permintaan Anda) ====
  jabatanList: Jabatan[] = [
    { id: 1, nama: 'Kepala Departemen' },
    { id: 2, nama: 'Operator' },
    { id: 3, nama: 'Kepala Regu' },
  ];

  // ==== FILTER ====
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  constructor(private router: Router) {}

  ngOnInit() {}

  // ===== LOGIKA FILTER & PAGINATION =====
  get filteredJabatan(): Jabatan[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.jabatanList;
    return this.jabatanList.filter((j) => 
      j.nama.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredJabatan.length / this.pageSize));
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedJabatan(): Jabatan[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredJabatan.slice(start, start + this.pageSize);
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // ===== FUNGSI AKSI CRUD =====
  onEdit(jabatan: Jabatan) {
    console.log(`🖊️ Mengedit jabatan: ${jabatan.nama} (ID: ${jabatan.id})`);
    // TODO: Navigasi ke halaman edit jabatan
  }

  onDelete(jabatan: Jabatan) {
    if (confirm(`Apakah Anda yakin ingin menghapus jabatan "${jabatan.nama}"?`)) {
      console.log(`🗑️ Menghapus jabatan: ${jabatan.nama}`);
      // TODO: Panggil API hapus jabatan
    }
  }

  onTambahJabatan() {
    console.log('➕ Membuka form tambah jabatan baru');
    // TODO: Navigasi ke halaman tambah jabatan
  }

  // ===== NAVIGASI & SIDEBAR =====
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
  goToKaryawan() { this.router.navigate(['/karyawan']); }
  goToUser() { this.router.navigate(['/users']); }
  goToJabatan() { this.activeMenu = 'jabatan'; this.router.navigate(['/jabatan']); }
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