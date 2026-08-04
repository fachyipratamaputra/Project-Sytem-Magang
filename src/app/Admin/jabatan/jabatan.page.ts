import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { JabatanService } from '../../services/Jabatan.service'; // sesuaikan path

export interface Jabatan {
  id: number;
  nama: string;
}

@Component({
  selector: 'app-jabatan',
  templateUrl: './jabatan.page.html',
  styleUrls: ['./jabatan.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class JabatanPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'jabatan';

  // ===== DATA JABATAN (dari API) =====
  jabatanList: Jabatan[] = [];
  isLoading = false;
  errorMessage = '';

  // ==== FILTER ====
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  // ==== STATE MODAL ====
  isModalOpen = false;
  isEditing = false;
  selectedId: number | null = null;
  formData: any = {
    nama: '',
  };

  constructor(
    private router: Router,
    private jabatanService: JabatanService
  ) {}

  ngOnInit() {
    this.loadJabatan();
  }

  // ===== AMBIL DATA DARI API =====
  loadJabatan() {
    this.isLoading = true;
    this.errorMessage = '';

    this.jabatanService.getAll().subscribe({
      next: (res: any) => {
        const rows = res?.data || [];
        this.jabatanList = rows.map((row: any): Jabatan => ({
          id: row.id_jabatan,
          nama: row.nama_jabatan,
        }));
        this.isLoading = false;
        this.onFilterChange();
      },
      error: (err: any) => {
        console.error('Gagal memuat data jabatan:', err);
        this.errorMessage = 'Gagal memuat data jabatan.';
        this.isLoading = false;
      }
    });
  }

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
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedJabatan(): Jabatan[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredJabatan.slice(start, start + this.pageSize);
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

  openEditModal(j: Jabatan) {
    this.isEditing = true;
    this.selectedId = j.id;
    this.formData = { ...j };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // ===== SIMPAN (CREATE / UPDATE) VIA API =====
  simpanJabatan() {
    if (!this.formData.nama) {
      alert('Nama jabatan wajib diisi!');
      return;
    }

    const request$ = this.isEditing && this.selectedId !== null
      ? this.jabatanService.update(this.selectedId, this.formData.nama)
      : this.jabatanService.create(this.formData.nama);

    request$.subscribe({
      next: () => {
        this.closeModal();
        alert(this.isEditing ? 'Data jabatan berhasil diperbarui!' : 'Jabatan berhasil ditambahkan!');
        this.loadJabatan(); // refresh dari server
      },
      error: (err: any) => {
        console.error('Gagal menyimpan jabatan:', err);
        alert(err?.error?.message || 'Gagal menyimpan data jabatan.');
      }
    });
  }

  // ===== HAPUS VIA API =====
  hapusJabatan(j: Jabatan) {
    if (!confirm(`Apakah Anda yakin ingin menghapus jabatan "${j.nama}"?`)) return;

    this.jabatanService.delete(j.id).subscribe({
      next: () => {
        this.loadJabatan();
      },
      error: (err: any) => {
        console.error('Gagal menghapus jabatan:', err);
        alert(err?.error?.message || 'Gagal menghapus jabatan (kemungkinan masih dipakai data lain).');
      }
    });
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
  goToJabatan() { this.activeMenu = 'jabatan'; this.router.navigate(['/jabatan']); }
  goToDepartemen() { this.router.navigate(['/departemen']); }
  goToBagianDepartemen() { this.router.navigate(['/bagian-departemen']); }
  goToKategori() { this.router.navigate(['/kategori']); }
  goToSubKategori() { this.router.navigate(['/sub-kategori']); }
  goToTeknisi() { this.router.navigate(['/teknisi']); }
  goToInventory() { this.router.navigate(['/inventory']); }
  goToLaporanFeedback() { this.activeMenu = 'laporan-feedback'; }
  goToStatistikTicket() { this.activeMenu = 'statistik-ticket'; }
  goToProfile() { this.activeMenu = 'profile'; }
}