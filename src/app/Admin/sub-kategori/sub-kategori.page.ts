import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SubKategoriService, SubKategoriRow } from '../../services/sub-kategori.service';
import { Kategori } from '../../services/kategori.service';

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

  subKategoriList: SubKategoriRow[] = [];
  kategoriOptions: Kategori[] = [];
  isLoading = false;
  loadError = '';

  searchTerm = '';

  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  isEditing = false;
  selectedId: number | null = null;
  isSaving = false;
  formData: { idKategori: number | null; namaSubKategori: string } = {
    idKategori: null,
    namaSubKategori: '',
  };

  constructor(private router: Router, private subKategoriService: SubKategoriService) {}

  ngOnInit() {
    this.loadSubKategori();
    this.subKategoriService.getKategoriOptions().subscribe({
      next: (data: Kategori[]) => (this.kategoriOptions = data),
      error: (err: any) => console.error('Gagal mengambil daftar kategori untuk dropdown', err),
    });
  }

  loadSubKategori() {
    this.isLoading = true;
    this.loadError = '';
    this.subKategoriService.getAll().subscribe({
      next: (data: SubKategoriRow[]) => {
        this.subKategoriList = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Gagal mengambil data sub kategori', err);
        this.loadError = err?.error?.message || 'Gagal memuat data sub kategori, coba lagi.';
        this.isLoading = false;
      },
    });
  }

  get filteredSubKategori(): SubKategoriRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.subKategoriList;
    return this.subKategoriList.filter(
      (s) =>
        s.kategori.toLowerCase().includes(term) ||
        s.namaSubKategori.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSubKategori.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedSubKategori(): SubKategoriRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSubKategori.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.formData = { idKategori: null, namaSubKategori: '' };
    this.isModalOpen = true;
  }

  openEditModal(item: SubKategoriRow) {
    this.isEditing = true;
    this.selectedId = item.id;
    this.formData = { idKategori: item.idKategori, namaSubKategori: item.namaSubKategori };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanSubKategori() {
    if (!this.formData.idKategori || !this.formData.namaSubKategori) {
      alert('Kategori dan Nama Sub Kategori wajib diisi!');
      return;
    }

    this.isSaving = true;

    if (this.isEditing && this.selectedId !== null) {
      this.subKategoriService.update(this.selectedId, this.formData.idKategori, this.formData.namaSubKategori).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadSubKategori();
          alert('Data sub kategori berhasil diperbarui!');
        },
        error: (err: any) => {
          this.isSaving = false;
          alert(err?.error?.message || 'Gagal memperbarui sub kategori');
        },
      });
    } else {
      this.subKategoriService.create(this.formData.idKategori, this.formData.namaSubKategori).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadSubKategori();
          alert('Sub kategori berhasil ditambahkan!');
        },
        error: (err: any) => {
          this.isSaving = false;
          alert(err?.error?.message || 'Gagal menambah sub kategori');
        },
      });
    }
  }

  hapusSubKategori(item: SubKategoriRow) {
    if (!confirm(`Apakah Anda yakin ingin menghapus sub kategori "${item.namaSubKategori}" dari kategori "${item.kategori}"?`)) return;

    this.subKategoriService.remove(item.id).subscribe({
      next: () => {
        this.loadSubKategori();
        this.onFilterChange();
      },
      error: (err: any) => {
        alert(err?.error?.message || 'Gagal menghapus sub kategori (kemungkinan masih dipakai di tiket)');
      },
    });
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