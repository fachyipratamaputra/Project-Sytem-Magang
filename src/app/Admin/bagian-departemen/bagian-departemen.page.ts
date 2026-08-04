import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { BagianDepartemenService } from '../../services/bagian-departemen.service';
import { DepartemenService } from '../../services/departemen.services';
import { BagianDepartemen } from '../../models/Bagian departemen.model ';

// Bentuk sederhana untuk dropdown Departemen (id + nama saja)
interface DepartemenOption {
  idDepartemen: number;
  namaDepartemen: string;
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

  bagianList: BagianDepartemen[] = [];
  private departemenIdMap: DepartemenOption[] = [];

  searchTerm = '';
  filterDepartemen = '';
  departemenOptions: string[] = [];

  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  isEditing = false;
  selectedId: number | null = null;
  formData: { departemen: string; bagian: string } = {
    departemen: '',
    bagian: '',
  };

  constructor(
    private router: Router,
    private bagianDepartemenService: BagianDepartemenService,
    private departemenService: DepartemenService
  ) {}

  ngOnInit() {
    this.loadBagianDepartemen();
    this.loadDepartemenIdMap();
  }

  private loadBagianDepartemen() {
    this.bagianDepartemenService.getAll().subscribe({
      next: (res) => {
        this.bagianList = res;
        this.buildFilterOptions();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Gagal mengambil data bagian departemen:', err);
        alert('Gagal mengambil data Bagian Departemen dari server.');
      },
    });
  }

  private loadDepartemenIdMap() {
    this.departemenService.getAll().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res ?? [];
        this.departemenIdMap = rows.map((d: any) => ({
          idDepartemen: d.id_departemen,
          namaDepartemen: d.nama_departemen,
        }));
      },
      error: (err: HttpErrorResponse) => {
        console.error('Gagal mengambil data departemen:', err);
      },
    });
  }

  private buildFilterOptions() {
    this.departemenOptions = [...new Set(this.bagianList.map((b) => b.departemen))];
  }

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

  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.formData = { departemen: '', bagian: '' };
    this.isModalOpen = true;
  }

  openEditModal(item: BagianDepartemen) {
    this.isEditing = true;
    this.selectedId = item.idBagian;
    this.formData = { departemen: item.departemen, bagian: item.bagian };
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

    const matched = this.departemenIdMap.find((d) => d.namaDepartemen === this.formData.departemen);
    if (!matched) {
      alert('Departemen tidak ditemukan / data departemen belum termuat. Coba lagi sebentar.');
      return;
    }

    const payload = {
      idDepartemen: matched.idDepartemen,
      bagian: this.formData.bagian,
    };

    if (this.isEditing && this.selectedId !== null) {
      this.bagianDepartemenService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.loadBagianDepartemen();
          this.closeModal();
          alert('Data berhasil diperbarui!');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Gagal memperbarui bagian departemen:', err);
          alert('Gagal memperbarui data. Cek console untuk detail error.');
        },
      });
    } else {
      this.bagianDepartemenService.create(payload).subscribe({
        next: () => {
          this.loadBagianDepartemen();
          this.closeModal();
          alert('Bagian berhasil ditambahkan!');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Gagal menambah bagian departemen:', err);
          alert('Gagal menambah data. Cek console untuk detail error.');
        },
      });
    }
  }

  hapusBagian(item: BagianDepartemen) {
    if (!confirm(`Apakah Anda yakin ingin menghapus bagian "${item.bagian}" dari departemen "${item.departemen}"?`)) {
      return;
    }
    this.bagianDepartemenService.remove(item.idBagian).subscribe({
      next: () => {
        this.loadBagianDepartemen();
        this.onFilterChange();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Gagal menghapus bagian departemen:', err);
        alert('Gagal menghapus data (kemungkinan masih dipakai data lain).');
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