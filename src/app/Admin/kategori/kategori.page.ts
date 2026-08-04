import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { Kategori, KategoriService } from '../../services/kategori.service';

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

  kategoriList: Kategori[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  isEditing = false;
  selectedId: number | null = null;
  formData: any = {
    nama_kategori: '',
  };

  constructor(
    private router: Router,
    private kategoriService: KategoriService
  ) {}

  ngOnInit() {
    this.loadKategori();
  }

  loadKategori() {
    this.kategoriService.getAll().subscribe({
      next: (res: Kategori[]) => {
        this.kategoriList = res;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Gagal memuat data kategori:', err);
        alert('Gagal memuat data kategori dari server.');
      }
    });
  }

  get filteredKategori(): Kategori[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.kategoriList;
    return this.kategoriList.filter((k) => 
      k.nama && k.nama.toLowerCase().includes(term)
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

  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.formData = { nama_kategori: '' };
    this.isModalOpen = true;
  }

  openEditModal(k: Kategori) {
    this.isEditing = true;
    this.selectedId = k.id;
    this.formData = { nama_kategori: k.nama };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanKategori() {
    const namaVal = this.formData.nama_kategori;
    if (!namaVal) {
      alert('Nama kategori wajib diisi!');
      return;
    }

    if (this.isEditing && this.selectedId !== null) {
      this.kategoriService.update(this.selectedId, namaVal).subscribe({
        next: () => {
          alert('Data kategori berhasil diperbarui!');
          this.closeModal();
          this.loadKategori();
        },
        error: (err: HttpErrorResponse) => alert('Gagal memperbarui: ' + (err.error?.message || err.message))
      });
    } else {
      this.kategoriService.create(namaVal).subscribe({
        next: () => {
          alert('Kategori berhasil ditambahkan!');
          this.closeModal();
          this.loadKategori();
        },
        error: (err: HttpErrorResponse) => alert('Gagal menambah kategori: ' + (err.error?.message || err.message))
      });
    }
  }

  hapusKategori(k: Kategori) {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${k.nama}"?`)) {
      this.kategoriService.remove(k.id).subscribe({
        next: () => {
          alert('Kategori berhasil dihapus!');
          this.loadKategori();
        },
        error: (err: HttpErrorResponse) => alert('Gagal menghapus: ' + (err.error?.message || err.message))
      });
    }
  }

  // Navigasi Sidebar
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
  goToKategori() { this.activeMenu = 'kategori'; this.router.navigate(['/kategori']); }
  goToSubKategori() { this.router.navigate(['/sub-kategori']); }
  goToTeknisi() { this.router.navigate(['/teknisi']); }
  goToInventory() { this.router.navigate(['/inventory']); }
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/laporan-feedback']); }
  goToStatistikTicket() { this.setActiveMenu('statistik-ticket'); this.router.navigate(['/statistik-ticket']); }
  goToProfile() { this.activeMenu = 'profile'; this.router.navigate(['/profile']); }
}