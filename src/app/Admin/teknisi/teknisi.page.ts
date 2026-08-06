import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { TeknisiService } from 'src/app/services/teknisi.service';
import { UserService } from 'src/app/services/user.service';
import { Kategori, KategoriService } from 'src/app/services/kategori.service';
import { Teknisi } from 'src/app/models/teknisi.model';

interface TeknisiFormData {
  nik: string;
  idKategori: number | null;
  status: string;
}

@Component({
  selector: 'app-teknisi',
  templateUrl: './teknisi.page.html',
  styleUrls: ['./teknisi.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TeknisiPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'teknisi';

  teknisiList: Teknisi[] = [];
  userList: any[] = [];
  kategoriList: Kategori[] = [];

  searchTerm = '';
  filterKategori = '';
  filterStatus = '';
  kategoriOptions: string[] = [];
  statusOptions: string[] = [];

  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  isEditing = false;
  selectedId: string | null = null;
  editingNamaDisplay = '';
  formData: TeknisiFormData = {
    nik: '',
    idKategori: null,
    status: 'Aktif',
  };

  constructor(
    private router: Router,
    private teknisiService: TeknisiService,
    private userService: UserService,
    private kategoriService: KategoriService
  ) {}

  ngOnInit() {
    this.loadTeknisi();
    this.loadUsers();
    this.loadKategori();
  }

  private loadTeknisi() {
    this.teknisiService.getAll().subscribe({
      next: (res: any) => {
        this.teknisiList = res?.data ?? res ?? [];
        this.buildFilterOptions();
      },
      error: (err: HttpErrorResponse) => console.error('Gagal mengambil data teknisi:', err),
    });
  }

  private loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.userList = res?.data ?? res ?? [];
      },
      error: (err: HttpErrorResponse) => console.error('Gagal mengambil data user:', err),
    });
  }

  private loadKategori() {
    this.kategoriService.getAll().subscribe({
      next: (res: any) => {
        this.kategoriList = res?.data ?? res ?? [];
      },
      error: (err: HttpErrorResponse) => console.error('Gagal mengambil data kategori:', err),
    });
  }

  private buildFilterOptions() {
    this.kategoriOptions = [...new Set(this.teknisiList.map((t) => t.kategoriSpesialis).filter((v): v is string => !!v))];
    this.statusOptions = [...new Set(this.teknisiList.map((t) => t.status).filter((v): v is string => !!v))];
  }

  get filteredTeknisi(): Teknisi[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.teknisiList.filter((t) => {
      const matchSearch = !term || t.idTeknisi.toLowerCase().includes(term) || t.nama.toLowerCase().includes(term);
      const matchKategori = !this.filterKategori || t.kategoriSpesialis === this.filterKategori;
      const matchStatus = !this.filterStatus || t.status === this.filterStatus;
      return matchSearch && matchKategori && matchStatus;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTeknisi.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedTeknisi(): Teknisi[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTeknisi.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  openTambahModal() {
    this.isEditing = false;
    this.selectedId = null;
    this.editingNamaDisplay = '';
    this.formData = { nik: '', idKategori: null, status: 'Aktif' };
    this.isModalOpen = true;
  }

  openEditModal(t: Teknisi) {
    this.isEditing = true;
    this.selectedId = t.idTeknisi;
    this.editingNamaDisplay = t.nama;

    const matched = this.kategoriList.find((k: any) => k.nama === t.kategoriSpesialis || k.nama_kategori === t.kategoriSpesialis);

    this.formData = {
      nik: '',
      idKategori: matched ? (matched.id ?? (matched as any).id_kategori) : null,
      status: t.status,
    };
    this.isModalOpen = true;
  }

  closeModal() { this.isModalOpen = false; }

  simpanTeknisi() {
    if (this.isEditing && this.selectedId !== null) {
      if (!this.formData.idKategori) {
        alert('Kategori Spesialis wajib diisi!');
        return;
      }
      this.teknisiService.update(this.selectedId, { idKategori: this.formData.idKategori, status: this.formData.status }).subscribe({
        next: () => {
          this.loadTeknisi();
          this.closeModal();
          alert('Data teknisi berhasil diperbarui!');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Gagal memperbarui teknisi:', err);
          alert(err.error?.message || 'Gagal memperbarui data.');
        },
      });
    } else {
      if (!this.formData.nik || !this.formData.idKategori) {
        alert('User dan Kategori Spesialis wajib diisi!');
        return;
      }

      this.teknisiService.create({ nik: this.formData.nik, idKategori: this.formData.idKategori }).subscribe({
        next: () => {
          this.loadTeknisi();
          this.closeModal();
          alert('Teknisi berhasil ditambahkan!');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Gagal menambah teknisi:', err);
          alert(err.error?.message || 'Gagal menambah data.');
        },
      });
    }
  }

  hapusTeknisi(t: Teknisi) {
    if (!confirm(`Apakah Anda yakin ingin menghapus teknisi "${t.nama}"?`)) return;
    this.teknisiService.remove(t.idTeknisi).subscribe({
      next: () => {
        this.loadTeknisi();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Gagal menghapus teknisi:', err);
        alert(err.error?.message || 'Gagal menghapus data.');
      },
    });
  }

  getStatusClass(status: string): string {
    return status === 'Aktif' ? 'status-aktif' : 'status-nonaktif';
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
  goToSubKategori() { this.router.navigate(['/sub-kategori']); }
  goToTeknisi() { this.activeMenu = 'teknisi'; this.router.navigate(['/teknisi']); }
  goToInventory() { this.router.navigate(['/inventory']); }
  goToLaporanFeedback() { this.setActiveMenu('laporan-feedback'); this.router.navigate(['/laporan-feedback']); }
  goToStatistikTicket() { this.router.navigate(['/statistik-ticket']); }
  goToProfile() { this.activeMenu = 'profile'; }
}