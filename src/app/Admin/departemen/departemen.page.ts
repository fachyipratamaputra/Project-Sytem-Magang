import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DepartemenService } from '../../services/departemen.services'; // sesuaikan path

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

  // ===== DATA DEPARTEMEN (dari API) =====
  departemenList: Departemen[] = [];
  isLoading = false;
  errorMessage = '';

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

  constructor(
    private router: Router,
    private departemenService: DepartemenService
  ) {}

  ngOnInit() {
    this.loadDepartemen();
  }

  // ===== AMBIL DATA DARI API =====
  loadDepartemen() {
    this.isLoading = true;
    this.errorMessage = '';

    this.departemenService.getAll().subscribe({
      next: (res: any) => {
        const rows = res?.data || [];
        this.departemenList = rows.map((row: any): Departemen => ({
          id: row.id_departemen,
          nama: row.nama_departemen,
        }));
        this.isLoading = false;
        this.onFilterChange();
      },
      error: (err: any) => {
        console.error('Gagal memuat data departemen:', err);
        this.errorMessage = 'Gagal memuat data departemen.';
        this.isLoading = false;
      }
    });
  }

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

  // ===== SIMPAN (CREATE / UPDATE) VIA API =====
  simpanDepartemen() {
    if (!this.formData.nama) {
      alert('Nama departemen wajib diisi!');
      return;
    }

    const request$ = this.isEditing && this.selectedId !== null
      ? this.departemenService.update(this.selectedId, this.formData.nama)
      : this.departemenService.create(this.formData.nama);

    request$.subscribe({
      next: () => {
        this.closeModal();
        alert(this.isEditing ? 'Data departemen berhasil diperbarui!' : 'Departemen berhasil ditambahkan!');
        this.loadDepartemen(); // refresh dari server
      },
      error: (err: any) => {
        console.error('Gagal menyimpan departemen:', err);
        alert(err?.error?.message || 'Gagal menyimpan data departemen.');
      }
    });
  }

  // ===== HAPUS VIA API =====
  hapusDepartemen(d: Departemen) {
    if (!confirm(`Apakah Anda yakin ingin menghapus departemen "${d.nama}"?`)) return;

    this.departemenService.delete(d.id).subscribe({
      next: () => {
        this.loadDepartemen();
      },
      error: (err: any) => {
        console.error('Gagal menghapus departemen:', err);
        alert(err?.error?.message || 'Gagal menghapus departemen (kemungkinan masih dipakai data lain).');
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