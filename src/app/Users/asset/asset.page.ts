import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { AssetService } from 'src/app/services/asset.service';
import { DepartemenService } from 'src/app/services/departemen.services';
import { KategoriService } from 'src/app/services/kategori.service';
import { Asset } from 'src/app/models/asset.model';

interface DepartemenOption {
  idDepartemen: number;
  namaDepartemen: string;
}

interface AssetFormData {
  namaBarang: string;
  merkModel: string;
  idDepartemen: number | null;
  idKategori: number | null;
}

@Component({
  selector: 'app-asset',
  templateUrl: './asset.page.html',
  styleUrls: ['./asset.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AssetPage implements OnInit {
  isSidebarOpen = false;
  activeMenu = 'input-aset';

  user = {
    nama: 'User',
    role: 'users',
  };

  // ===== DATA ASET SAYA =====
  assetList: Asset[] = [];

  // ===== DATA PENDUKUNG FORM TAMBAH =====
  departemenList: DepartemenOption[] = [];
  kategoriList: any[] = [];

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  // ===== STATE MODAL TAMBAH ASET =====
  isModalOpen = false;
  formData: AssetFormData = {
    namaBarang: '',
    merkModel: '',
    idDepartemen: null,
    idKategori: null,
  };

  constructor(
    private router: Router,
    private assetService: AssetService,
    private departemenService: DepartemenService,
    private kategoriService: KategoriService
  ) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        this.user.nama = parsed.nama || 'User';
        this.user.role = parsed.role || 'users';
      } catch (e) { /* fallback */ }
    }

    this.loadMyAssets();
    this.loadDepartemenList();
    this.loadKategoriList();
  }

  private loadMyAssets() {
    this.assetService.getMyAssets().subscribe({
      next: (res: any) => { 
        this.assetList = res?.data ?? res ?? []; 
      },
      error: (err: HttpErrorResponse) => {
        console.error('Gagal mengambil data aset:', err);
        alert('Gagal mengambil data Aset Saya dari server.');
      },
    });
  }

  private loadDepartemenList() {
    this.departemenService.getAll().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res ?? [];
        this.departemenList = rows.map((d: any) => ({
          idDepartemen: d.id_departemen ?? d.idDepartemen,
          namaDepartemen: d.nama_departemen ?? d.namaDepartemen,
        }));
      },
      error: (err: HttpErrorResponse) => console.error('Gagal mengambil data departemen:', err),
    });
  }

  private loadKategoriList() {
    this.kategoriService.getAll().subscribe({
      next: (res: any) => {
        const rows = res?.data ?? res ?? [];
        // Mapping ganda agar kompatibel dengan penulisan [value]="k.idKategori" maupun [value]="k.id" di HTML
        this.kategoriList = rows.map((k: any) => ({
          id: k.id ?? k.id_kategori,
          nama: k.nama ?? k.nama_kategori,
          idKategori: k.id_kategori ?? k.id,
          namaKategori: k.nama_kategori ?? k.nama
        }));
      },
      error: (err: HttpErrorResponse) => console.error('Gagal mengambil data kategori:', err),
    });
  }

  get filteredAssets(): Asset[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.assetList;
    return this.assetList.filter((a: any) =>
      (a.kodeAsset && a.kodeAsset.toLowerCase().includes(term)) ||
      (a.namaBarang && a.namaBarang.toLowerCase().includes(term)) ||
      (a.merk && a.merk.toLowerCase().includes(term)) ||
      (a.kategori && a.kategori.toLowerCase().includes(term))
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAssets.length / this.pageSize));
  }
  get totalPagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedAssets(): Asset[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAssets.slice(start, start + this.pageSize);
  }

  onFilterChange() { this.currentPage = 1; }
  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  openTambahModal() {
    this.formData = { namaBarang: '', merkModel: '', idDepartemen: null, idKategori: null };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  simpanAset() {
    if (!this.formData.namaBarang || !this.formData.idDepartemen || !this.formData.idKategori) {
      alert('Nama Barang, Departemen, dan Kategori wajib diisi!');
      return;
    }

    this.assetService.create({
      namaBarang: this.formData.namaBarang,
      merkModel: this.formData.merkModel,
      idDepartemen: this.formData.idDepartemen,
      idKategori: this.formData.idKategori,
    }).subscribe({
      next: () => {
        this.loadMyAssets();
        this.closeModal();
        alert('Aset berhasil didaftarkan!');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Gagal mendaftarkan aset:', err);
        alert('Gagal mendaftarkan aset. Cek console untuk detail error.');
      },
    });
  }

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) this.isSidebarOpen = false;
  }

  goToDashboardUser() {
    this.setActiveMenu('dashboard-user');
    this.router.navigate(['/users/dashboard']);
  }

  goToMyTicket() {
    this.setActiveMenu('my-ticket');
    this.router.navigate(['/users/my-ticket']);
  }

  goToInputAset() {
    this.setActiveMenu('input-aset');
    this.router.navigate(['/users/input-aset']);
  }

  goToLaporanFeedback() {
    this.setActiveMenu('laporan-feedback');
    this.router.navigate(['/users/feedback']);
  }

  goToPengaturan() {
    this.setActiveMenu('pengaturan');
  }

  goToProfile() {
    this.setActiveMenu('profile');
  }

  getPageTitle(): string {
    const titles: Record<string, string> = {
      'dashboard-user': 'Dashboard User',
      'my-ticket': 'My Ticket',
      'input-aset': 'Input Aset',
      'laporan-feedback': 'Laporan Feedback',
      'pengaturan': 'Pengaturan',
    };
    return titles[this.activeMenu] ?? 'Input Aset';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}